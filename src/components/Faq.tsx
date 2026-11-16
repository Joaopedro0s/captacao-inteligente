"use client";

import { useId, useState } from "react";

/** Acordeão acessível: título com botão real, aria-expanded e aria-controls apontando para o painel. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const expanded = open === i;
        const buttonId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium"
              >
                {item.q}
                <span aria-hidden="true" className={`shrink-0 text-muted transition-transform motion-reduce:transition-none ${expanded ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="pb-4">
              <p className="text-sm text-muted">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
