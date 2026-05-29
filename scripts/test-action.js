const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // We'll create actions for both ::1 and ::ffff:127.0.0.1 to make sure the kiosk service gets it regardless of which loopback interface it used in its latest request.
  const ips = ['::1', '::ffff:127.0.0.1'];
  
  for (const ip of ips) {
    const actionId = `act-${ip.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
    console.log(`Creating pending Action for IP: ${ip} with ID: ${actionId}...`);

    const action = await prisma.action.create({
      data: {
        ip: ip,
        actionId: actionId,
        type: 'ChangeUrl',
        parameters: { url: 'https://www.google.com' },
        priority: 10,
        status: 'pending'
      }
    });

    console.dir(action, { depth: null });
  }
  
  console.log("\nActions created! Please check the Kiosk Service console and logs to see the action execution.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
