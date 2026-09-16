import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Resolves the tenant subdomain from the request host and rewrites the
 * request to /t/<subdomain>/... so tenant routes can be served under one
 * dynamic segment. The apex domain (houseofsenses.vn) keeps serving the
 * root app routes (the main "pick your home" landing page).
 */
export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const host = hostname.split(":")[0];
  const parts = host.split(".");

  let subdomain: string | null = null;

  // Development: tenant.localhost
  if (host.endsWith("localhost") && parts.length > 1) {
    subdomain = parts[0];
  }
  // Production: tenant.houseofsenses.vn
  else if (parts.length > 2) {
    subdomain = parts[0];
  }

  if (subdomain && subdomain !== "www") {
    const url = request.nextUrl.clone();
    url.pathname = `/t/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
