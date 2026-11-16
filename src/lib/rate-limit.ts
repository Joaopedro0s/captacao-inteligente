import { createHash } from "node:crypto";
import { config } from "./config";
import { prisma } from "./db";

export type LimitDecision =
  | { ok: true }
  | { ok: false; reason: "ip" | "global"; message: string; retryAfterSec: number };

const HOUR_MS = 3_600_000;

export const startOfUtcDay = (now: Date) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

/** Regra pura (testável): o limite global vem antes, para nunca chamar a IA depois da cota do dia. */
export function evaluateLimits(
  counts: { ipLastHour: number; globalToday: number },
  limits: { perHour: number; perDay: number },
  now: Date,
): LimitDecision {
  if (counts.globalToday >= limits.perDay) {
    const tomorrow = startOfUtcDay(now).getTime() + 24 * HOUR_MS;
    return {
      ok: false,
      reason: "global",
      message:
        "A demonstração atingiu o limite de pedidos de hoje. Volte amanhã ou veja os leads já processados no painel.",
      retryAfterSec: Math.ceil((tomorrow - now.getTime()) / 1000),
    };
  }
  if (counts.ipLastHour >= limits.perHour) {
    return {
      ok: false,
      reason: "ip",
      message: `Você já enviou ${limits.perHour} pedidos na última hora. Tente de novo mais tarde.`,
      retryAfterSec: 3600,
    };
  }
  return { ok: true };
}

export function hashIp(ip: string, salt = config.ipHashSalt) {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Na Vercel, o primeiro IP de x-forwarded-for é o do cliente (o proxy da Vercel sobrescreve o cabeçalho). */
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "desconhecido";
}

/** Conta no banco (compartilhado entre todas as funções serverless) e registra o pedido se estiver liberado. */
export async function checkAndRecord(ipHash: string, now = new Date()): Promise<LimitDecision> {
  const [ipLastHour, globalToday] = await Promise.all([
    prisma.requestLog.count({ where: { ipHash, createdAt: { gte: new Date(now.getTime() - HOUR_MS) } } }),
    prisma.requestLog.count({ where: { createdAt: { gte: startOfUtcDay(now) } } }),
  ]);
  const decision = evaluateLimits(
    { ipLastHour, globalToday },
    { perHour: config.rateLimitPerHour, perDay: config.dailyLeadLimit },
    now,
  );
  // shortcut: contar e inserir não é atômico; rajadas simultâneas podem passar 1–2 pedidos do limite.
  // Se virar problema, trocar por um contador com UPDATE ... RETURNING ou Upstash Ratelimit.
  if (decision.ok) await prisma.requestLog.create({ data: { ipHash } });
  return decision;
}
