import type { LeadStatus, Temperature } from "@/lib/types";

// Rótulo em texto sempre presente: a cor reforça, não carrega sozinha a informação.
const TEMPERATURE = {
  QUENTE: { label: "Quente", className: "border-accent-solid bg-accent-solid text-text" },
  MORNO: { label: "Morno", className: "border-accent text-accent" },
  FRIO: { label: "Frio", className: "border-line-strong text-muted" },
} as const;

const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

export function TemperatureBadge({ value }: { value: Temperature }) {
  const t = TEMPERATURE[value];
  return <span className={`${base} ${t.className}`}>{t.label}</span>;
}

export function StatusBadge({ value }: { value: LeadStatus }) {
  if (value === "PROCESSANDO") {
    return (
      <span className={`${base} gap-1.5 border-line-strong text-text`}>
        {/* Indicador sutil; parado com prefers-reduced-motion. */}
        <span aria-hidden="true" className="size-1.5 rounded-full bg-muted motion-safe:animate-pulse" />
        Processando
      </span>
    );
  }
  return value === "COMPLETO" ? (
    <span className={`${base} border-line-strong text-muted`}>Completo</span>
  ) : (
    <span className={`${base} border-danger/60 text-danger`}>Parcial</span>
  );
}
