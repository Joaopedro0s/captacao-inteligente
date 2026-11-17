/**
 * Resumo seguro de um erro para o log do servidor: tipo, código e só a 1ª linha da mensagem.
 * Erros do Prisma (ex.: PrismaClientValidationError) repetem nas linhas seguintes os dados da
 * consulta, que incluem a mensagem do visitante; por isso o resto nunca é registrado.
 */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err).split("\n")[0].slice(0, 300);
  const code = (err as { code?: unknown }).code;
  const firstLine = err.message.split("\n").find((l) => l.trim()) ?? "";
  return `${err.name}${typeof code === "string" ? ` [${code}]` : ""}: ${firstLine.trim().slice(0, 300)}`;
}

export function logError(context: string, err: unknown) {
  console.error(`${context}: ${describeError(err)}`);
}
