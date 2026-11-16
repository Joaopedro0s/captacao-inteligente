import type { Prisma } from "@/generated/prisma/client";
import { STEP_MESSAGES } from "./step-messages";
import type { Step } from "./types";

// Dados 100% fictícios: nomes inventados, e-mails em example.com e telefones fora de uso.
const allOk = (ms: number[]): Step[] => [
  { key: "validacao", label: "Validação e limites", status: "ok", ms: ms[0] },
  { key: "classificacao", label: "Classificação por IA", status: "ok", ms: ms[1] },
  { key: "gravacao", label: "Gravação no banco", status: "ok", ms: ms[2] },
  { key: "resposta", label: "Resposta personalizada", status: "ok", ms: ms[3] },
  { key: "email_cliente", label: "E-mail ao cliente", status: "ok", ms: ms[4] },
  { key: "email_equipe", label: "Aviso à equipe", status: "ok", ms: ms[5] },
];

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

export function seedLeads(): Prisma.LeadCreateManyInput[] {
  return [
    {
      createdAt: hoursAgo(2),
      name: "Marina Toledo",
      phone: "(11) 90000-0101",
      email: "marina.toledo@example.com",
      service: "Vitrificação de pintura",
      message:
        "Comprei um SUV zero km semana passada e quero vitrificar antes de começar a usar na estrada. Consigo levar já no sábado, qual o próximo horário livre?",
      temperature: "QUENTE",
      reason: "Carro novo, serviço de alto valor definido e disponibilidade imediata para agendar.",
      reply:
        "Olá, Marina! Parabéns pelo carro novo. A vitrificação logo no início é a melhor hora para proteger a pintura. Vou verificar a agenda de sábado e te retorno ainda hoje com os horários disponíveis. Equipe Lume.",
      status: "COMPLETO",
      steps: allOk([12, 1840, 35, 2210, 410, 380]),
      consentAt: hoursAgo(2),
    },
    {
      createdAt: hoursAgo(5),
      name: "Rafael Nunes",
      phone: "(11) 90000-0102",
      email: "rafael.nunes@example.com",
      service: "Polimento técnico",
      message:
        "Meu sedan tem bastante risco de lavagem e a cor perdeu o brilho. Queria entender se o polimento resolve e quanto tempo o carro fica com vocês.",
      temperature: "MORNO",
      reason: "Problema claro e serviço identificado, mas ainda avaliando antes de decidir.",
      reply:
        "Olá, Rafael! Riscos de lavagem e perda de brilho costumam responder bem ao polimento técnico. Para indicar o processo certo, precisamos avaliar a pintura pessoalmente. Quer agendar uma avaliação sem compromisso? Equipe Lume.",
      status: "COMPLETO",
      steps: allOk([10, 1720, 31, 2050, 390, 402]),
      consentAt: hoursAgo(5),
    },
    {
      createdAt: hoursAgo(9),
      name: "Beatriz Campos",
      phone: "(21) 90000-0103",
      email: "beatriz.campos@example.com",
      service: "Lavagem detalhada",
      message: "Vocês atendem aos domingos? Só queria saber para o futuro.",
      temperature: "FRIO",
      reason: "Pergunta genérica sem intenção de compra ou prazo definido.",
      reply:
        "Olá, Beatriz! Obrigado pelo contato. Vamos te enviar nossos dias e horários de atendimento. Quando quiser agendar uma lavagem detalhada, é só responder este e-mail. Equipe Lume.",
      status: "COMPLETO",
      steps: allOk([9, 1610, 29, 1880, 375, 366]),
      consentAt: hoursAgo(9),
    },
    {
      createdAt: hoursAgo(20),
      name: "Diego Ferraz",
      phone: "(31) 90000-0104",
      email: "diego.ferraz@example.com",
      service: "Higienização interna",
      message:
        "Vou vender o carro mês que vem e preciso deixar o interior impecável: bancos de tecido manchados e cheiro de cigarro. Tenho urgência.",
      temperature: "QUENTE",
      reason: "Necessidade concreta com prazo curto e motivação clara (venda do veículo).",
      reply:
        "Olá, Diego! A higienização interna remove manchas de bancos de tecido e ajuda bastante com odores. Como você tem prazo, vamos priorizar seu contato para combinar a data. Equipe Lume.",
      status: "PARCIAL",
      steps: [
        ...allOk([11, 1905, 33, 2302, 0, 395]).slice(0, 4),
        {
          key: "email_cliente",
          label: "E-mail ao cliente",
          status: "erro",
          detail: STEP_MESSAGES.emailFailed,
          ms: 3120,
        },
        { key: "email_equipe", label: "Aviso à equipe", status: "ok", ms: 395 },
      ],
      consentAt: hoursAgo(20),
    },
    {
      createdAt: hoursAgo(30),
      name: "Larissa Moura",
      phone: "(41) 90000-0105",
      email: "larissa.moura@example.com",
      service: "Película de proteção (PPF)",
      message:
        "Tenho interesse em PPF só no capô e para-choque dianteiro. Estou pesquisando algumas empresas antes de decidir.",
      temperature: "MORNO",
      reason: "Interesse específico, mas em fase de comparação entre fornecedores.",
      reply:
        "Olá, Larissa! Aplicar PPF no capô e para-choque é uma ótima escolha para as áreas que mais sofrem com pedras. Podemos te mostrar o material e o acabamento numa visita rápida. Equipe Lume.",
      status: "COMPLETO",
      steps: allOk([10, 1770, 30, 1990, 401, 388]),
      consentAt: hoursAgo(30),
    },
    {
      createdAt: hoursAgo(52),
      name: "Otávio Reis",
      phone: "(51) 90000-0106",
      email: "otavio.reis@example.com",
      service: "Lavagem detalhada",
      message: "Só testando o formulário.",
      temperature: "FRIO",
      reason: "Mensagem sem pedido real de serviço.",
      reply:
        "Olá, Otávio! Recebemos sua mensagem. Se quiser conhecer nossos serviços de lavagem detalhada, estamos à disposição. Equipe Lume.",
      status: "COMPLETO",
      steps: allOk([8, 1490, 27, 1650, 362, 351]),
      consentAt: hoursAgo(52),
    },
  ];
}
