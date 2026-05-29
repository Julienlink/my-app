const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Querying Servers ===");
  const servers = await prisma.server.findMany();
  console.dir(servers, { depth: null });

  console.log("\n=== Querying Computer Statuses ===");
  const statuses = await prisma.computerStatus.findMany();
  console.dir(statuses, { depth: null });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
