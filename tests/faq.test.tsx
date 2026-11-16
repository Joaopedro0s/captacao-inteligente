// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Faq } from "@/components/Faq";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const items = [
  { q: "Pergunta um?", a: "Resposta um." },
  { q: "Pergunta dois?", a: "Resposta dois." },
];

let container: HTMLDivElement;
afterEach(() => container?.remove());

function render() {
  container = document.createElement("div");
  document.body.append(container);
  act(() => createRoot(container).render(<Faq items={items} />));
  return [...container.querySelectorAll("button")];
}

const panelOf = (button: HTMLButtonElement) => document.getElementById(button.getAttribute("aria-controls")!)!;

describe("Faq", () => {
  it("cada pergunta é um <button> com aria-controls apontando para o painel da resposta", () => {
    const buttons = render();
    expect(buttons).toHaveLength(2);
    for (const [i, button] of buttons.entries()) {
      expect(button.type).toBe("button");
      expect(button.getAttribute("aria-expanded")).toBe("false");
      const panel = panelOf(button);
      expect(panel.textContent).toBe(items[i].a);
      expect(panel.hidden).toBe(true);
      expect(panel.getAttribute("aria-labelledby")).toBe(button.id);
    }
  });

  it("abre e fecha atualizando aria-expanded, e só uma resposta fica aberta", () => {
    const [first, second] = render();
    act(() => first.click());
    expect(first.getAttribute("aria-expanded")).toBe("true");
    expect(panelOf(first).hidden).toBe(false);

    act(() => second.click());
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");

    act(() => second.click());
    expect(second.getAttribute("aria-expanded")).toBe("false");
    expect(panelOf(second).hidden).toBe(true);
  });
});
