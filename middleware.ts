import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/lapor"];
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("sb-access-token")?.value;
  const isAuthenticated = !!accessToken;

  // Protect /lapor – redirect to homepage with login modal
  if (
    !isAuthenticated &&
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    const loginUrl = new URL("/?modal=login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin – redirect to homepage with login modal
  if (
    !isAuthenticated &&
    ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    return NextResponse.redirect(new URL("/?modal=login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lapor/:path*", "/admin/:path*"],
};
