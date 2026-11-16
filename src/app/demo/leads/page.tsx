import type { Metadata } from "next";
import Link from "next/link";
import { DemoBanner } from "@/components/DemoBanner";
import { LeadsPanel } from "@/components/LeadsPanel";

export const metadata: Metadata = {
  title: "Painel da automação · Captação Inteligente (demo)",
  description: "Leads fictícios chegando em tempo real, classificados por IA.",
};

export default function LeadsPage() {
  return (
    <>
      <DemoBanner showPanelLink={false} />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Lume <span className="font-normal text-muted">Estética Automotiva</span>
          </Link>
          <Link href="/#orcamento" className="text-sm text-accent hover:underline">
            Fazer um pedido pelo site
          </Link>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 focus:outline-none">
        <h1 className="text-3xl font-semibold tracking-tight">Painel da automação</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Cada pedido passa por validação, classificação por IA, gravação no banco, resposta personalizada e avisos por
          e-mail. Aqui você vê o resultado de cada etapa. A classificação e a resposta são geradas pelo Google Gemini
          (plano gratuito). Os exemplos são fictícios; pedidos enviados por visitantes aparecem com nome abreviado,
          e-mail e telefone mascarados e mensagem encurtada, e no modo demo nenhum e-mail sai para o endereço digitado.
        </p>
        <div className="mt-8">
          <LeadsPanel />
        </div>
      </main>
    </>
  );
}
