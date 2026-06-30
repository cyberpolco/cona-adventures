// prisma/seed.js — run with: node prisma/seed.js
// Seeds the four staff accounts (all share password: ChangeMe!2026 — change before production).
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'ChangeMe!2026';

const STAFF = [
  { name: 'Alice K.',  email: 'admin@cona.com',   role: 'Super Admin' },
  { name: 'Bruno M.',  email: 'ops@cona.com',      role: 'Operations Manager' },
  { name: 'Chloe M.', email: 'guide@cona.com',    role: 'Tour Guide' },
  { name: 'David S.', email: 'driver@cona.com',   role: 'Driver' },
];

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const s of STAFF) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, role: s.role, passwordHash: hash },
    });
    console.log(`Seeded ${s.role}: ${s.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
