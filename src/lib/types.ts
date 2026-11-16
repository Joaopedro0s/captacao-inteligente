export type StepStatus = "ok" | "erro" | "pulada";

export type Step = {
  key: "validacao" | "classificacao" | "gravacao" | "resposta" | "email_cliente" | "email_equipe";
  label: string;
  status: StepStatus;
  detail?: string;
  ms: number;
};

export type Temperature = "QUENTE" | "MORNO" | "FRIO";

/** Lead como o painel público recebe de GET /api/leads (contato já mascarado). */
export type PanelLead = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  temperature: Temperature;
  reason: string;
  reply: string | null;
  status: "COMPLETO" | "PARCIAL";
  steps: Step[];
};

/** Resposta de POST /api/lead. */
export type LeadResponse =
  | {
      ok: true;
      leadId: string | null;
      status: "COMPLETO" | "PARCIAL";
      temperature: Temperature;
      steps: Step[];
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
