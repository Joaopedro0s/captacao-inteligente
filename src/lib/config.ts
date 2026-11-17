const positiveInt = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export const config = {
  aiModel: process.env.AI_MODEL || "gemini-3.5-flash-lite",
  // Limite por tentativa e limite total de cada etapa de IA (com no máximo 1 nova tentativa).
  aiTimeoutMs: positiveInt(process.env.AI_TIMEOUT_MS, 4000),
  aiBudgetMs: 8000,
  emailFrom: process.env.EMAIL_FROM || "Lume Estética Automotiva <onboarding@resend.dev>",
  emailTimeoutMs: 8000,
  teamEmail: process.env.TEAM_EMAIL || "",
  // Seguro por padrão: só sai do modo demo com DEMO_MODE="false" explícito.
  demoMode: process.env.DEMO_MODE !== "false",
  demoRecipient: process.env.DEMO_RECIPIENT || "",
  rateLimitPerHour: positiveInt(process.env.RATE_LIMIT_PER_HOUR, 5),
  dailyLeadLimit: positiveInt(process.env.DAILY_LEAD_LIMIT, 50),
  ipHashSalt: process.env.IP_HASH_SALT || "",
  maxBodyBytes: 8 * 1024,
};
