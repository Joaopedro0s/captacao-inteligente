import type { Metadata } from "next";
import { DemoBanner } from "@/components/DemoBanner";
import { LeadsPanel } from "@/components/LeadsPanel";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Painel da automação · Captação Inteligente (demo)",
  description: "Leads fictícios chegando em tempo real, classificados por IA.",
};

export default function LeadsPage() {
  return (
    <>
      <DemoBanner showPanelLink={false} />
      <SiteHeader links={[{ href: "/#orcamento", label: "Fazer um pedido pelo site", primary: true }]} />
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 focus:outline-none sm:px-6 sm:py-20">
        <p className="text-sm font-medium text-muted">Demonstração ao vivo</p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-wide sm:text-6xl">
          Painel da automação
        </h1>
        <p className="mt-6 max-w-3xl leading-relaxed text-muted">
          Cada pedido passa por validação, classificação por IA, gravação no banco, resposta personalizada e avisos por
          e-mail. Aqui você vê o resultado de cada etapa. A classificação e a resposta são geradas pelo Google Gemini
          (plano gratuito). Os exemplos são fictícios; pedidos enviados por visitantes aparecem com nome abreviado,
          e-mail e telefone mascarados e mensagem encurtada, e no modo demo nenhum e-mail sai para o endereço digitado.
        </p>
        <div className="mt-10">
          <LeadsPanel />
        </div>
      </main>
    </>
  );
}
