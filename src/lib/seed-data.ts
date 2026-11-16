import type { Prisma } from "@/generated/prisma/client";
import { STEP_MESSAGES } from "./step-messages";
import type { Step } from "./types";

// Dados 100% fictícios: nomes inventados, e-mails em example.com e telefones fora de uso.
// Quatro exemplos, um de cada estado que o painel sabe mostrar: quente, morno, frio e parcial.
const steps = (ms: number[], emailClienteFalhou = false): Step[] => [
  { key: "validacao", label: "Validação e limites", status: "ok", ms: ms[0] },
  { key: "classificacao", label: "Classificação por IA", status: "ok", ms: ms[1] },
  { key: "gravacao", label: "Gravação no banco", status: "ok", ms: ms[2] },
  { key: "resposta", label: "Resposta personalizada", status: "ok", ms: ms[3] },
  emailClienteFalhou
    ? { key: "email_cliente", label: "E-mail ao cliente", status: "erro", detail: STEP_MESSAGES.emailFailed, ms: ms[4] }
    : { key: "email_cliente", label: "E-mail ao cliente", status: "ok", ms: ms[4] },
  { key: "email_equipe", label: "Aviso à equipe", status: "ok", ms: ms[5] },
];

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

export function seedLeads(): Prisma.LeadCreateManyInput[] {
  return [
    {
      createdAt: hoursAgo(2),
      consentAt: hoursAgo(2),
      name: "Marina Toledo",
      phone: "(11) 90000-0101",
      email: "marina.toledo@example.com",
      service: "Vitrificação de pintura",
      message:
        "Comprei um SUV zero km semana passada e quero vitrificar antes de começar a usar na estrada. Consigo levar já no sábado, qual o próximo horário livre?",
      temperature: "QUENTE",
      reason: "Carro novo, serviço de alto valor já definido e disponibilidade imediata para agendar.",
      reply:
        "Olá, Marina. Vitrificar logo no início é a melhor forma de proteger a pintura do carro novo. Nossa equipe vai entrar em contato para combinar a avaliação e confirmar a disponibilidade de agenda. Equipe Lume.",
      status: "COMPLETO",
      steps: steps([12, 840, 35, 910, 410, 380]),
    },
    {
      createdAt: hoursAgo(5),
      consentAt: hoursAgo(5),
      name: "Rafael Nunes",
      phone: "(11) 90000-0102",
      email: "rafael.nunes@example.com",
      service: "Polimento técnico",
      message:
        "Meu sedan tem bastante risco de lavagem e a cor perdeu o brilho. Queria entender se o polimento resolve e quanto tempo o carro fica com vocês.",
      temperature: "MORNO",
      reason: "Problema claro e serviço identificado, mas o cliente ainda está avaliando antes de decidir.",
      reply:
        "Olá, Rafael. Riscos de lavagem e perda de brilho costumam responder bem ao polimento técnico, mas o processo certo depende do estado da pintura. Podemos fazer uma avaliação sem compromisso para indicar o melhor caminho. Equipe Lume.",
      status: "COMPLETO",
      steps: steps([10, 790, 31, 880, 390, 402]),
    },
    {
      createdAt: hoursAgo(9),
      consentAt: hoursAgo(9),
      name: "Beatriz Campos",
      phone: "(21) 90000-0103",
      email: "beatriz.campos@example.com",
      service: "Lavagem detalhada",
      message: "Vocês atendem aos domingos? Só queria saber para o futuro.",
      temperature: "FRIO",
      reason: "Pergunta genérica, sem serviço definido nem intenção de agendar.",
      reply:
        "Olá, Beatriz. Recebemos sua mensagem. Para indicarmos o serviço adequado, conte um pouco mais: modelo do carro, estado atual e o que você gostaria de melhorar. Equipe Lume.",
      status: "COMPLETO",
      steps: steps([9, 710, 29, 760, 375, 366]),
    },
    {
      createdAt: hoursAgo(20),
      consentAt: hoursAgo(20),
      name: "Diego Ferraz",
      phone: "(31) 90000-0104",
      email: "diego.ferraz@example.com",
      service: "Higienização interna",
      message:
        "Vou vender o carro mês que vem e preciso deixar o interior impecável: bancos de tecido manchados e cheiro de cigarro.",
      temperature: "QUENTE",
      reason: "Necessidade concreta, com motivação clara e prazo definido pela venda do veículo.",
      reply:
        "Olá, Diego. A higienização interna trata manchas em bancos de tecido e ajuda bastante com odores. Nossa equipe vai entrar em contato para combinar a avaliação do carro. Equipe Lume.",
      status: "PARCIAL",
      steps: steps([11, 905, 33, 930, 3120, 395], true),
    },
  ];
}
