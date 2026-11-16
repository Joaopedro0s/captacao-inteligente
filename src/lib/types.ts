/** "pendente" e "executando" só existem enquanto o lead está em PROCESSANDO. */
export type StepStatus = "ok" | "erro" | "pulada" | "pendente" | "executando";

export type Step = {
  key: "validacao" | "classificacao" | "gravacao" | "resposta" | "email_cliente" | "email_equipe";
  label: string;
  status: StepStatus;
  detail?: string;
  /** Etapa concluída com o texto padrão no lugar da IA: o painel mostra "ok (padrão)". */
  fallback?: boolean;
  ms: number;
};

export type LeadStatus = "PROCESSANDO" | "COMPLETO" | "PARCIAL";

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
  status: LeadStatus;
  steps: Step[];
};

/** Resposta de GET /api/leads?page=N. */
export type PanelPage = {
  page: number;
  totalPages: number;
  counts: { total: number; QUENTE: number; MORNO: number; FRIO: number; PARCIAL: number };
  leads: PanelLead[];
};

/** Resposta de POST /api/lead. */
export type LeadResponse =
  | {
      ok: true;
      leadId: string | null;
      status: LeadStatus;
      temperature: Temperature;
      steps: Step[];
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
