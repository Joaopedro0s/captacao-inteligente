import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { maskEmail, maskPhone } from "@/lib/mask";
import type { PanelLead, Step } from "@/lib/types";

/** Leads mais recentes para o painel público, com contato mascarado. */
export async function GET() {
  await connection(); // sempre em tempo de requisição: dados mudam a cada lead
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
    const body: PanelLead[] = leads.map((l) => ({
      id: l.id,
      createdAt: l.createdAt.toISOString(),
      name: l.name,
      email: maskEmail(l.email),
      phone: maskPhone(l.phone),
      service: l.service,
      message: l.message,
      temperature: l.temperature,
      reason: l.reason,
      reply: l.reply,
      status: l.status,
      steps: l.steps as unknown as Step[],
    }));
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("leads: falha ao listar", err);
    return Response.json({ error: "Não foi possível carregar os leads." }, { status: 503 });
  }
}
