import type { Step } from "@/lib/types";

const STATUS = {
  ok: { mark: "✓", text: "ok", className: "text-accent" },
  erro: { mark: "✕", text: "erro", className: "text-danger" },
  pulada: { mark: "–", text: "pulada", className: "text-muted" },
} as const;

/** Linha do tempo das etapas da automação. Texto puro: o React escapa tudo que vem do banco. */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-2 text-sm">
      {steps.map((step) => {
        const s = STATUS[step.status] ?? STATUS.pulada;
        return (
          <li key={step.key} className="flex gap-3">
            <span aria-hidden="true" className={`w-4 shrink-0 text-center font-mono ${s.className}`}>
              {s.mark}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span>{step.label}</span>
                <span className={`text-xs ${s.className}`}>{s.text}</span>
                {step.ms > 0 && <span className="font-mono text-xs text-muted">{step.ms} ms</span>}
              </div>
              {step.detail && <p className="break-words text-xs text-muted">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
