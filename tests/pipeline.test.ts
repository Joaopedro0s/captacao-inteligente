import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeadlineError } from "@/lib/retry";

const db = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
const ai = vi.hoisted(() => ({ generateReply: vi.fn() }));

vi.mock("@/lib/ai", () => ({
  FALLBACK_CLASSIFICATION: { temperature: "MORNO", reason: "classificação indisponível" },
  classifyLead: vi.fn(async () => ({ temperature: "QUENTE", reason: "Quer agendar." })),
  generateReply: ai.generateReply,
  fallbackReply: (name: string) => `Olá, ${name}. Texto padrão. Equipe Lume.`,
}));
vi.mock("@/lib/db", () => ({ prisma: { lead: { create: db.create, update: db.update } } }));
vi.mock("@/lib/email", () => ({ resolveRecipient: () => ({ skip: "teste" }), sendEmail: vi.fn() }));

const { processLead } = await import("@/lib/pipeline");
const { STEP_MESSAGES } = await import("@/lib/step-messages");

const lead = {
  name: "Ana Souza",
  phone: "(11) 90000-0101",
  email: "ana@example.com",
  service: "Polimento técnico" as const,
  message: "Quero polir o carro antes da viagem.",
  consent: true as const,
};
const validation = { key: "validacao", label: "Validação e limites", status: "ok", ms: 1 } as const;

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  db.create.mockReset().mockResolvedValue({ id: "lead_1" });
  db.update.mockReset().mockResolvedValue({});
  ai.generateReply.mockReset();
});

describe("processLead", () => {
  it("grava o lead enquanto a resposta ainda está sendo gerada (em paralelo)", async () => {
    let createdBeforeReply = false;
    ai.generateReply.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 20));
      createdBeforeReply = db.create.mock.calls.length === 1;
      return { text: "Olá, Ana. Resposta da IA. Equipe Lume.", fallback: null };
    });

    const result = await processLead(lead, validation);

    expect(createdBeforeReply).toBe(true);
    const created = db.create.mock.calls[0][0].data;
    expect(created.status).toBe("PROCESSANDO");
    expect(created.steps.map((s: { status: string }) => s.status)).toEqual(["ok", "ok", "ok", "executando", "pendente", "pendente"]);
    expect(result.status).toBe("COMPLETO");
    expect(db.update.mock.calls.at(-1)?.[0].data.status).toBe("COMPLETO");
  });

  it("IA acima de 8 s: usa o texto padrão, marca 'ok (padrão)' e não derruba o fluxo", async () => {
    ai.generateReply.mockRejectedValue(new DeadlineError("resposta: passou de 8000 ms"));

    const result = await processLead(lead, validation);

    const reply = result.steps.find((s) => s.key === "resposta");
    expect(reply).toMatchObject({ status: "ok", fallback: true, detail: STEP_MESSAGES.replySlow });
    expect(result.status).toBe("COMPLETO");
    expect(db.update.mock.calls.at(-1)?.[0].data.reply).toBe("Olá, Ana Souza. Texto padrão. Equipe Lume.");
  });
});
