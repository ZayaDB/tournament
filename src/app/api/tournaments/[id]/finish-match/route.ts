import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const { matchId, adminPassword } = await request.json();

    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the match with participants and their scores
    const match = await prisma.match.findUnique({
      where: { id: matchId },
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
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.participants.length !== 2) {
      return NextResponse.json(
        { error: "Match must have exactly 2 participants" },
        { status: 400 }
      );
    }

    // Calculate average scores for each participant
    const participantScores = match.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      averageScore:
        participant.scores.length > 0
          ? participant.scores.reduce((sum, score) => sum + score.value, 0) /
            participant.scores.length
          : 0,
    }));

    // Determine winner (highest average score)
    const winner = participantScores.reduce((prev, current) =>
      current.averageScore > prev.averageScore ? current : prev
    );

    // Update match with winner
    await prisma.match.update({
      where: { id: matchId },
      data: { winnerId: winner.id },
    });

    // Check if this was the final match
    const totalMatches = await prisma.match.count({
      where: { tournamentId },
    });

    const completedMatches = await prisma.match.count({
      where: {
        tournamentId,
        winnerId: { not: null },
      },
    });

    // If all matches are completed, update tournament status
    if (completedMatches === totalMatches) {
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({
      winner,
      matchCompleted: true,
      tournamentCompleted: completedMatches === totalMatches,
    });
  } catch (error) {
    console.error("Error finishing match:", error);
    return NextResponse.json(
      { error: "Error finishing match" },
      { status: 500 }
    );
  }
}
