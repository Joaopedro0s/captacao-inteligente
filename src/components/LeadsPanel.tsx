"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LeadInput } from "@/lib/lead-schema";
import type { LeadResponse, PanelPage } from "@/lib/types";
import { StatusBadge, TemperatureBadge } from "./Badges";
import { StepList } from "./StepList";

const POLL_MS = 5000;

// Perfis fictícios para o botão de teste: um quente, um morno e um frio, em rodízio.
const TEST_LEADS: (LeadInput & { profile: string })[] = [
  {
    profile: "quente",
    name: "Paula Andrade",
    phone: "(11) 90000-0201",
    email: "paula.andrade@example.com",
    service: "Vitrificação de pintura",
    message:
      "Peguei meu carro zero ontem e quero vitrificar antes da viagem do feriado. Posso deixar com vocês amanhã cedo?",
    consent: true,
  },
  {
    profile: "morno",
    name: "Caio Ribeiro",
    phone: "(11) 90000-0202",
    email: "caio.ribeiro@example.com",
    service: "Polimento técnico",
    message:
      "Meu carro tem alguns riscos finos nas portas. Estou vendo opções e queria entender como funciona o polimento antes de decidir.",
    consent: true,
  },
  {
    profile: "frio",
    name: "Sônia Prado",
    phone: "(11) 90000-0203",
    email: "sonia.prado@example.com",
    service: "Lavagem detalhada",
    message: "Vocês ficam perto do metrô? Só curiosidade mesmo.",
    consent: true,
  },
];

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function LeadsPanel() {
  const [data, setData] = useState<PanelPage | null>(null);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [loadError, setLoadError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const next = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads?page=${pageRef.current}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as PanelPage;
      setData(body);
      if (body.page !== pageRef.current) setPage((pageRef.current = body.page));
      setLoadError(false);
      setUpdatedAt(new Date());
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    // Polling leve: pausa com a aba em segundo plano.
    const id = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  async function sendTestLead() {
    const { profile, ...lead } = TEST_LEADS[next.current % TEST_LEADS.length];
    next.current++;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const body = (await res.json().catch(() => null)) as LeadResponse | null;
      if (body?.ok) {
        setNotice({
          kind: "ok",
          text: `Lead de teste (perfil ${profile}) processado: ${body.status === "COMPLETO" ? "completo" : "parcial"}.`,
        });
        goTo(1);
      } else {
        setNotice({ kind: "error", text: body && !body.ok ? body.error : "Falha ao enviar o lead de teste." });
      }
    } catch {
      setNotice({ kind: "error", text: "Sem conexão com o servidor." });
    } finally {
      setSending(false);
    }
  }

  function goTo(target: number) {
    pageRef.current = target;
    setPage(target);
    load();
  }

  const leads = data?.leads ?? null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={sendTestLead}
            disabled={sending}
            className="rounded-md bg-accent px-4 py-2.5 font-semibold text-accent-ink disabled:opacity-60"
          >
            {sending ? "Processando…" : "Enviar lead de teste"}
          </button>
          <p className="mt-2 text-xs text-muted">Alterna entre um perfil quente, um morno e um frio.</p>
        </div>
        <p className="text-sm text-muted" aria-live="off">
          <span aria-hidden="true" className="mr-1.5 inline-block size-2 rounded-full bg-accent align-middle" />
          Atualiza a cada {POLL_MS / 1000}s
          {updatedAt && ` · última leitura ${updatedAt.toLocaleTimeString("pt-BR")}`}
        </p>
      </div>

      <div aria-live="polite">
        {notice && (
          <p
            className={`mt-4 rounded-md border bg-surface p-3 text-sm ${
              notice.kind === "ok" ? "border-line" : "border-danger/50 text-danger"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      {data && (
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Leads", data.counts.total],
            ["Quentes", data.counts.QUENTE],
            ["Mornos", data.counts.MORNO],
            ["Frios", data.counts.FRIO],
            ["Parciais", data.counts.PARCIAL],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col rounded-lg border border-line bg-surface p-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="order-first text-2xl font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {loadError && (
        <p role="alert" className="mt-6 text-sm text-danger">
          Não foi possível atualizar a lista. Tentando de novo em instantes.
        </p>
      )}
      {!leads && !loadError && <p className="mt-8 text-sm text-muted">Carregando leads…</p>}
      {leads?.length === 0 && (
        <p className="mt-8 text-sm text-muted">Nenhum lead ainda. Envie um lead de teste para ver a automação.</p>
      )}

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Leads recentes</h2>
      <ol className="mt-4 space-y-4">
        {leads?.map((lead) => (
          <li key={lead.id} className="rounded-lg border border-line bg-surface p-5">
            <article aria-labelledby={`lead-${lead.id}`}>
              <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 id={`lead-${lead.id}`} className="font-semibold">
                  {lead.name}
                </h3>
                <TemperatureBadge value={lead.temperature} />
                <StatusBadge value={lead.status} />
                <span className="text-sm text-muted sm:ml-auto">
                  <time dateTime={lead.createdAt}>{dateFormat.format(new Date(lead.createdAt))}</time>
                </span>
              </header>
              <p className="mt-1 break-words text-sm text-muted">
                {lead.service} · {lead.email} · {lead.phone}
              </p>

              <div className="mt-4 grid gap-6 lg:grid-cols-[3fr_2fr]">
                <div className="min-w-0 space-y-4 text-sm">
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Mensagem</h4>
                    <p className="mt-1 whitespace-pre-line break-words">{lead.message}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Justificativa da IA</h4>
                    <p className="mt-1 break-words">{lead.reason}</p>
                  </section>
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Resposta gerada</h4>
                    <p className="mt-1 whitespace-pre-line break-words border-l-2 border-line pl-3 text-muted">
                      {lead.reply ?? "Ainda não gerada."}
                    </p>
                  </section>
                </div>
                <section className="min-w-0">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Linha do tempo</h4>
                  <StepList steps={lead.steps} />
                </section>
              </div>
            </article>
          </li>
        ))}
      </ol>

      {data && data.totalPages > 1 && (
        <nav aria-label="Páginas de leads" className="mt-6 flex items-center justify-between gap-4 text-sm">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-line px-3 py-2 disabled:opacity-40"
          >
            Mais recentes
          </button>
          <span aria-live="polite">
            Página {page} de {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded-md border border-line px-3 py-2 disabled:opacity-40"
          >
            Mais antigos
          </button>
        </nav>
      )}
    </div>
  );
}
