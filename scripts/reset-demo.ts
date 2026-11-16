// Restaura o banco de demonstração para os 4 leads de exemplo (quente, morno, frio e parcial).
// Uso: RESET_TOKEN=... DEMO_URL=https://<app>.vercel.app npm run demo:reset
// O token é o mesmo RESET_TOKEN cadastrado na Vercel; sem ele o endpoint responde 401/503.
import "dotenv/config";

async function main() {
  const token = process.env.RESET_TOKEN;
  const base = (process.env.DEMO_URL || "http://localhost:3000").replace(/\/+$/, "");
  if (!token) throw new Error("Defina RESET_TOKEN (o mesmo valor cadastrado no app).");

  const res = await fetch(`${base}/api/demo/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Reset falhou (${res.status}): ${body.error ?? "resposta inesperada"}`);
  console.log(`Reset concluído em ${base}: ${body.leads} leads de exemplo.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1; // sem process.exit(): no Windows ele derruba o Node com handles do fetch ainda abertos
});
