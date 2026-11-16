import type { Temperature } from "@/lib/types";

// Rótulo em texto sempre presente: a cor reforça, não carrega sozinha a informação.
const TEMPERATURE = {
  QUENTE: { label: "Quente", className: "bg-accent text-accent-ink border-accent" },
  MORNO: { label: "Morno", className: "border-accent text-accent" },
  FRIO: { label: "Frio", className: "border-line text-muted" },
} as const;

const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

export function TemperatureBadge({ value }: { value: Temperature }) {
  const t = TEMPERATURE[value];
  return <span className={`${base} ${t.className}`}>{t.label}</span>;
}

export function StatusBadge({ value }: { value: "COMPLETO" | "PARCIAL" }) {
  return value === "COMPLETO" ? (
    <span className={`${base} border-line text-muted`}>Completo</span>
  ) : (
    <span className={`${base} border-danger/60 text-danger`}>Parcial</span>
  );
}
