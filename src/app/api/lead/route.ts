import { config } from "@/lib/config";
import { fieldErrorsOf, leadSchema } from "@/lib/lead-schema";
import { processLead } from "@/lib/pipeline";
import { checkAndRecord, clientIp, hashIp } from "@/lib/rate-limit";
import type { LeadResponse } from "@/lib/types";

const fail = (status: number, error: string, extra: Partial<Extract<LeadResponse, { ok: false }>> = {}, headers?: HeadersInit) =>
  Response.json({ ok: false, error, ...extra } satisfies LeadResponse, { status, headers });

export async function POST(request: Request) {
  const started = performance.now();

  // 1a. Tamanho do corpo: corta payloads grandes antes de qualquer parse.
  const raw = await request.text();
  if (raw.length > config.maxBodyBytes) return fail(413, "Pedido grande demais. Encurte a mensagem.");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "Formato inválido.");
  }

  // 1b. Honeypot preenchido = bot. Responde sucesso falso e não gasta IA nem banco.
  const honeypot = (body as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return Response.json({ ok: true, leadId: null, status: "COMPLETO", temperature: "FRIO", steps: [] } satisfies LeadResponse);
  }

  // 1c. Mesmo schema do formulário.
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "Revise os campos destacados.", { fieldErrors: fieldErrorsOf(parsed.error) });
  }

  // 1d. Rate limit por IP e cota diária global. Sem conseguir checar, não chama a IA (falha fechada).
  try {
    const decision = await checkAndRecord(hashIp(clientIp(request.headers)));
    if (!decision.ok) return fail(429, decision.message, {}, { "Retry-After": String(decision.retryAfterSec) });
  } catch (err) {
    console.error("lead: falha ao checar limites", err);
    return fail(503, "Serviço temporariamente indisponível. Tente novamente em alguns minutos.");
  }

  const result = await processLead(parsed.data, {
    key: "validacao",
    label: "Validação e limites",
    status: "ok",
    ms: Math.round(performance.now() - started),
  });
  return Response.json({ ok: true, ...result } satisfies LeadResponse);
}
