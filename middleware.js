// middleware.js
// Defense-in-depth: block /dashboard at the edge for non-staff, before the
// page even renders. (getServerSideProps still enforces the same rule.)
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) =>
      ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'].includes(token?.role),
  },
  pages: { signIn: '/' },
});

export const config = { matcher: ['/dashboard/:path*'] };
