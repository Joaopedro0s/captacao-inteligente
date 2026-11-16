import Link from "next/link";

export function DemoBanner({ showPanelLink = true }: { showPanelLink?: boolean }) {
  return (
    <div className="border-b border-line bg-surface px-4 py-2 text-center text-sm text-muted">
      <strong className="font-semibold text-text">Demonstração de portfólio.</strong> Empresa, clientes e
      depoimentos são fictícios. Não use dados reais.{" "}
      {showPanelLink && (
        <Link href="/demo/leads" className="text-accent underline underline-offset-2">
          Ver a automação ao vivo
        </Link>
      )}
    </div>
  );
}
