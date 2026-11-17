// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
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
const isOpen = (button: HTMLButtonElement) =>
  button.getAttribute("aria-expanded") === "true" && !panelOf(button).hasAttribute("inert");

describe("Faq", () => {
  it("cada pergunta é um <button> com aria-controls apontando para o painel da resposta", () => {
    const buttons = render();
    expect(buttons).toHaveLength(2);
    for (const [i, button] of buttons.entries()) {
      expect(button.type).toBe("button");
      expect(button.getAttribute("aria-expanded")).toBe("false");
      const panel = panelOf(button);
      expect(panel.textContent).toBe(items[i].a);
      expect(panel.getAttribute("role")).toBe("region");
      expect(panel.getAttribute("aria-labelledby")).toBe(button.id);
      // Fechada, a resposta sai da tabulação e dos leitores de tela.
      expect(panel.hasAttribute("inert")).toBe(true);
    }
  });

  it("abre e fecha por clique, e várias respostas podem ficar abertas", async () => {
    const user = userEvent.setup();
    const [first, second] = render();

    await act(() => user.click(first));
    await act(() => user.click(second));
    expect(isOpen(first)).toBe(true);
    expect(isOpen(second)).toBe(true);

    await act(() => user.click(first));
    expect(isOpen(first)).toBe(false);
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(isOpen(second)).toBe(true);
  });

  it("funciona só com teclado: Tab, Enter e Espaço", async () => {
    const user = userEvent.setup();
    const [first, second] = render();

    await act(() => user.tab());
    expect(document.activeElement).toBe(first);
    await act(() => user.keyboard("{Enter}"));
    expect(isOpen(first)).toBe(true);
    await act(() => user.keyboard(" "));
    expect(isOpen(first)).toBe(false);

    // Com a primeira fechada, o Tab vai direto para a próxima pergunta (a resposta fechada é inert).
    await act(() => user.tab());
    expect(document.activeElement).toBe(second);
    await act(() => user.keyboard(" "));
    expect(isOpen(second)).toBe(true);
  });
});
