import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    // Get the current active match (lowest round with participants but no winner)
    const currentMatch = await prisma.match.findFirst({
      where: {
        tournamentId,
        participants: {
          some: {},
        },
        winnerId: null,
      },
      include: {
        participants: {
          include: {
            scores: {
              where: {
                tournamentId,
              },
            },
          },
        },
      },
      orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    });

    if (!currentMatch) {
      return NextResponse.json({
        message: "No active matches found",
        tournamentStatus: "COMPLETED",
      });
    }

    // Get tournament info
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    // Calculate total rounds
    const totalMatches = await prisma.match.count({
      where: { tournamentId },
    });

    const totalRounds = Math.ceil(Math.log2(tournament?.participantCount || 8));

    return NextResponse.json({
      currentMatch,
      tournament,
      totalRounds,
      currentRound: currentMatch.round,
    });
  } catch (error) {
    console.error("Error fetching current match:", error);
    return NextResponse.json(
      { error: "Error fetching current match" },
      { status: 500 }
    );
  }
}
