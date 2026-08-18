import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] });
  }
  const wishlists = await prisma.userWishlist.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  });
  return NextResponse.json({ favorites: wishlists.map((w) => w.listingId) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { listingId } = await req.json();
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "Invalid listingId" }, { status: 400 });
  }
  const existing = await prisma.userWishlist.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });
  if (existing) {
    await prisma.userWishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.userWishlist.create({
    data: { userId: session.user.id, listingId },
  });
  return NextResponse.json({ favorited: true });
}
