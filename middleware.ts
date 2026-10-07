import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "./lib/types";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/assessments",
  "/contact",
  "/pricing",
  "/login",
  "/register",
  "/payment/success",
  "/payment/cancel",
  "/payment/cancelled",
];

function getRoleFromCookie(req: NextRequest): Role | null {
  const raw = req.cookies.get("dap_user")?.value;
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as { role?: Role };
    if (user.role === "ADMIN" || user.role === "RECRUITER" || user.role === "CANDIDATE") {
      return user.role;
    }
    return null;
  } catch {
    return null;
  }
}

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/assessments/"))) {
    return true;
  }
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("dap_access_token")?.value;
  const role = getRoleFromCookie(req);

  // Auth pages: redirect signed-in users to their dashboard.
  if (pathname === "/login" || pathname === "/register") {
    if (token && role) {
      const target = role === "ADMIN" ? "/admin" : role === "RECRUITER" ? "/recruiter" : "/dashboard";
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  if (isPublic(pathname)) return NextResponse.next();

  // Protected: require a session.
  if (!token || !role) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Role-scoped route guards.
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/recruiter") && role !== "RECRUITER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/dashboard") && role !== "CANDIDATE" && role !== "ADMIN") {
    // Recruiters have their own shell; keep candidates + admins here.
    if (role === "RECRUITER") return NextResponse.redirect(new URL("/recruiter", req.url));
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
