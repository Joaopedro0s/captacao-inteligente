export type StepStatus = "ok" | "erro" | "pulada";

export type Step = {
  key: "validacao" | "classificacao" | "gravacao" | "resposta" | "email_cliente" | "email_equipe";
  label: string;
  status: StepStatus;
  detail?: string;
  ms: number;
};

export type Temperature = "QUENTE" | "MORNO" | "FRIO";
