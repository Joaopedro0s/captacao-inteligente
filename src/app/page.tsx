import Link from "next/link";
import { AutomationPreview } from "@/components/AutomationPreview";
import { DemoBanner } from "@/components/DemoBanner";
import { Faq } from "@/components/Faq";
import {
  IconClassify,
  IconDatabase,
  IconDroplet,
  IconForm,
  IconHeadlight,
  IconLayers,
  IconPolish,
  IconSeat,
  IconSend,
  IconShield,
} from "@/components/Icons";
import { LeadForm } from "@/components/LeadForm";
import { SiteHeader } from "@/components/SiteHeader";

const services = [
  {
    name: "Lavagem detalhada",
    icon: IconDroplet,
    text: "Limpeza técnica de pintura, rodas, caixas de roda e acabamentos, com produtos de pH neutro.",
  },
  {
    name: "Polimento técnico",
    icon: IconPolish,
    text: "Correção de riscos de lavagem, marcas e oxidação para recuperar brilho e profundidade da cor.",
  },
  {
    name: "Vitrificação de pintura",
    icon: IconShield,
    text: "Camada cerâmica que protege contra raios UV, chuva ácida e sujeira, e facilita as próximas lavagens.",
  },
  {
    name: "Higienização interna",
    icon: IconSeat,
    text: "Bancos, carpetes, teto e dutos de ar: remoção de manchas, odores e ácaros.",
  },
  {
    name: "Película de proteção (PPF)",
    icon: IconLayers,
    text: "Filme transparente contra pedras e riscos nas áreas mais expostas: capô, para-choque e retrovisores.",
  },
  {
    name: "Revitalização de faróis",
    icon: IconHeadlight,
    text: "Remoção do amarelamento e da opacidade das lentes, com selagem de proteção contra raios UV.",
  },
];

const howItWorks = [
  { title: "Formulário", icon: IconForm, text: "O pedido chega pelo site, validado no navegador e no servidor." },
  {
    title: "Classificação por IA",
    icon: IconClassify,
    text: "A IA marca o lead como quente, morno ou frio e explica o motivo.",
  },
  { title: "Banco de dados", icon: IconDatabase, text: "O lead é salvo com a classificação e o status de cada etapa." },
  {
    title: "Resposta e aviso",
    icon: IconSend,
    text: "O cliente recebe uma resposta personalizada e a equipe, um resumo.",
  },
];

const stats = [
  { value: "1.200+", label: "carros atendidos" },
  { value: "4,9", label: "nota média" },
  { value: "8", label: "anos de oficina" },
];

const testimonials = [
  {
    quote: "Pedi orçamento à noite e de manhã já tinha resposta com horário. O polimento ficou impecável.",
    name: "Cliente fictício · Hatch prata",
  },
  {
    quote: "Explicaram com calma a diferença entre vitrificação e cera. Sem empurrar serviço que eu não precisava.",
    name: "Cliente fictícia · SUV preto",
  },
  {
    quote: "Higienização tirou o cheiro de cigarro que o carro usado tinha. Vendi bem mais fácil.",
    name: "Cliente fictício · Sedan branco",
  },
];

const faq = [
  {
    q: "Quanto tempo o carro fica com vocês?",
    a: "Depende do serviço e do estado do veículo. Uma lavagem detalhada leva algumas horas; polimento e vitrificação costumam exigir mais tempo. Informamos o prazo após a avaliação.",
  },
  {
    q: "Preciso agendar?",
    a: "Sim. Envie o formulário de orçamento e respondemos com os horários disponíveis.",
  },
  {
    q: "Vocês passam preço pelo formulário?",
    a: "Damos uma estimativa só depois de avaliar o carro, porque o estado da pintura muda o trabalho necessário.",
  },
  {
    q: "Vitrificação substitui a cera?",
    a: "A vitrificação dura bem mais que a cera e protege melhor, mas pede manutenção com lavagens adequadas.",
  },
  {
    q: "O que acontece com meus dados?",
    a: "Usamos seus dados apenas para responder ao orçamento. Nesta demonstração, a mensagem é analisada pelo Google Gemini (plano gratuito, que pode usar o conteúdo para melhorar produtos) e nenhum e-mail é enviado ao endereço informado. Por isso, não use dados reais.",
  },
];

const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const section = "border-t border-line py-20 sm:py-28";
const h2 = "font-display text-4xl uppercase leading-none tracking-wide sm:text-5xl";
// Branco do tema a 80% (#ccc, 13:1 sobre o fundo): mais claro que o texto secundário, sem cor nova.
const eyebrow = "text-sm font-medium text-text/80";

export default function Home() {
  return (
    <>
      <DemoBanner />
      <SiteHeader
        links={[
          { href: "#como-funciona", label: "Como funciona" },
          { href: "#servicos", label: "Serviços" },
          { href: "#faq", label: "Dúvidas" },
          { href: "#orcamento", label: "Orçamento", primary: true },
        ]}
      />

      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <section className={`${container} grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <p className={eyebrow}>Estética automotiva · São Paulo</p>
            <h1 className="mt-4 font-display text-6xl uppercase leading-[0.92] tracking-wide sm:text-7xl">
              Cuidado técnico para a pintura e o interior do seu carro
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Lavagem detalhada, polimento, vitrificação e higienização feitos com método. Peça um orçamento e receba
              uma resposta em minutos, inclusive fora do horário comercial.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#orcamento"
                className="rounded-lg bg-accent px-6 py-3.5 font-medium text-accent-ink transition-colors hover:bg-accent-hover"
              >
                Pedir orçamento
              </a>
              <Link
                href="/demo/leads"
                className="rounded-lg border border-line-strong px-6 py-3.5 font-medium transition-colors hover:border-accent"
              >
                Ver a automação ao vivo
              </Link>
            </div>
          </div>
          <AutomationPreview />
        </section>

        <section id="como-funciona" aria-labelledby="como-funciona-titulo" className={section}>
          <div className={container}>
            <p className={eyebrow}>O que acontece depois do envio</p>
            <h2 id="como-funciona-titulo" className={`mt-3 ${h2}`}>
              Como funciona
            </h2>
            <ol className="mt-12 grid gap-0 md:grid-cols-4 md:gap-8">
              {howItWorks.map((step, i) => {
                const Icon = step.icon;
                const last = i === howItWorks.length - 1;
                return (
                  <li key={step.title} className="relative flex gap-5 pb-10 md:block md:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className="absolute left-6 top-14 bottom-2 w-px bg-line md:left-16 md:right-[-1rem] md:top-6 md:bottom-auto md:h-px md:w-auto"
                      />
                    )}
                    <span className="relative grid size-12 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-text">
                      <Icon className="size-5" />
                    </span>
                    <div className="md:mt-6">
                      <p className="font-mono text-xs text-muted">0{i + 1}</p>
                      <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted">{step.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="servicos" aria-labelledby="servicos-titulo" className={section}>
          <div className={container}>
            <p className={eyebrow}>O que fazemos</p>
            <h2 id="servicos-titulo" className={`mt-3 ${h2}`}>
              Serviços
            </h2>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => {
                const Icon = s.icon;
                return (
                  <li
                    key={s.name}
                    className="rounded-xl border border-line bg-surface p-7 transition-colors hover:border-line-strong"
                  >
                    <Icon className="size-6 text-muted" />
                    <h3 className="mt-6 text-lg font-medium">{s.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section aria-labelledby="prova-titulo" className={section}>
          <div className={container}>
            <p className={eyebrow}>Depoimentos e números fictícios, criados para esta demonstração</p>
            <h2 id="prova-titulo" className={`mt-3 ${h2}`}>
              Quem já passou por aqui
            </h2>
            <dl className="mt-12 grid grid-cols-3 divide-x divide-line border-y border-line">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col px-3 py-8 text-center sm:px-6">
                  <dt className="mt-2 text-xs text-muted sm:text-sm">{s.label}</dt>
                  <dd className="order-first font-mono text-3xl font-medium sm:text-5xl">{s.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.name} className="rounded-xl border border-line bg-surface p-7">
                  <figure>
                    <blockquote className="leading-relaxed">“{t.quote}”</blockquote>
                    <figcaption className="mt-5 text-sm text-muted">{t.name}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-titulo" className={section}>
          <div className={`${container} grid gap-10 lg:grid-cols-[1fr_2fr]`}>
            <div>
              <p className={eyebrow}>Antes de pedir</p>
              <h2 id="faq-titulo" className={`mt-3 ${h2}`}>
                Dúvidas frequentes
              </h2>
            </div>
            <Faq items={faq} />
          </div>
        </section>

        <section id="orcamento" aria-labelledby="orcamento-titulo" className={section}>
          <div className={`${container} grid gap-10 lg:grid-cols-[1fr_2fr]`}>
            <div>
              <p className={eyebrow}>Resposta em minutos</p>
              <h2 id="orcamento-titulo" className={`mt-3 ${h2}`}>
                Pedir orçamento
              </h2>
              <p className="mt-6 text-muted">
                Ao enviar, uma automação classifica o pedido com IA, salva no sistema, gera uma resposta personalizada e
                avisa a equipe. Tudo em poucos segundos.
              </p>
              <p className="mt-4 text-sm text-muted">Todos os campos são obrigatórios.</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className={`${container} flex flex-col gap-3 py-10 text-sm text-muted sm:flex-row sm:justify-between`}>
          <p>Lume Estética Automotiva é uma empresa fictícia. Projeto de portfólio.</p>
          <p className="flex flex-wrap gap-x-4">
            <Link href="/demo/leads" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text">
              Painel de leads (demo)
            </Link>
            <a
              href="https://github.com/Joaopedro0s/captacao-inteligente"
              className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text"
            >
              Código no GitHub
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
