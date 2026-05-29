const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Querying Actions ===");
  const actions = await prisma.action.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.dir(actions, { depth: null });

  console.log("\n=== Querying Action Results ===");
  const results = await prisma.actionResult.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.dir(results, { depth: null });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
