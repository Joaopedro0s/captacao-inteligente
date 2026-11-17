import type { Prisma } from "@/generated/prisma/client";
import { classifyLead, fallbackReply, FALLBACK_CLASSIFICATION, generateReply, type Classification } from "./ai";
import { config } from "./config";
import { prisma } from "./db";
import { resolveRecipient, sendEmail } from "./email";
import type { LeadInput } from "./lead-schema";
import { leadStatus } from "./lead-status";
import { maskEmail } from "./mask";
import { DeadlineError } from "./retry";
import { STEP_MESSAGES } from "./step-messages";
import type { Step } from "./types";

const elapsed = (start: number) => Math.round(performance.now() - start);
const asJson = (steps: Step[]) => steps as unknown as Prisma.InputJsonValue;

/** Etapa que ainda não terminou: o painel mostra "aguardando" ou "executando" enquanto o lead está em PROCESSANDO. */
const waiting = (key: Step["key"], label: string, status: "pendente" | "executando"): Step => ({ key, label, status, ms: 0 });

/**
 * Etapas 2–5 da automação. Cada etapa registra status, detalhe e duração; nenhuma falha
 * interrompe as seguintes. O lead é gravado como PROCESSANDO, com as etapas restantes
 * "aguardando", e termina como COMPLETO ou PARCIAL (regra em lead-status.ts).
 */
export async function processLead(input: LeadInput, validationStep: Step) {
  const steps: Step[] = [validationStep];

  // 2. Classificação por IA (com fallback "morno")
  let classification: Classification = FALLBACK_CLASSIFICATION;
  const t = performance.now();
  try {
    const result = await classifyLead(input);
    if (result) {
      classification = result;
      steps.push({ key: "classificacao", label: "Classificação por IA", status: "ok", ms: elapsed(t) });
    } else {
      steps.push({
        key: "classificacao",
        label: "Classificação por IA",
        status: "erro",
        detail: STEP_MESSAGES.aiInvalidFormat,
        ms: elapsed(t),
      });
    }
  } catch (err) {
    console.error("lead: falha na classificação por IA", err);
    steps.push({
      key: "classificacao",
      label: "Classificação por IA",
      status: "erro",
      detail: STEP_MESSAGES.aiUnavailableClassification,
      ms: elapsed(t),
    });
  }

  // 3 e 4 em paralelo: a resposta depende só da classificação, não da gravação.
  // (Classificação e resposta não rodam juntas porque o tom da resposta segue a classificação.)
  const [saved, replied] = await Promise.all([saveLead(input, classification, steps), replyStep(input, classification)]);
  const leadId = saved.leadId;
  const reply = replied.reply;
  steps.push(saved.step, replied.step);

  if (leadId) {
    await saveProgress(leadId, {
      reply,
      steps: asJson([
        ...steps,
        waiting("email_cliente", "E-mail ao cliente", "executando"),
        waiting("email_equipe", "Aviso à equipe", "executando"),
      ]),
    });
  }

  // 5. E-mails ao cliente e à equipe, em paralelo
  const demoTag = config.demoMode ? "[Demo] " : "";
  const [clientStep, teamStep] = await Promise.all([
    emailStep("email_cliente", "E-mail ao cliente", input.email, `${demoTag}Recebemos seu pedido de orçamento`, [
      config.demoMode ? `(Demonstração: destinatário original ${maskEmail(input.email)})\n` : "",
      reply,
    ]),
    emailStep(
      "email_equipe",
      "Aviso à equipe",
      config.teamEmail,
      `${demoTag}Novo lead ${classification.temperature.toLowerCase()}: ${input.service}`,
      [
        `Nome: ${input.name}`,
        `Telefone: ${input.phone}`,
        `E-mail: ${input.email}`,
        `Serviço: ${input.service}`,
        `Classificação: ${classification.temperature} — ${classification.reason}`,
        "",
        "Mensagem:",
        input.message,
        "",
        "Resposta enviada ao cliente:",
        reply,
      ],
    ),
  ]);
  steps.push(clientStep, teamStep);

  const status = leadStatus(steps);
  if (leadId) await saveProgress(leadId, { reply, status, steps: asJson(steps) });

  return { leadId, status, temperature: classification.temperature, steps } as const;
}

/** 3. Grava o lead como PROCESSANDO: a resposta já está em execução e os e-mails aguardam. */
async function saveLead(input: LeadInput, classification: Classification, done: Step[]) {
  const t = performance.now();
  try {
    const lead = await prisma.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        service: input.service,
        message: input.message,
        consentAt: new Date(),
        temperature: classification.temperature,
        reason: classification.reason,
        status: "PROCESSANDO",
        steps: asJson([
          ...done,
          { key: "gravacao", label: "Gravação no banco", status: "ok", ms: 0 },
          waiting("resposta", "Resposta personalizada", "executando"),
          waiting("email_cliente", "E-mail ao cliente", "pendente"),
          waiting("email_equipe", "Aviso à equipe", "pendente"),
        ]),
      },
      select: { id: true },
    });
    const step: Step = { key: "gravacao", label: "Gravação no banco", status: "ok", ms: elapsed(t) };
    return { leadId: lead.id as string | null, step };
  } catch (err) {
    console.error("lead: falha ao gravar", err);
    const step: Step = { key: "gravacao", label: "Gravação no banco", status: "erro", detail: STEP_MESSAGES.dbFailed, ms: elapsed(t) };
    return { leadId: null, step };
  }
}

/**
 * 4. Resposta personalizada. Texto padrão no lugar da IA vira "ok (padrão)": quando a IA
 * passa de 8 s, cita preço ou prazo, ou para no limite de tokens. Erro da IA continua erro.
 */
async function replyStep(input: LeadInput, classification: Classification): Promise<{ reply: string; step: Step }> {
  const t = performance.now();
  const base = { key: "resposta", label: "Resposta personalizada" } as const;
  const fallback = fallbackReply(input.name, classification.temperature);
  try {
    const generated = await generateReply(input, classification.temperature);
    if (!generated.fallback) return { reply: generated.text, step: { ...base, status: "ok", ms: elapsed(t) } };
    const detail = generated.fallback === "truncated" ? STEP_MESSAGES.replyTruncated : STEP_MESSAGES.replyFiltered;
    return { reply: generated.text, step: { ...base, status: "ok", fallback: true, detail, ms: elapsed(t) } };
  } catch (err) {
    if (err instanceof DeadlineError) {
      return { reply: fallback, step: { ...base, status: "ok", fallback: true, detail: STEP_MESSAGES.replySlow, ms: elapsed(t) } };
    }
    console.error("lead: falha ao gerar resposta por IA", err);
    return { reply: fallback, step: { ...base, status: "erro", detail: STEP_MESSAGES.aiUnavailableReply, ms: elapsed(t) } };
  }
}

/** Atualiza o lead no banco sem derrubar o fluxo: se falhar, o painel expira o lead depois de 60 s. */
function saveProgress(id: string, data: Prisma.LeadUpdateInput) {
  return prisma.lead.update({ where: { id }, data }).catch((err) => console.error("lead: falha ao atualizar etapas", err));
}

async function emailStep(
  key: Step["key"],
  label: string,
  intended: string,
  subject: string,
  lines: string[],
): Promise<Step> {
  const recipient = resolveRecipient(intended);
  if ("skip" in recipient) {
    console.warn(`lead: ${key} pulado (${recipient.skip})`);
    return { key, label, status: "pulada", detail: STEP_MESSAGES.emailSkipped, ms: 0 };
  }
  const t = performance.now();
  try {
    await sendEmail(recipient.to, subject, lines.join("\n"));
    return { key, label, status: "ok", ms: elapsed(t) };
  } catch (err) {
    console.error(`lead: falha no ${key}`, err);
    return { key, label, status: "erro", detail: STEP_MESSAGES.emailFailed, ms: elapsed(t) };
  }
}
