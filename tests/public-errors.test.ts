import { beforeEach, describe, expect, it, vi } from "vitest";

// Erro realista de provedor: billing, request_id, nome do provedor e stack.
const providerError = new Error(
  'Gemini 400: {"type":"error","error":{"message":"Your credit balance is too low to access the Anthropic API"},"request_id":"req_011Ch75SNjTTXcCxJf9kQP1r"}',
);

vi.mock("@/lib/ai", () => ({
  FALLBACK_CLASSIFICATION: { temperature: "MORNO", reason: "classificação indisponível" },
  classifyLead: vi.fn(() => Promise.reject(providerError)),
  generateReply: vi.fn(() => Promise.reject(providerError)),
  fallbackReply: (name: string) => `Olá, ${name}.`,
}));
vi.mock("@/lib/db", () => ({
  prisma: { lead: { create: vi.fn(async () => ({ id: "lead_1" })), update: vi.fn(async () => ({})) } },
}));
vi.mock("@/lib/email", () => ({
  resolveRecipient: () => ({ to: "demo@example.com" }),
  sendEmail: vi.fn(() => Promise.reject(new Error("Resend: API key is invalid (re_123)"))),
}));

const { processLead } = await import("@/lib/pipeline");
const { publicSteps, STEP_MESSAGES } = await import("@/lib/step-messages");

const LEAKS = /req_|request_id|credit|billing|anthropic|gemini|resend|re_123|api key|\bat\s+\S+\s+\(|Error:/i;

const lead = {
  name: "Ana Souza",
  phone: "(11) 90000-0101",
  email: "ana@example.com",
  service: "Polimento técnico" as const,
  message: "Quero polir o carro antes da viagem.",
  consent: true as const,
};

describe("erros de provedores nunca chegam ao cliente", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("o pipeline grava só mensagens genéricas e manda o erro real ao log", async () => {
    const result = await processLead(lead, { key: "validacao", label: "Validação e limites", status: "ok", ms: 1 });

    expect(JSON.stringify(result)).not.toMatch(LEAKS);
    const detail = (key: string) => result.steps.find((s) => s.key === key)?.detail;
    expect(detail("classificacao")).toBe(STEP_MESSAGES.aiUnavailableClassification);
    expect(detail("resposta")).toBe(STEP_MESSAGES.aiUnavailableReply);
    expect(detail("email_cliente")).toBe(STEP_MESSAGES.emailFailed);
    // O erro real vai ao log do servidor, resumido à 1ª linha.
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Gemini 400"));
  });

  it("publicSteps troca qualquer detalhe fora da lista, inclusive de registros antigos", () => {
    const old = publicSteps([
      { key: "classificacao", label: "Classificação por IA", status: "erro", ms: 174, detail: providerError.message },
      { key: "email_cliente", label: "E-mail ao cliente", status: "pulada", ms: 0, detail: "modo demo sem DEMO_RECIPIENT configurado" },
      { key: "gravacao", label: "Gravação no banco", status: "erro", ms: 3, detail: "PrismaClientKnownRequestError\n    at Object.create (db.ts:1:1)" },
      { key: "resposta", label: "Resposta personalizada", status: "ok", ms: 800, detail: STEP_MESSAGES.replyFiltered },
    ]);
    expect(JSON.stringify(old)).not.toMatch(LEAKS);
    expect(old.map((s) => s.detail)).toEqual([
      "Falha nesta etapa.",
      "Etapa não executada.",
      "Falha nesta etapa.",
      STEP_MESSAGES.replyFiltered,
    ]);
  });
});

describe("log do servidor", () => {
  it("não grava os dados da consulta que o Prisma repete na mensagem de erro", async () => {
    const { describeError } = await import("@/lib/log");
    const prismaError = Object.assign(
      new Error('\nInvalid `prisma.lead.create()` invocation:\n\n{\n  data: {\n    message: "Quero polir o carro antes da viagem."\n  }\n}\n\nArgument `consentAt` is missing.'),
      { name: "PrismaClientValidationError" },
    );
    const line = describeError(prismaError);
    expect(line).toBe("PrismaClientValidationError: Invalid `prisma.lead.create()` invocation:");
    expect(line).not.toContain("Quero polir");
  });
});
