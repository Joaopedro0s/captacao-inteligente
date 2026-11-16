import Link from "next/link";

type NavLink = { href: string; label: string; primary?: boolean };

export function SiteHeader({ links }: { links: NavLink[] }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 py-2 sm:px-6">
        {/* min-h-11: alvo de toque de 44px em todos os links do cabeçalho. */}
        <Link href="/" className="inline-flex min-h-11 items-center font-display text-2xl uppercase leading-none tracking-wide">
          Lume&nbsp;<span className="text-muted">Estética Automotiva</span>
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap items-center gap-x-5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`inline-flex min-h-11 items-center ${l.primary ? "text-accent hover:text-accent-hover" : "text-muted hover:text-text"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
