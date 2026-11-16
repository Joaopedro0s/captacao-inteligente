"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LeadInput } from "@/lib/lead-schema";
import { relativeTime } from "@/lib/relative-time";
import type { LeadResponse, PanelLead, PanelPage } from "@/lib/types";
import { StatusBadge, TemperatureBadge } from "./Badges";
import { StepList } from "./StepList";

const POLL_MS = 5000;
// Enquanto há lead em PROCESSANDO (ou um lead de teste saindo), consulta mais rápido para mostrar as etapas avançando.
const FAST_POLL_MS = 1200;

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

const label = "text-xs font-medium uppercase tracking-wider text-muted";

export function LeadsPanel() {
  const [data, setData] = useState<PanelPage | null>(null);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [loadError, setLoadError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const next = useRef(0);
  const fast = useRef({ processing: false, sending: false });
  const kick = useRef<() => void>(() => {});

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads?page=${pageRef.current}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as PanelPage;
      setData(body);
      fast.current.processing = body.leads.some((l) => l.status === "PROCESSANDO");
      if (body.page !== pageRef.current) setPage((pageRef.current = body.page));
      setLoadError(false);
      setUpdatedAt(new Date());
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    // Polling leve: pausa com a aba em segundo plano e acelera enquanto há lead em processamento.
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      clearTimeout(timer);
      if (!document.hidden) await load();
      const { processing, sending } = fast.current;
      if (!stopped) timer = setTimeout(tick, processing || sending ? FAST_POLL_MS : POLL_MS);
    };
    kick.current = () => {
      clearTimeout(timer);
      timer = setTimeout(tick, FAST_POLL_MS);
    };
    timer = setTimeout(tick, 0);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [load]);

  function goTo(target: number) {
    pageRef.current = target;
    setPage(target);
    load();
  }

  async function sendTestLead() {
    const { profile, ...lead } = TEST_LEADS[next.current % TEST_LEADS.length];
    next.current++;
    setSending(true);
    setNotice(null);
    fast.current.sending = true;
    kick.current();
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
      fast.current.sending = false;
    }
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
            className="rounded-lg bg-accent px-6 py-3.5 font-medium text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {sending ? "Processando…" : "Enviar lead de teste"}
          </button>
          <p className="mt-2 text-sm text-muted">Alterna entre um perfil quente, um morno e um frio.</p>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent px-2.5 py-0.5 text-xs font-medium text-accent">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            Ao vivo
          </span>
          <span>
            atualiza a cada {POLL_MS / 1000}s
            {updatedAt && (
              <>
                {" · "}
                <span className="font-mono">{updatedAt.toLocaleTimeString("pt-BR")}</span>
              </>
            )}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {notice && (
          <p
            className={`mt-6 rounded-lg border bg-surface-2 p-4 text-sm ${
              notice.kind === "ok" ? "border-line" : "border-danger/50 text-danger"
            }`}
          >
            {notice.text}
          </p>
        )}
      </div>

      {data && (
        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["Leads", data.counts.total],
            ["Quentes", data.counts.QUENTE],
            ["Mornos", data.counts.MORNO],
            ["Frios", data.counts.FRIO],
            ["Parciais", data.counts.PARCIAL],
          ].map(([name, value]) => (
            <div key={name} className="flex flex-col rounded-xl border border-line bg-surface p-5">
              <dt className="mt-2 text-sm text-muted">{name}</dt>
              <dd className="order-first font-mono text-4xl font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {loadError && (
        <p role="alert" className="mt-6 text-sm text-danger">
          Não foi possível atualizar a lista. Tentando de novo em instantes.
        </p>
      )}
      {!leads && !loadError && <p className="mt-10 text-sm text-muted">Carregando leads…</p>}

      <h2 className="mt-16 font-display text-3xl uppercase leading-none tracking-wide sm:text-4xl">Leads recentes</h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
        <span className="font-medium text-text">Processando:</span> a automação ainda está rodando as etapas.{" "}
        <span className="font-medium text-text">Completo:</span> todas as etapas concluíram.{" "}
        <span className="font-medium text-text">Parcial:</span> uma etapa falhou e o fluxo continuou nas demais, de
        propósito, para mostrar a tolerância a falhas.
      </p>
      {leads?.length === 0 && (
        <p className="mt-6 text-sm text-muted">Nenhum lead ainda. Envie um lead de teste para ver a automação.</p>
      )}
      <ol className="mt-6 space-y-6">
        {leads?.map((lead) => (
          <li key={lead.id}>
            <LeadCard lead={lead} />
          </li>
        ))}
      </ol>

      {data && data.totalPages > 1 && (
        <nav aria-label="Páginas de leads" className="mt-8 flex items-center justify-between gap-4 text-sm">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-line-strong px-4 py-2.5 transition-colors hover:border-accent disabled:opacity-40 disabled:hover:border-line-strong"
          >
            Mais recentes
          </button>
          <span aria-live="polite" className="text-muted">
            Página <span className="font-mono text-text">{page}</span> de{" "}
            <span className="font-mono text-text">{data.totalPages}</span>
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded-lg border border-line-strong px-4 py-2.5 transition-colors hover:border-accent disabled:opacity-40 disabled:hover:border-line-strong"
          >
            Mais antigos
          </button>
        </nav>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: PanelLead }) {
  const total = lead.steps.reduce((sum, s) => sum + s.ms, 0);
  return (
    <article aria-labelledby={`lead-${lead.id}`} className="rounded-xl border border-line bg-surface">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-5 py-4 sm:px-6">
        <h3 id={`lead-${lead.id}`} className="text-lg font-medium">
          {lead.name}
        </h3>
        <TemperatureBadge value={lead.temperature} />
        <StatusBadge value={lead.status} />
        <time
          dateTime={lead.createdAt}
          title={dateFormat.format(new Date(lead.createdAt))}
          className="font-mono text-xs text-muted sm:ml-auto"
        >
          {relativeTime(new Date(lead.createdAt))}
        </time>
        <p className="basis-full break-words text-sm text-muted">
          {lead.service} · <span className="whitespace-nowrap font-mono text-xs">{lead.email}</span> ·{" "}
          <span className="whitespace-nowrap font-mono text-xs">{lead.phone}</span>
        </p>
      </header>

      <div className="grid gap-6 px-5 py-5 sm:px-6 md:grid-cols-2">
        <div className="min-w-0 space-y-5 text-sm">
          <section>
            <h4 className={label}>Mensagem</h4>
            <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{lead.message}</p>
          </section>
          <section>
            <h4 className={label}>Justificativa da IA</h4>
            <p className="mt-2 break-words leading-relaxed">{lead.reason}</p>
          </section>
        </div>
        <section className="min-w-0 text-sm">
          <h4 className={label}>Resposta gerada</h4>
          <p className="mt-2 whitespace-pre-line break-words rounded-lg border border-line bg-surface-2 p-4 leading-relaxed text-muted">
            {lead.reply ?? (lead.status === "PROCESSANDO" ? "Gerando a resposta…" : "Não gerada.")}
          </p>
        </section>
      </div>

      <section className="border-t border-line px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h4 className={label}>Linha do tempo</h4>
          {total > 0 && <span className="font-mono text-xs text-muted">total {total} ms</span>}
        </div>
        <StepList steps={lead.steps} />
      </section>
    </article>
  );
}
