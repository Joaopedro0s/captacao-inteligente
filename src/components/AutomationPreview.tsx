"use client";

import { useEffect, useState } from "react";
import { TemperatureBadge } from "./Badges";
import type { Step } from "@/lib/types";
import { StepList } from "./StepList";

// Dados fictícios. Os tempos imitam uma execução real da automação.
const STEPS: Omit<Step, "status">[] = [
  { key: "validacao", label: "Validação e limites", ms: 14 },
  { key: "classificacao", label: "Classificação por IA", ms: 812 },
  { key: "gravacao", label: "Gravação no banco", ms: 18 },
  { key: "resposta", label: "Resposta personalizada", ms: 846 },
  { key: "email_cliente", label: "E-mail ao cliente", ms: 61 },
  { key: "email_equipe", label: "Aviso à equipe", ms: 58 },
];
const DONE = STEPS.length;
const STEP_MS = 750;
const HOLD_MS = 3500;

/** Prévia da automação com os mesmos componentes do painel. Com movimento reduzido, mostra o estado final. */
export function AutomationPreview() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const id = setTimeout(() => setProgress(DONE), 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setProgress((p) => (p >= DONE ? 0 : p + 1)), progress >= DONE ? HOLD_MS : STEP_MS);
    return () => clearTimeout(id);
  }, [progress]);

  const steps: Step[] = STEPS.map((s, i) => ({
    ...s,
    ms: i < progress ? s.ms : 0,
    status: i < progress ? "ok" : i === progress ? "executando" : "pendente",
  }));
  const classified = progress >= 2;

  return (
    <figure className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <figcaption className="mb-4 flex items-center justify-between gap-3 text-xs text-muted">
        <span>Prévia da automação · dados fictícios</span>
        <span className="font-mono">{progress >= DONE ? "concluído" : "processando"}</span>
      </figcaption>
      {/* A animação é ilustrativa: leitores de tela recebem só a legenda acima. */}
      <div aria-hidden="true" className="rounded-lg border border-line bg-surface-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-medium">Paula A.</span>
          <span className={`transition-opacity duration-300 ${classified ? "opacity-100" : "opacity-0"}`}>
            <TemperatureBadge value="QUENTE" />
          </span>
          <span className="ml-auto font-mono text-xs text-muted">agora</span>
        </div>
        <p className="mt-1 text-sm text-muted">Vitrificação de pintura</p>
        <p className="mt-3 border-l-2 border-line pl-3 text-sm">
          Peguei meu carro zero ontem e quero vitrificar antes da viagem do feriado. Posso deixar com vocês amanhã cedo?
        </p>
        <p
          className={`mt-3 text-xs text-muted transition-opacity duration-300 ${classified ? "opacity-100" : "opacity-0"}`}
        >
          IA: carro novo, serviço definido e pedido de horário.
        </p>
        <div className="mt-4 border-t border-line pt-4">
          <StepList steps={steps} />
        </div>
      </div>
    </figure>
  );
}
