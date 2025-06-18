import { NextResponse } from "next/server";
//import { prisma } from "@/lib/prisma";

// Temporarily disabled due to Next.js params type issue
export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  return NextResponse.json({ message: "API temporarily disabled" });

  /* Original implementation
  try {
    const matchId = await params.matchId;

    const votes = await prisma.vote.findMany({
      where: { matchId },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Error fetching votes" },
      { status: 500 }
    );
  }
  */
}

export const dynamic = "force-dynamic";
