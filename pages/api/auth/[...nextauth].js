// pages/api/auth/[...nextauth].js
// Real authentication endpoint. Verifies credentials on the SERVER and
// assigns the role from the user record — the client can never choose it.
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyUser } from '../../../lib/users.server';

export const authOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await verifyUser(credentials?.email, credentials?.password);
        if (!user) return null; // wrong email or password → auth fails
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Persist the server-assigned role into the signed JWT.
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    // Expose role (read-only) to the client session.
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: '/' }, // login happens in the modal on the home route
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
