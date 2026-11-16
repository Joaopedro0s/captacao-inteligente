import { z } from "zod";

// Schema único: o formulário (cliente) e /api/lead (servidor) validam com ele.
export const SERVICES = [
  "Lavagem detalhada",
  "Polimento técnico",
  "Vitrificação de pintura",
  "Higienização interna",
  "Película de proteção (PPF)",
] as const;

export const MESSAGE_MAX = 1000;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80, "Use até 80 caracteres."),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]*$/, "Use apenas números, espaços, parênteses ou hífen.")
    .refine((v) => {
      const digits = v.replace(/\D/g, "").length;
      return digits >= 10 && digits <= 13;
    }, "Informe o telefone com DDD."),
  email: z.string().trim().max(120, "E-mail longo demais.").pipe(z.email("E-mail inválido.")),
  service: z.enum(SERVICES, { error: "Escolha um serviço." }),
  message: z
    .string()
    .trim()
    .min(10, "Conte um pouco mais (mínimo de 10 caracteres).")
    .max(MESSAGE_MAX, `Use até ${MESSAGE_MAX} caracteres.`),
  consent: z.literal(true, { error: "É preciso concordar para enviarmos o orçamento." }),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadField = keyof LeadInput;
export type FieldErrors = Partial<Record<LeadField, string[]>>;

export function fieldErrorsOf(error: z.ZodError<LeadInput>): FieldErrors {
  return z.flattenError(error).fieldErrors;
}
