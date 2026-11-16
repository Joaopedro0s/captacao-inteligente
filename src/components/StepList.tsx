import type { Step } from "@/lib/types";
import { IconCheck, IconMinus, IconX } from "./Icons";

const STATUS = {
  ok: { text: "ok", icon: IconCheck, dot: "border-line-strong text-text", label: "text-muted" },
  erro: { text: "erro", icon: IconX, dot: "border-danger/60 text-danger", label: "text-danger" },
  pulada: { text: "pulada", icon: IconMinus, dot: "border-line text-muted", label: "text-muted" },
  pendente: { text: "aguardando", icon: null, dot: "border-line text-muted", label: "text-muted" },
  executando: {
    text: "executando",
    icon: null,
    dot: "border-accent text-accent motion-safe:animate-[step-pulse_1.2s_ease-in-out_infinite]",
    label: "text-accent",
  },
} as const;

/** Linha do tempo das etapas como stepper vertical. Texto puro: o React escapa tudo que vem do banco. */
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="text-sm">
      {steps.map((step, i) => {
        const s = STATUS[step.status] ?? STATUS.pulada;
        const Icon = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute left-[11px] top-7 bottom-1 w-px bg-line" />}
            <span
              aria-hidden="true"
              className={`relative grid size-6 shrink-0 place-items-center rounded-full border bg-surface-2 transition-colors duration-300 ${s.dot}`}
            >
              {Icon ? <Icon className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className={step.status === "pendente" ? "text-muted" : "text-text"}>{step.label}</span>
                <span className={`text-xs ${s.label}`}>{step.status === "ok" && step.fallback ? "ok (padrão)" : s.text}</span>
                {step.ms > 0 && <span className="ml-auto font-mono text-xs text-muted">{step.ms} ms</span>}
              </div>
              {step.detail && <p className="mt-0.5 break-words text-xs text-muted">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
