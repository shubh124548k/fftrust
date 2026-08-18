import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = await prisma.inquiry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ inquiries });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { listingId, type, selectedPackageId, message } = body;
  if (!type || typeof type !== "string") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const inquiry = await prisma.inquiry.create({
    data: {
      userId: session.user.id,
      listingId: listingId || null,
      type,
      selectedPackageId: selectedPackageId || null,
      message: message || null,
    },
  });
  return NextResponse.json({ inquiry });
}
