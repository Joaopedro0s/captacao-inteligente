"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  fieldErrorsOf,
  leadSchema,
  MESSAGE_MAX,
  SERVICES,
  type FieldErrors,
  type LeadField,
} from "@/lib/lead-schema";
import type { LeadResponse, Step } from "@/lib/types";
import { IconX } from "./Icons";
import { StepList } from "./StepList";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; status: "COMPLETO" | "PARCIAL"; steps: Step[] }
  | { kind: "error"; message: string };

const FIELD_ORDER: LeadField[] = ["name", "phone", "email", "service", "message", "consent"];

const inputClass =
  "w-full rounded-lg border border-line-strong bg-bg px-3.5 py-3 text-text placeholder:text-muted transition-colors focus-visible:border-accent aria-[invalid=true]:border-danger";

export function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ kind: "idle" });
  const [messageLength, setMessageLength] = useState(0);

  function focusFirstError(errs: FieldErrors) {
    const first = FIELD_ORDER.find((f) => errs[f]?.length);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const raw = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
    };

    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success) {
      const errs = fieldErrorsOf(parsed.error);
      setErrors(errs);
      focusFirstError(errs);
      return;
    }

    setErrors({});
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "website" é o honeypot: humanos não veem o campo.
        body: JSON.stringify({ ...parsed.data, website: String(data.get("website") ?? "") }),
      });
      const body = (await res.json().catch(() => null)) as LeadResponse | null;
      if (body?.ok) {
        setState({ kind: "success", status: body.status, steps: body.steps });
        formRef.current?.reset();
        setMessageLength(0);
        return;
      }
      if (body && !body.ok && body.fieldErrors) {
        const errs = body.fieldErrors as FieldErrors;
        setErrors(errs);
        focusFirstError(errs);
      }
      setState({
        kind: "error",
        message: body && !body.ok ? body.error : "Não foi possível enviar agora. Tente novamente em instantes.",
      });
    } catch {
      setState({ kind: "error", message: "Sem conexão com o servidor. Verifique sua internet e tente de novo." });
    }
  }

  const err = (f: LeadField) => errors[f]?.[0];
  const describedBy = (f: LeadField) => (err(f) ? `${f}-error` : undefined);
  const loading = state.kind === "loading";

  return (
    <div>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={loading}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="name" label="Nome" error={err("name")}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              maxLength={80}
              className={inputClass}
              aria-invalid={!!err("name")}
              aria-describedby={describedBy("name")}
            />
          </Field>
          <Field id="phone" label="Telefone com DDD" error={err("phone")}>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 90000-0000"
              maxLength={20}
              className={inputClass}
              aria-invalid={!!err("phone")}
              aria-describedby={describedBy("phone")}
            />
          </Field>
          <Field id="email" label="E-mail" error={err("email")}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={120}
              className={inputClass}
              aria-invalid={!!err("email")}
              aria-describedby={describedBy("email")}
            />
          </Field>
          <Field id="service" label="Serviço" error={err("service")}>
            <select
              id="service"
              name="service"
              defaultValue=""
              className={inputClass}
              aria-invalid={!!err("service")}
              aria-describedby={describedBy("service")}
            >
              <option value="" disabled>
                Escolha um serviço
              </option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field id="message" label="Conte sobre o seu carro e o que precisa" error={err("message")}>
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessageLength(e.target.value.length)}
            className={inputClass}
            aria-invalid={!!err("message")}
            aria-describedby={["message-count", describedBy("message")].filter(Boolean).join(" ")}
          />
          <p id="message-count" className="mt-1 text-right text-xs text-muted">
            {messageLength}/{MESSAGE_MAX}
          </p>
        </Field>

        {/* Honeypot: fora da tela e da ordem de tabulação. Bots que preenchem tudo são descartados. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="website">Não preencha este campo</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <div className="flex gap-1">
            {/* Área de toque de 44px ao redor da caixa de 20px; o texto ao lado também marca a caixa. */}
            <label htmlFor="consent" className="-mt-3 -ml-3 grid size-11 shrink-0 cursor-pointer place-items-center">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                className="size-5 accent-accent"
                aria-invalid={!!err("consent")}
                aria-describedby={describedBy("consent")}
              />
            </label>
            <label htmlFor="consent" className="text-sm text-muted">
              Concordo com o uso dos meus dados para receber este orçamento, conforme a LGPD. A mensagem é
              analisada pelo Google Gemini, no plano gratuito, em que o Google pode usar o conteúdo para melhorar
              seus produtos. Nesta demonstração, o pedido aparece no{" "}
              <Link href="/demo/leads" className="text-accent underline underline-offset-4 hover:text-accent-hover">
                painel público de leads
              </Link>{" "}
              com nome abreviado, e-mail e telefone mascarados e mensagem encurtada.
            </label>
          </div>
          {err("consent") && (
            <p id="consent-error" className="mt-2 flex items-center gap-1.5 text-sm text-danger">
              <IconX className="size-4 shrink-0" />
              {err("consent")}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-6 py-4 text-base font-medium text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Pedir orçamento"}
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {loading && <p className="text-sm text-muted">Classificando seu pedido e preparando a resposta…</p>}
        {state.kind === "success" && (
          <div className="rounded-lg border border-line bg-surface-2 p-5">
            <p className="font-medium">Pedido recebido. Obrigado!</p>
            <p className="mt-1 text-sm text-muted">
              {state.status === "COMPLETO"
                ? "A automação concluiu todas as etapas."
                : "A automação concluiu parcialmente: seu pedido está salvo e a equipe vai acompanhar."}{" "}
              Nesta demonstração, os e-mails vão para uma caixa interna, não para o endereço informado.
            </p>
            <div className="mt-4">
              <StepList steps={state.steps} />
            </div>
            <Link href="/demo/leads" className="mt-4 inline-block text-sm text-accent underline underline-offset-4 hover:text-accent-hover">
              Ver este lead no painel
            </Link>
          </div>
        )}
      </div>
      {state.kind === "error" && (
        <p role="alert" className="mt-6 rounded-lg border border-danger/50 bg-surface-2 p-4 text-sm text-danger">
          {state.message}
        </p>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
          <IconX className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
