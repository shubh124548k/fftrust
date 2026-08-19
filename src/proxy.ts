import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/account", "/seller"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      const url = request.nextUrl.clone();
      url.searchParams.set("auth-required", "true");
      url.searchParams.set("callbackUrl", pathname);
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/seller/:path*"],
};
