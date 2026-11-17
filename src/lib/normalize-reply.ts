/**
 * Arruma quebras de linha da resposta gerada para exibir no card: linhas em branco repetidas
 * viram uma só e quebras simples dentro de um parágrafo viram espaço.
 */
export function normalizeReply(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.replace(/[ \t]*\n[ \t]*/g, " ").replace(/[ \t]{2,}/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}
