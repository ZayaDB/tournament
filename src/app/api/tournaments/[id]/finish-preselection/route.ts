import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get all participants and their average scores
    const participants = await prisma.participant.findMany({
      where: { tournamentId: id },
      include: {
        scores: true,
      },
    });

    // Calculate average scores and sort participants
    const participantsWithAvgScores = participants.map((participant) => {
      const avgScore =
        participant.scores.reduce((sum, score) => sum + score.value, 0) /
        (participant.scores.length || 1);
      return { ...participant, avgScore };
    });

    // Sort by average score in descending order
    participantsWithAvgScores.sort((a, b) => b.avgScore - a.avgScore);

    // Get the tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if we have enough participants with scores
    const participantsWithScores = participantsWithAvgScores.filter(
      (p) => p.scores.length > 0
    );

    if (participantsWithScores.length < tournament.participantCount) {
      return NextResponse.json(
        {
          error: "Not enough participants have been scored",
        },
        { status: 400 }
      );
    }

    // Update tournament status to READY_TO_BRACKET
    await prisma.tournament.update({
      where: { id },
      data: {
        status: "READY_TO_BRACKET",
      },
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error finishing preselection:", error);
    return NextResponse.json(
      { error: "Error finishing preselection" },
      { status: 500 }
    );
  }
}
