// lib/roles.ts — role constants only, safe to import from client components.
// Keep this file free of server-only imports (next-auth/next, Prisma, bcrypt) —
// lib/auth.ts pulls those in for requireRole() and must stay server-only.

export const ROLES = {
  ADMIN:   'Super Admin',
  OPS:     'Operations Manager',
  GUIDE:   'Tour Guide',
  DRIVER:  'Driver',
  PARTNER: 'Hotel Partner',
  CLIENT:  'Client',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
