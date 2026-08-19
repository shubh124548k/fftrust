if (!process.env.AUTH_URL && process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.AUTH_URL = process.env.NEXT_PUBLIC_SITE_URL;
}

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function redactUrlCredentials(url: string): string {
  return url.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
}

function redactSecrets(val: unknown): unknown {
  if (typeof val === "string") {
    return val
      .replace(/\/\/[^:]+:[^@]+@/g, "//***:***@")
      .replace(/GOCSPX-[a-zA-Z0-9_-]+/g, "GOCSPX-***")
      .replace(/eyJ[a-zA-Z0-9_-]{20,}/g, "eyJ***")
      .replace(/"[^"]*[Ss]ecret[^"]*"\s*:\s*"[^"]*"/g, '"***": "***"')
      .replace(/"[^"]*[Tt]oken[^"]*"\s*:\s*"[^"]*"/g, '"***": "***"');
  }
  if (val && typeof val === "object") {
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const lk = k.toLowerCase();
      if (
        lk.includes("secret") ||
        lk.includes("token") ||
        lk.includes("password") ||
        lk.includes("cookie") ||
        lk.includes("authorization")
      ) {
        safe[k] = "***";
      } else {
        safe[k] = redactSecrets(v);
      }
    }
    return safe;
  }
  return val;
}

function envSummary() {
  return {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_SECRET_len: process.env.AUTH_SECRET?.length ?? 0,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL_protocol: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.split("?")[0].replace(
          /\/\/[^:]+:[^@]+@/,
          "//***:***@"
        )
      : null,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    AUTH_URL: process.env.AUTH_URL || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  debug: true,
  logger: {
    error(error) {
      const name = error.name || "UnknownError";
      const type = (error as { type?: string }).type || name;
      const msg = redactSecrets(error.message) || "";
      const env = envSummary();

      let causeInfo = "none";
      if (error.cause && typeof error.cause === "object") {
        const cause = error.cause as Record<string, unknown>;
        if (cause.err instanceof Error) {
          causeInfo = `${cause.err.name}: ${redactSecrets(cause.err.message)}`;
        } else if (typeof cause === "object") {
          causeInfo = JSON.stringify(redactSecrets(cause));
        }
      }

      console.error(
        `[AUTH_DIAG] ERROR type=${type} name=${name} msg=${msg} cause=${causeInfo} env=${JSON.stringify(env)}`
      );

      if (error.stack) {
        const cleanStack = error.stack
          .split("\n")
          .map((l) => redactSecrets(l))
          .join("\n");
        console.error(`[AUTH_DIAG] STACK ${cleanStack}`);
      }
    },
    warn(code) {
      console.warn(`[AUTH_DIAG] WARN code=${code}`);
    },
    debug(message, metadata) {
      const meta =
        metadata && typeof metadata === "object"
          ? JSON.stringify(redactSecrets(metadata))
          : metadata
            ? String(metadata)
            : "";
      console.log(`[AUTH_DIAG] DEBUG ${message} ${meta}`);
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            });
          }
        } catch {
          // Database error during sign-in — allow auth to proceed without DB update
        }
      }
      return true;
    },
  },
});
