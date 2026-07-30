import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

const rolePaths: Record<string, Role[]> = {
  "/app/users": ["ADMIN"],
  "/app/settings": ["ADMIN"],
  "/app/teachers": ["ADMIN", "PRINCIPAL", "DEPUTY"],
};

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as Role | undefined;
    const path = req.nextUrl.pathname;

    for (const [prefix, roles] of Object.entries(rolePaths)) {
      if (path === prefix || path.startsWith(prefix + "/")) {
        if (!role || !roles.includes(role)) {
          return NextResponse.redirect(new URL("/app", req.url));
        }
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/app")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/app/:path*"],
};
