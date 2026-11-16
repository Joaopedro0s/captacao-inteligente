import type { Step } from "./types";

/**
 * Únicos textos de detalhe que podem chegar ao front. O erro real (provedor, request_id,
 * cobrança, stack) vai só para o log do servidor.
 */
export const STEP_MESSAGES = {
  aiUnavailableClassification: "IA indisponível; usada a classificação padrão (morno).",
  aiInvalidFormat: "Resposta da IA fora do formato; usada a classificação padrão (morno).",
  aiUnavailableReply: "IA indisponível; usado o texto padrão.",
  replyFiltered: "A resposta citava preço ou prazo; trocada pelo texto padrão.",
  dbFailed: "Falha ao gravar no banco.",
  emailFailed: "Falha no envio do e-mail.",
  emailSkipped: "Envio de e-mail não configurado nesta demonstração.",
  timedOut: "Tempo esgotado.",
} as const;

const ALLOWED = new Set<string>(Object.values(STEP_MESSAGES));

const GENERIC: Record<Step["status"], string | undefined> = {
  ok: undefined,
  erro: "Falha nesta etapa.",
  pulada: "Etapa não executada.",
  pendente: undefined,
  executando: undefined,
};

/** Defesa em profundidade: qualquer detalhe fora da lista é trocado por um texto genérico. */
export function publicSteps(steps: Step[]): Step[] {
  return steps.map(({ key, label, status, detail, fallback, ms }) => ({
    key,
    label,
    status,
    ms,
    ...(fallback && { fallback: true }),
    detail: detail && ALLOWED.has(detail) ? detail : GENERIC[status],
  }));
}
