"use client";

import { useId, useState } from "react";
import { IconChevron } from "./Icons";

/**
 * Acordeão acessível: título com botão real, aria-expanded e aria-controls apontando para o painel.
 * Várias respostas podem ficar abertas. A altura anima com grid-template-rows (0fr ↔ 1fr), sem salto
 * de layout, e a animação desliga com prefers-reduced-motion. Fechada, a resposta fica inert:
 * fora da ordem de tabulação e dos leitores de tela.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const expanded = open.has(i);
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
                onClick={() => toggle(i)}
                className="flex min-h-11 w-full items-center justify-between gap-4 rounded-md py-5 text-left text-lg font-medium hover:text-muted"
              >
                {item.q}
                <IconChevron
                  className={`size-5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!expanded}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-5 leading-relaxed text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
