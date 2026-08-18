import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: { listings: true },
  });
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Seller profile already exists" }, { status: 409 });
  }
  const { displayName, description, contactPreference } = await req.json();
  if (!displayName || typeof displayName !== "string") {
    return NextResponse.json({ error: "Display name required" }, { status: 400 });
  }
  const profile = await prisma.sellerProfile.create({
    data: {
      userId: session.user.id,
      displayName,
      description: description || null,
      contactPreference: contactPreference || null,
    },
  });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "SELLER" },
  });
  return NextResponse.json({ profile });
}
