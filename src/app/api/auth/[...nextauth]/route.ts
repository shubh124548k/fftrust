import { handlers } from "@/lib/auth";

async function diagnosticHandler(req: Request) {
  const method = req.method === "POST" ? "POST" : "GET";
  const response = await handlers[method]!(req as any);

  const url = new URL(req.url);
  const resLocation = response.headers.get("location") || "";
  const isRedirectToError =
    resLocation.includes("/api/auth/error") ||
    resLocation.includes("error=");

  if (response.status >= 400 || isRedirectToError) {
    const body = await response.clone().text().catch(() => "");
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(body);
    } catch {}
    console.error(
      "[AUTH_ERROR]",
      JSON.stringify({
        path: url.pathname,
        method: req.method,
        status: response.status,
        location: resLocation || null,
        errorParam: url.searchParams.get("error") || null,
        message: parsed.message || body.substring(0, 300),
        envPresent: {
          AUTH_SECRET: !!process.env.AUTH_SECRET,
          AUTH_SECRET_len: process.env.AUTH_SECRET?.length ?? 0,
          AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
          AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
          DATABASE_URL: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.substring(0, 14) + "..."
            : null,
          NEXT_PUBLIC_SITE_URL:
            process.env.NEXT_PUBLIC_SITE_URL || null,
          AUTH_URL: process.env.AUTH_URL || null,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
        },
      })
    );
  }

  return response;
}

export const GET = diagnosticHandler;
export const POST = diagnosticHandler;
