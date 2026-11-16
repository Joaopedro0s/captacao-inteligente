import { describe, expect, it } from "vitest";
import { expireSteps, leadStatus } from "@/lib/lead-status";
import { publicSteps, STEP_MESSAGES } from "@/lib/step-messages";
import type { Step, StepStatus } from "@/lib/types";

const KEYS: Step["key"][] = ["validacao", "classificacao", "gravacao", "resposta", "email_cliente", "email_equipe"];
const steps = (...statuses: StepStatus[]): Step[] =>
  statuses.map((status, i) => ({ key: KEYS[i], label: KEYS[i], status, ms: 10 }));

describe("leadStatus", () => {
  it("fica em PROCESSANDO enquanto há etapa aguardando ou executando, mesmo com erro antes", () => {
    expect(leadStatus(steps("ok", "ok", "ok", "executando", "pendente", "pendente"))).toBe("PROCESSANDO");
    expect(leadStatus(steps("ok", "erro", "ok", "ok", "executando", "executando"))).toBe("PROCESSANDO");
  });

  it("só vira PARCIAL quando uma etapa terminou com erro e nada mais está rodando", () => {
    expect(leadStatus(steps("ok", "ok", "ok", "ok", "erro", "ok"))).toBe("PARCIAL");
  });

  it("é COMPLETO quando todas concluíram; etapa pulada conta como concluída", () => {
    expect(leadStatus(steps("ok", "ok", "ok", "ok", "ok", "ok"))).toBe("COMPLETO");
    expect(leadStatus(steps("ok", "ok", "ok", "ok", "pulada", "pulada"))).toBe("COMPLETO");
  });
});

describe("expireSteps", () => {
  it("marca a etapa travada como erro de tempo esgotado e o lead como PARCIAL", () => {
    const expired = expireSteps(steps("ok", "ok", "ok", "executando", "pendente", "pendente"));
    expect(expired[3]).toMatchObject({ status: "erro", detail: STEP_MESSAGES.timedOut });
    expect(expired.slice(4).map((s) => s.status)).toEqual(["pulada", "pulada"]);
    expect(expired.slice(0, 3).map((s) => s.status)).toEqual(["ok", "ok", "ok"]);
    expect(leadStatus(expired)).toBe("PARCIAL");
  });

  it("a mensagem de tempo esgotado passa pelo filtro público", () => {
    const [stuck] = publicSteps(expireSteps(steps("executando")));
    expect(stuck.detail).toBe("Tempo esgotado.");
  });
});
