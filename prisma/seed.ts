// Popula o banco com leads fictícios apenas se ele estiver vazio. Seguro para rodar a cada deploy.
import "dotenv/config";
import { prisma } from "../src/lib/db";
import { seedLeads } from "../src/lib/seed-data";

async function main() {
  const count = await prisma.lead.count();
  if (count > 0) {
    console.log(`seed: ${count} leads já existem, nada a fazer.`);
    return;
  }
  const { count: created } = await prisma.lead.createMany({ data: seedLeads() });
  console.log(`seed: ${created} leads fictícios criados.`);
}

main()
  .catch((err) => {
    console.error("seed falhou:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
