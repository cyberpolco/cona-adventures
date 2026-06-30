// middleware.js
// Defense-in-depth: block /dashboard at the edge for anyone who isn't
// admin/ops, before the page even renders. (getServerSideProps still
// enforces the same rule — two layers, deny by default.)
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) =>
      ['Super Admin', 'Operations Manager'].includes(token?.role),
  },
  pages: { signIn: '/' },
});

export const config = { matcher: ['/dashboard/:path*'] };
