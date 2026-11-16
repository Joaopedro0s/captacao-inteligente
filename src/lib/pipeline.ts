import type { Prisma } from "@/generated/prisma/client";
import { classifyLead, fallbackReply, FALLBACK_CLASSIFICATION, generateReply, type Classification } from "./ai";
import { config } from "./config";
import { prisma } from "./db";
import { resolveRecipient, sendEmail } from "./email";
import type { LeadInput } from "./lead-schema";
import { maskEmail } from "./mask";
import { STEP_MESSAGES } from "./step-messages";
import type { Step } from "./types";

const elapsed = (start: number) => Math.round(performance.now() - start);
const asJson = (steps: Step[]) => steps as unknown as Prisma.InputJsonValue;

/**
 * Etapas 2–5 da automação. Cada etapa registra status, detalhe e duração; nenhuma falha
 * interrompe as seguintes, e o lead termina como COMPLETO ou PARCIAL.
 */
export async function processLead(input: LeadInput, validationStep: Step) {
  const steps: Step[] = [validationStep];

  // 2. Classificação por IA (com fallback "morno")
  let classification: Classification = FALLBACK_CLASSIFICATION;
  let t = performance.now();
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

  // 3. Gravação no banco
  let leadId: string | null = null;
  t = performance.now();
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
        status: "PARCIAL",
        steps: asJson(steps),
      },
      select: { id: true },
    });
    leadId = lead.id;
    steps.push({ key: "gravacao", label: "Gravação no banco", status: "ok", ms: elapsed(t) });
  } catch (err) {
    console.error("lead: falha ao gravar", err);
    steps.push({ key: "gravacao", label: "Gravação no banco", status: "erro", detail: STEP_MESSAGES.dbFailed, ms: elapsed(t) });
  }

  // 4. Resposta personalizada (com texto padrão se a IA falhar)
  let reply = fallbackReply(input.name, classification.temperature);
  t = performance.now();
  try {
    const generated = await generateReply(input, classification.temperature);
    reply = generated.text;
    steps.push({
      key: "resposta",
      label: "Resposta personalizada",
      status: "ok",
      detail: generated.replaced ? STEP_MESSAGES.replyFiltered : undefined,
      ms: elapsed(t),
    });
  } catch (err) {
    console.error("lead: falha ao gerar resposta por IA", err);
    steps.push({
      key: "resposta",
      label: "Resposta personalizada",
      status: "erro",
      detail: STEP_MESSAGES.aiUnavailableReply,
      ms: elapsed(t),
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

  const status = steps.some((s) => s.status === "erro") ? "PARCIAL" : "COMPLETO";
  if (leadId) {
    await prisma.lead
      .update({ where: { id: leadId }, data: { reply, status, steps: asJson(steps) } })
      .catch((err) => console.error("lead: falha ao atualizar etapas", err));
  }

  return { leadId, status, temperature: classification.temperature, steps } as const;
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
