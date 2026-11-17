import { describe, expect, it } from "vitest";
import { normalizeReply } from "@/lib/normalize-reply";

describe("normalizeReply", () => {
  it("junta quebras simples dentro do mesmo parágrafo", () => {
    expect(normalizeReply("Olá, Ana.\nRecebemos seu pedido.\nEquipe Lume.")).toBe(
      "Olá, Ana. Recebemos seu pedido. Equipe Lume.",
    );
  });

  it("colapsa linhas vazias repetidas em uma só separação de parágrafo", () => {
    expect(normalizeReply("Olá, Ana.\n\n\n  \nRecebemos seu pedido.\r\n\r\nEquipe Lume.")).toBe(
      "Olá, Ana.\n\nRecebemos seu pedido.\n\nEquipe Lume.",
    );
  });

  it("remove espaços sobrando e mantém um texto já correto igual", () => {
    expect(normalizeReply("  Olá,  Ana.   Equipe Lume.  \n\n")).toBe("Olá, Ana. Equipe Lume.");
    const ok = "Olá, Ana. Vitrificar protege a pintura. Equipe Lume.";
    expect(normalizeReply(ok)).toBe(ok);
  });
});
