import Link from "next/link";
import { DemoBanner } from "@/components/DemoBanner";
import { LeadForm } from "@/components/LeadForm";

const services = [
  {
    name: "Lavagem detalhada",
    text: "Limpeza técnica de pintura, rodas, caixas de roda e acabamentos, com produtos de pH neutro.",
  },
  {
    name: "Polimento técnico",
    text: "Correção de riscos de lavagem, marcas e oxidação para recuperar brilho e profundidade da cor.",
  },
  {
    name: "Vitrificação de pintura",
    text: "Camada cerâmica que protege contra raios UV, chuva ácida e sujeira, e facilita as próximas lavagens.",
  },
  {
    name: "Higienização interna",
    text: "Bancos, carpetes, teto e dutos de ar: remoção de manchas, odores e ácaros.",
  },
  {
    name: "Película de proteção (PPF)",
    text: "Filme transparente contra pedras e riscos nas áreas mais expostas: capô, para-choque e retrovisores.",
  },
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
    a: "Usamos seus dados apenas para responder ao orçamento. Nesta demonstração, nenhum e-mail é enviado ao endereço informado.",
  },
];

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        Pular para o conteúdo
      </a>
      <DemoBanner />

      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Lume <span className="font-normal text-muted">Estética Automotiva</span>
          </Link>
          <nav aria-label="Principal">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <li>
                <a href="#servicos" className="hover:text-text">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-text">
                  Dúvidas
                </a>
              </li>
              <li>
                <a href="#orcamento" className="text-accent hover:underline">
                  Orçamento
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="conteudo" className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">São Paulo · Zona Oeste</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Cuidado técnico para a pintura e o interior do seu carro.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Lavagem detalhada, polimento, vitrificação e higienização feitos com método. Peça um orçamento e receba
            uma resposta em minutos, inclusive fora do horário comercial.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#orcamento" className="rounded-md bg-accent px-5 py-3 font-semibold text-accent-ink">
              Pedir orçamento
            </a>
            <Link href="/demo/leads" className="rounded-md border border-line px-5 py-3 font-medium hover:border-muted">
              Ver a automação ao vivo
            </Link>
          </div>
        </section>

        <section id="servicos" aria-labelledby="servicos-titulo" className="border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 id="servicos-titulo" className="text-2xl font-semibold tracking-tight">
              Serviços
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <li key={s.name} className="rounded-lg border border-line bg-surface p-5">
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted">{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="prova-titulo" className="border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 id="prova-titulo" className="text-2xl font-semibold tracking-tight">
              Quem já passou por aqui
            </h2>
            <p className="mt-2 text-sm text-muted">Depoimentos fictícios, criados para esta demonstração.</p>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 text-center">
              <div className="flex flex-col">
                <dt className="text-xs text-muted sm:text-sm">carros atendidos</dt>
                <dd className="order-first text-2xl font-semibold sm:text-3xl">1.200+</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted sm:text-sm">nota média</dt>
                <dd className="order-first text-2xl font-semibold sm:text-3xl">4,9</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted sm:text-sm">anos de oficina</dt>
                <dd className="order-first text-2xl font-semibold sm:text-3xl">8</dd>
              </div>
            </dl>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.name} className="rounded-lg border border-line bg-surface p-5">
                  <figure>
                    <blockquote className="text-sm leading-relaxed">“{t.quote}”</blockquote>
                    <figcaption className="mt-3 text-xs text-muted">{t.name}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-titulo" className="border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h2 id="faq-titulo" className="text-2xl font-semibold tracking-tight">
              Dúvidas frequentes
            </h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <span aria-hidden="true" className="text-muted group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="orcamento" aria-labelledby="orcamento-titulo" className="border-t border-line">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 id="orcamento-titulo" className="text-2xl font-semibold tracking-tight">
                Pedir orçamento
              </h2>
              <p className="mt-3 text-sm text-muted">
                Ao enviar, uma automação classifica o pedido com IA, salva no sistema, gera uma resposta personalizada
                e avisa a equipe. Tudo em poucos segundos.
              </p>
              <p className="mt-3 text-sm text-muted">Todos os campos são obrigatórios.</p>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>Lume Estética Automotiva é uma empresa fictícia. Projeto de portfólio.</p>
          <p>
            <Link href="/demo/leads" className="underline underline-offset-2 hover:text-text">
              Painel da automação
            </Link>
            {" · "}
            <a
              href="https://github.com/Joaopedro0s/captacao-inteligente"
              className="underline underline-offset-2 hover:text-text"
            >
              Código no GitHub
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
