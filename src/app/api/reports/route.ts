import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { targetType, targetId, reason, description } = await req.json();
  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["listing", "seller"].includes(targetType)) {
    return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
  }
  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      targetType,
      targetId,
      reason,
      description: description || null,
    },
  });
  return NextResponse.json({ report });
}
