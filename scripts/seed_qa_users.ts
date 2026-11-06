import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding / Upserting 3 specific QA users...');

  // 1. Manager / Admin: manager@nexcmms.com
  const manager = await prisma.user.upsert({
    where: { email: 'manager@nexcmms.com' },
    update: {
      name: 'Dr. Elena Rostova (Engineering Director)',
      role: UserRole.ADMINISTRATOR,
      jobTitle: 'Director of Engineering & Facilities',
      hourlyRate: 65.00,
      scheduled: true
    },
    create: {
      id: 'USR-MGR-01',
      name: 'Dr. Elena Rostova (Engineering Director)',
      email: 'manager@nexcmms.com',
      role: UserRole.ADMINISTRATOR,
      jobTitle: 'Director of Engineering & Facilities',
      hourlyRate: 65.00,
      scheduled: true
    }
  });

  // 2. Supervisor: supervisor@nexcmms.com
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@nexcmms.com' },
    update: {
      name: 'Eng. Omar Dabobash (Maintenance Supervisor)',
      role: UserRole.MANAGER,
      jobTitle: 'Maintenance Operations Supervisor',
      hourlyRate: 55.00,
      scheduled: true
    },
    create: {
      id: 'USR-SUP-01',
      name: 'Eng. Omar Dabobash (Maintenance Supervisor)',
      email: 'supervisor@nexcmms.com',
      role: UserRole.MANAGER,
      jobTitle: 'Maintenance Operations Supervisor',
      hourlyRate: 55.00,
      scheduled: true
    }
  });

  // 3. Maintenance Technician: tech@nexcmms.com
  const tech = await prisma.user.upsert({
    where: { email: 'tech@nexcmms.com' },
    update: {
      name: 'Marcus Vance (Maintenance Tech)',
      role: UserRole.TECHNICIAN,
      jobTitle: 'Senior Field Maintenance Technician',
      hourlyRate: 45.00,
      scheduled: true
    },
    create: {
      id: 'USR-TEC-01',
      name: 'Marcus Vance (Maintenance Tech)',
      email: 'tech@nexcmms.com',
      role: UserRole.TECHNICIAN,
      jobTitle: 'Senior Field Maintenance Technician',
      hourlyRate: 45.00,
      scheduled: true
    }
  });

  console.log('Successfully upserted QA users:');
  console.log('- Manager:', manager.email, manager.role);
  console.log('- Supervisor:', supervisor.email, supervisor.role);
  console.log('- Technician:', tech.email, tech.role);
}

main()
  .catch((e) => {
    console.error('Error seeding QA users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

