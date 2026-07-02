// lib/users.server.ts — SERVER ONLY. Never import client-side.
// Reads users from the database via Prisma. Fall back to the in-memory seed
// only when the DB is unavailable (avoids bricking login during cold starts
// before the first migration).
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { Role } from './roles';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface SeedUser extends SafeUser {
  passwordHash: string;
}

// Returns a safe user object (no hash) on success, or null on failure.
export async function verifyUser(email: string | undefined, password: string | undefined): Promise<SafeUser | null> {
  if (!email || !password) return null;
  let user: SeedUser | (Awaited<ReturnType<typeof prisma.user.findUnique>>) | null;
  try {
    user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  } catch (e) {
    console.error('DB unavailable, falling back to seed accounts:', (e as Error).message);
    user = SEED_USERS.find((u) => u.email === email.toLowerCase()) || null;
  }
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
}

// In-memory fallback for cold starts before the first migration.
const DEMO_HASH = '$2a$10$sddh.CAmQA3GjhllDLkcq.GDmsyxwLLlajl2gK4CRg9fLKMoqk0UC';
const SEED_USERS: SeedUser[] = [
  { id: 'u1', name: 'Alice K.',  email: 'admin@cona.com',  role: 'Super Admin',        passwordHash: DEMO_HASH },
  { id: 'u2', name: 'Bruno M.',  email: 'ops@cona.com',    role: 'Operations Manager', passwordHash: DEMO_HASH },
  { id: 'u3', name: 'Chloe M.', email: 'guide@cona.com',  role: 'Tour Guide',         passwordHash: DEMO_HASH },
  { id: 'u4', name: 'David S.', email: 'driver@cona.com', role: 'Driver',             passwordHash: DEMO_HASH },
];
