import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { guestFavorites } = await req.json();
  if (!Array.isArray(guestFavorites)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const validIds = guestFavorites.filter((id: unknown) => typeof id === "string" && id.length > 0 && id.length <= 100);
  if (validIds.length === 0) {
    const serverWishlists = await prisma.userWishlist.findMany({
      where: { userId: session.user.id },
      select: { listingId: true },
    });
    return NextResponse.json({ favorites: serverWishlists.map((w) => w.listingId) });
  }
  for (const listingId of validIds) {
    const exists = await prisma.userWishlist.findUnique({
      where: { userId_listingId: { userId: session.user.id!, listingId } },
    });
    if (!exists) {
      await prisma.userWishlist.create({
        data: { userId: session.user.id!, listingId },
      });
    }
  }
  const merged = await prisma.userWishlist.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  });
  return NextResponse.json({ favorites: merged.map((w) => w.listingId) });
}
