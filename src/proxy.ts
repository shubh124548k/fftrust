import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedPaths = ["/account", "/seller"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const session = await auth();
    if (!session?.user) {
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
