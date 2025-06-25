import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const { matchId } = await params;

    // Reset match status to PENDING for rematch
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "PENDING",
        winnerId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting match for rematch:", error);
    return NextResponse.json(
      { error: "Error resetting match for rematch" },
      { status: 500 }
    );
  }
}
