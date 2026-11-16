import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { seedLeads } from "@/lib/seed-data";

const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * Restaura os dados de demonstração: apaga leads e registros de limite e recria o seed.
 * Uso: curl -X POST https://<app>/api/demo/reset -H "Authorization: Bearer $RESET_TOKEN"
 */
export async function POST(request: Request) {
  const expected = process.env.RESET_TOKEN;
  if (!expected || expected.length < 16) {
    return Response.json({ error: "Reset desativado: configure RESET_TOKEN (mín. 16 caracteres)." }, { status: 503 });
  }
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  // Compara hashes de tamanho fixo em tempo constante: não vaza o token por timing nem pelo tamanho.
  if (!timingSafeEqual(digest(provided), digest(expected))) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [, , created] = await prisma.$transaction([
    prisma.lead.deleteMany(),
    prisma.requestLog.deleteMany(),
    prisma.lead.createMany({ data: seedLeads() }),
  ]);
  return Response.json({ ok: true, leads: created.count });
}
