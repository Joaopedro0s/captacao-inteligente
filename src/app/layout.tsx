import type { Metadata } from "next";
import { Barlow_Condensed, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Três famílias com papéis fixos: títulos (condensada), corpo (Geist) e números (mono).
// Pesos usados no app inteiro: 400, 500 e 600.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const barlow = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["600"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Lume Estética Automotiva · Captação Inteligente (demo)",
  description:
    "Demonstração de portfólio: automação de captação de leads com IA. Empresa e dados fictícios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${barlow.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:font-medium focus:text-accent-ink"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
