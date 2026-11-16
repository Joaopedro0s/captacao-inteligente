import { beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "@/lib/config";

// Contagem do dia controlada pelo teste; a regra de decisão é a real (evaluateLimits).
let globalToday = 0;

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkAndRecord: vi.fn(async () =>
      actual.evaluateLimits(
        { ipLastHour: 0, globalToday },
        { perHour: config.rateLimitPerHour, perDay: config.dailyLeadLimit },
        new Date(),
      ),
    ),
  };
});
vi.mock("@/lib/ai", () => ({ classifyLead: vi.fn(), generateReply: vi.fn() }));
vi.mock("@/lib/pipeline", () => ({
  processLead: vi.fn(async () => ({ leadId: "x", status: "COMPLETO", temperature: "MORNO", steps: [] })),
}));

const { POST } = await import("@/app/api/lead/route");
const { processLead } = await import("@/lib/pipeline");
const { classifyLead, generateReply } = await import("@/lib/ai");

const request = () =>
  new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
    body: JSON.stringify({
      name: "Ana Souza",
      phone: "(11) 90000-0101",
      email: "ana@example.com",
      service: "Polimento técnico",
      message: "Quero polir o carro antes da viagem.",
      consent: true,
    }),
  });

describe("teto diário global de leads", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ao atingir o limite, responde 429 com mensagem amigável e não chama a IA", async () => {
    globalToday = config.dailyLeadLimit;

    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/limite de pedidos de hoje/);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(processLead).not.toHaveBeenCalled();
    expect(classifyLead).not.toHaveBeenCalled();
    expect(generateReply).not.toHaveBeenCalled();
  });

  it("um pedido abaixo do limite segue para a automação", async () => {
    globalToday = config.dailyLeadLimit - 1;

    const res = await POST(request());

    expect(res.status).toBe(200);
    expect(processLead).toHaveBeenCalledOnce();
  });
});
