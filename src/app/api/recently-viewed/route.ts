import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_RECENTLY_VIEWED = 20;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  const items = await prisma.recentlyViewed.findMany({
    where: { userId: session.user.id },
    orderBy: { viewedAt: "desc" },
    take: MAX_RECENTLY_VIEWED,
    select: { listingId: true, type: true, viewedAt: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }
  const { listingId, type } = await req.json();
  if (!listingId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await prisma.recentlyViewed.upsert({
    where: { userId_listingId: { userId: session.user.id, listingId } },
    update: { viewedAt: new Date() },
    create: { userId: session.user.id, listingId, type },
  });
  const count = await prisma.recentlyViewed.count({
    where: { userId: session.user.id },
  });
  if (count > MAX_RECENTLY_VIEWED) {
    const oldest = await prisma.recentlyViewed.findMany({
      where: { userId: session.user.id },
      orderBy: { viewedAt: "asc" },
      take: count - MAX_RECENTLY_VIEWED,
      select: { id: true },
    });
    await prisma.recentlyViewed.deleteMany({
      where: { id: { in: oldest.map((r) => r.id) } },
    });
  }
  return NextResponse.json({ ok: true });
}
