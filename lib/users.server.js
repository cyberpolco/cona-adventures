// lib/users.server.js
// SERVER-ONLY user store. Never import this from a client component.
//
// ⚠️ PHASE 2 SWAP-POINT:
// This in-memory seed exists only so login is REAL today (server-verified,
// hashed passwords, server-assigned roles) without forcing the database
// decision yet. In Phase 2, replace the body of findUserByEmail() with a
// real query (Prisma/Supabase/Mongo) — nothing else in the auth layer changes.
//
// All seed accounts share the demo password: ChangeMe!2026  (change immediately)

import bcrypt from 'bcryptjs';

// bcrypt hash of "ChangeMe!2026"
const DEMO_HASH = '$2a$10$sddh.CAmQA3GjhllDLkcq.GDmsyxwLLlajl2gK4CRg9fLKMoqk0UC';

const USERS = [
  { id: 'u1', name: 'Alice K.',   email: 'admin@cona.com',   role: 'Super Admin',         passwordHash: DEMO_HASH },
  { id: 'u2', name: 'Bruno M.',   email: 'ops@cona.com',     role: 'Operations Manager',  passwordHash: DEMO_HASH },
  { id: 'u3', name: 'Chloe M.',   email: 'guide@cona.com',   role: 'Tour Guide',          passwordHash: DEMO_HASH },
  { id: 'u4', name: 'David S.',   email: 'driver@cona.com',  role: 'Driver',              passwordHash: DEMO_HASH },
];

function findUserByEmail(email) {
  if (!email) return null;
  return USERS.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

// Returns a safe user object (no hash) on success, or null on failure.
export async function verifyUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || !password) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
