import Link from "next/link";

export function DemoBanner({ showPanelLink = true }: { showPanelLink?: boolean }) {
  return (
    <div className="border-b border-line bg-surface px-4 py-2.5 text-center text-sm text-muted">
      <strong className="font-medium text-text">Demonstração de portfólio.</strong> Empresa, clientes e depoimentos
      são fictícios. Não use dados reais.{" "}
      {showPanelLink && (
        <Link
          href="/demo/leads"
          className="inline-flex min-h-11 items-center text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Abrir o painel da automação
        </Link>
      )}
    </div>
  );
}
