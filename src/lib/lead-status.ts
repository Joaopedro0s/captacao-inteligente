import { STEP_MESSAGES } from "./step-messages";
import type { LeadStatus, Step } from "./types";

/** Depois disso, um lead ainda em PROCESSANDO é tratado como travado (ex.: a função serverless caiu). */
export const STUCK_AFTER_MS = 60_000;

const running = (s: Step) => s.status === "pendente" || s.status === "executando";

/**
 * Regra única de estados: PROCESSANDO enquanto alguma etapa não terminou; depois,
 * PARCIAL se alguma terminou com erro e COMPLETO se todas concluíram ("pulada" conta como concluída).
 */
export function leadStatus(steps: Step[]): LeadStatus {
  if (steps.some(running)) return "PROCESSANDO";
  return steps.some((s) => s.status === "erro") ? "PARCIAL" : "COMPLETO";
}

/** Lead travado: a etapa em curso vira erro "Tempo esgotado." e as que nem começaram, puladas. */
export function expireSteps(steps: Step[]): Step[] {
  const stuck = steps.findIndex(running);
  return steps.map((s, i) =>
    i === stuck
      ? { ...s, status: "erro", detail: STEP_MESSAGES.timedOut }
      : running(s)
        ? { ...s, status: "pulada", detail: undefined }
        : s,
  );
}
