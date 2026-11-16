import { Resend } from "resend";
import { config } from "./config";
import { NonRetryableError, withRetry, withTimeout } from "./retry";

let resend: Resend | null = null;

const RETRYABLE = new Set(["rate_limit_exceeded", "application_error", "internal_server_error"]);

/** Envia só texto puro: nada do que o visitante digitou é interpretado como HTML. */
export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) throw new NonRetryableError("RESEND_API_KEY não configurada");
  resend ??= new Resend(process.env.RESEND_API_KEY);
  const client = resend;

  await withRetry(async () => {
    const { error } = await withTimeout(
      client.emails.send({ from: config.emailFrom, to, subject, text }),
      config.emailTimeoutMs,
      "Resend",
    );
    if (!error) return;
    if (RETRYABLE.has(error.name)) throw new Error(`Resend: ${error.message}`);
    throw new NonRetryableError(`Resend: ${error.message}`);
  });
}

/**
 * Para quem o e-mail vai de fato. No modo demo, sempre DEMO_RECIPIENT: nunca o endereço digitado
 * no formulário, que pode ser de um terceiro.
 */
export function resolveRecipient(intended: string): { to: string } | { skip: string } {
  if (config.demoMode) {
    return config.demoRecipient ? { to: config.demoRecipient } : { skip: "modo demo sem DEMO_RECIPIENT configurado" };
  }
  return intended ? { to: intended } : { skip: "destinatário não configurado" };
}
