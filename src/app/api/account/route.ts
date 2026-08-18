import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const [wishlistCount, inquiryCount, orderCount] = await Promise.all([
    prisma.userWishlist.count({ where: { userId: user.id } }),
    prisma.inquiry.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id } }),
  ]);
  return NextResponse.json({ user, stats: { wishlistCount, inquiryCount, orderCount } });
}
