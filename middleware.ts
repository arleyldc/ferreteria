/**
 * @file middleware.ts
 * @description NextAuth middleware for route protection
 */

import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

const redirectToDashboard = (req: NextRequest) =>
  NextResponse.redirect(new URL("/dashboard", req.url));

const redirectToStore = (req: NextRequest) =>
  NextResponse.redirect(new URL("/store", req.url));

export const middleware = auth((req) => {
  const token = req.auth?.user;
  const pathname = req.nextUrl.pathname;

  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = (token as any).role as string;

    if (role === "CLIENTE") {
      return redirectToStore(req);
    }

    return redirectToDashboard(req);
  }

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!token) {
    return NextResponse.next();
  }

  const role = (token as any).role as string;

  if (role === "CLIENTE" && pathname.startsWith("/dashboard")) {
    return redirectToStore(req);
  }

  if (role === "ALMACENISTA") {
    if (
      pathname === "/dashboard/pos" ||
      pathname.startsWith("/dashboard/audit") ||
      pathname.startsWith("/dashboard/settings/categories")
    ) {
      return redirectToDashboard(req);
    }
  }

  if (
    pathname.startsWith("/dashboard/audit") ||
    pathname.startsWith("/dashboard/settings/categories") ||
    pathname.startsWith("/dashboard/settings/users")
  ) {
    if (role !== "ADMIN") {
      return redirectToDashboard(req);
    }
  }

  if (pathname === "/dashboard/pos") {
    if (role === "ALMACENISTA") {
      return redirectToDashboard(req);
    }
  }

  if (pathname.startsWith("/dashboard/movements")) {
    if (role === "VENDEDOR") {
      return redirectToDashboard(req);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard/:path*", "/dashboard", "/store/:path*", "/store"],
};
