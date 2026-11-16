import { describe, expect, it } from "vitest";
import { fieldErrorsOf, leadSchema, MESSAGE_MAX } from "@/lib/lead-schema";

const valid = {
  name: "  Marina Toledo ",
  phone: "(11) 90000-0101",
  email: "marina@example.com",
  service: "Polimento técnico",
  message: "Quero polir o carro antes da viagem.",
  consent: true,
};

const errorsFor = (input: unknown) => {
  const r = leadSchema.safeParse(input);
  return r.success ? {} : fieldErrorsOf(r.error);
};

describe("leadSchema", () => {
  it("aceita um pedido válido e remove espaços das pontas", () => {
    const r = leadSchema.parse(valid);
    expect(r.name).toBe("Marina Toledo");
  });

  it("descarta campos desconhecidos (ex.: honeypot)", () => {
    expect(leadSchema.parse({ ...valid, website: "x" })).not.toHaveProperty("website");
  });

  it("exige consentimento LGPD explícito", () => {
    expect(errorsFor({ ...valid, consent: false }).consent).toBeDefined();
    expect(errorsFor({ ...valid, consent: "true" }).consent).toBeDefined();
  });

  it("rejeita e-mail inválido", () => {
    expect(errorsFor({ ...valid, email: "marina@" }).email).toEqual(["E-mail inválido."]);
  });

  it.each(["1234", "(11) 9000", "abc-defg-hijk", "+55 11 90000-0101 ramal 2"])("rejeita telefone %s", (phone) => {
    expect(errorsFor({ ...valid, phone }).phone).toBeDefined();
  });

  it("aceita telefone com DDI", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "+55 (11) 90000-0101" }).success).toBe(true);
  });

  it("só aceita serviços da lista", () => {
    expect(errorsFor({ ...valid, service: "Troca de óleo" }).service).toEqual(["Escolha um serviço."]);
  });

  it("limita o tamanho da mensagem", () => {
    expect(errorsFor({ ...valid, message: "a".repeat(MESSAGE_MAX + 1) }).message).toBeDefined();
    expect(errorsFor({ ...valid, message: "curta" }).message).toBeDefined();
  });

  it("mensagens de campo ausente em português", () => {
    const errors = errorsFor({});
    expect(errors.name).toEqual(["Informe seu nome."]);
    expect(errors.phone).toEqual(["Campo obrigatório."]);
    expect(errors.email).toEqual(["Informe seu e-mail."]);
  });
});
