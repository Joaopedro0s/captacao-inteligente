"use client";

import { useId, useState } from "react";
import { IconChevron } from "./Icons";

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
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium hover:text-muted"
              >
                {item.q}
                <IconChevron className={`size-5 shrink-0 text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="pb-5">
              <p className="max-w-2xl leading-relaxed text-muted">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
