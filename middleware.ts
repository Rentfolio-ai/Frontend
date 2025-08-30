import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname === '/') {
          return true;
        }

        // In development, allow all access for easier testing
        if (process.env.NODE_ENV === 'development') {
          return true;
        }

        // Require authentication for protected routes in production
        if (req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/map') ||
            req.nextUrl.pathname.startsWith('/properties') ||
            req.nextUrl.pathname.startsWith('/reports') ||
            req.nextUrl.pathname.startsWith('/insights') ||
            req.nextUrl.pathname.startsWith('/account')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
