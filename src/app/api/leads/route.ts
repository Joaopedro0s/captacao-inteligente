import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { maskEmail, maskName, maskPhone, truncateMessage } from "@/lib/mask";
import { publicSteps } from "@/lib/step-messages";
import type { PanelPage, Step } from "@/lib/types";

const PAGE_SIZE = 10;

/** Página de leads para o painel público: contato e nome mascarados, mensagem encurtada. */
export async function GET(request: Request) {
  await connection(); // sempre em tempo de requisição: dados mudam a cada lead
  const requested = Number(new URL(request.url).searchParams.get("page"));
  try {
    const [total, byTemperature, partial] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({ by: ["temperature"], _count: { _all: true } }),
      prisma.lead.count({ where: { status: "PARCIAL" } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Number.isInteger(requested) && requested >= 1 ? Math.min(requested, totalPages) : 1;
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    const countOf = (t: string) => byTemperature.find((g) => g.temperature === t)?._count._all ?? 0;

    const body: PanelPage = {
      page,
      totalPages,
      counts: { total, QUENTE: countOf("QUENTE"), MORNO: countOf("MORNO"), FRIO: countOf("FRIO"), PARCIAL: partial },
      leads: leads.map((l) => ({
        id: l.id,
        createdAt: l.createdAt.toISOString(),
        name: maskName(l.name),
        email: maskEmail(l.email),
        phone: maskPhone(l.phone),
        service: l.service,
        message: truncateMessage(l.message),
        temperature: l.temperature,
        reason: l.reason,
        reply: l.reply,
        status: l.status,
        steps: publicSteps(l.steps as unknown as Step[]),
      })),
    };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("leads: falha ao listar", err);
    return Response.json({ error: "Não foi possível carregar os leads." }, { status: 503 });
  }
}
