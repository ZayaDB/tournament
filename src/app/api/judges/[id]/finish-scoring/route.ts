import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get judge and tournament info
    const judge = await prisma.judge.findUnique({
      where: { id },
      include: {
        tournament: {
          include: {
            participants: {
              include: {
                scores: true,
              },
            },
            judges: true,
          },
        },
      },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    // Check if all participants have been scored by this judge
    const allScored = judge.tournament.participants.every((participant) =>
      participant.scores.some((score) => score.judgeId === id)
    );

    if (!allScored) {
      return NextResponse.json(
        { error: "모든 참가자의 점수를 입력해야 합니다." },
        { status: 400 }
      );
    }

    // Check if all judges have finished scoring
    const allJudgesFinished = judge.tournament.judges.every((j) =>
      judge.tournament.participants.every((participant) =>
        participant.scores.some((score) => score.judgeId === j.id)
      )
    );

    // If all judges have finished, calculate average scores and select top participants
    if (allJudgesFinished) {
      // Calculate average scores for each participant
      const participantsWithScores = judge.tournament.participants.map(
        (participant) => {
          const avgScore =
            participant.scores.reduce((sum, score) => sum + score.value, 0) /
            participant.scores.length;
          return {
            participant,
            avgScore,
          };
        }
      );

      // Sort by average score in descending order
      participantsWithScores.sort((a, b) => b.avgScore - a.avgScore);

      // Get the tournament's participant count limit
      const tournament = await prisma.tournament.findUnique({
        where: { id: judge.tournament.id },
        select: { participantCount: true },
      });

      if (!tournament) {
        return NextResponse.json(
          { error: "Tournament not found" },
          { status: 404 }
        );
      }

      // Select top N participants where N is the tournament's participant count
      const selectedParticipantIds = new Set(
        participantsWithScores
          .slice(0, tournament.participantCount)
          .map((p) => p.participant.id)
      );

      // Delete scores and participants that didn't make the cut
      await prisma.$transaction(async (tx) => {
        // First, delete scores for eliminated participants
        await tx.score.deleteMany({
          where: {
            participantId: {
              in: participantsWithScores
                .filter((p) => !selectedParticipantIds.has(p.participant.id))
                .map((p) => p.participant.id),
            },
          },
        });

        // Then, delete the eliminated participants
        await tx.participant.deleteMany({
          where: {
            AND: [
              { tournamentId: judge.tournament.id },
              { id: { notIn: Array.from(selectedParticipantIds) } },
            ],
          },
        });

        // Finally, update tournament status
        await tx.tournament.update({
          where: { id: judge.tournament.id },
          data: { status: "READY_TO_BRACKET" },
        });
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error finishing scoring:", error);
    return NextResponse.json(
      { error: "Error finishing scoring" },
      { status: 500 }
    );
  }
}
