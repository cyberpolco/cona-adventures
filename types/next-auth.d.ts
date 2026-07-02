import { ROLES } from '../lib/auth';

type Role = (typeof ROLES)[keyof typeof ROLES];

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
  }

  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
  }
}
