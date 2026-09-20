import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, isGovernmentRole } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/properties/") ||
    pathname.startsWith("/ulpin-registry") ||
    pathname.startsWith("/land-records") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/help-support") ||
    pathname === "/login" ||
    pathname === "/signup";

  const isGovernmentRoute = pathname.startsWith("/government");

  const sessionToken = request.cookies.get("session")?.value;

  if (!sessionToken) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifySession(sessionToken);

  if (!user) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Enforce Government role requirement for /government/... routes
  if (isGovernmentRoute) {
    if (!isGovernmentRole(user.role)) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|login|signup|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)",
  ],
};
