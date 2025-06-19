import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const { matchId } = await params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        participants: true,
        tournament: {
          include: {
            judges: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Get votes for this match
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

    // Get scores for participants in this match
    const participantScores = await prisma.score.findMany({
      where: {
        participantId: {
          in: match.participants.map((p) => p.id),
        },
        tournamentId: match.tournamentId,
      },
      include: {
        participant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...match,
      votes,
      participantScores,
    });
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json(
      { error: "Error fetching match" },
      { status: 500 }
    );
  }
}
