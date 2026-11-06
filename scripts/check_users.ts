import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  console.log('Users in DB count:', users.length);
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error('Error connecting to DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

