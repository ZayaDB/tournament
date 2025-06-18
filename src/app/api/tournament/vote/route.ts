import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matchId, participantId, judgeId } = await request.json();

    if (!matchId || !participantId || !judgeId) {
      return NextResponse.json(
        { error: "Match ID, participant ID, and judge ID are required" },
        { status: 400 }
      );
    }

    // Check if judge has already voted for this match
    const existingVote = await prisma.vote.findFirst({
      where: {
        judgeId,
        matchId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "이미 투표하셨습니다." },
        { status: 400 }
      );
    }

    // Create vote
    await prisma.vote.create({
      data: {
        judgeId,
        matchId,
        votedFor: participantId,
      },
    });

    // Count votes for this match
    const votes = await prisma.vote.groupBy({
      by: ["votedFor"],
      where: {
        matchId,
      },
      _count: {
        votedFor: true,
      },
    });

    // Get total number of judges for this tournament
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
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

    const totalJudges = match.tournament.judges.length;
    const totalVotes = votes.reduce(
      (sum: number, v: { _count: { votedFor: number } }) =>
        sum + v._count.votedFor,
      0
    );

    // If all judges have voted, determine the winner
    if (totalVotes >= totalJudges) {
      const winner = votes.reduce(
        (
          prev: { votedFor: string; _count: { votedFor: number } },
          current: { votedFor: string; _count: { votedFor: number } }
        ) => {
          return prev._count.votedFor > current._count.votedFor
            ? prev
            : current;
        }
      );

      // Update match winner
      await prisma.match.update({
        where: { id: matchId },
        data: { winnerId: winner.votedFor },
      });

      // Create next round match if needed
      const currentMatch = await prisma.match.findUnique({
        where: { id: matchId },
        include: { tournament: true },
      });

      if (currentMatch) {
        const nextRoundMatch = await prisma.match.findFirst({
          where: {
            round: currentMatch.round + 1,
            tournamentId: currentMatch.tournamentId,
          },
          include: { participants: true },
        });

        if (nextRoundMatch) {
          await prisma.match.update({
            where: { id: nextRoundMatch.id },
            data: {
              participants: {
                connect: [{ id: winner.votedFor }],
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json(
      { error: "Error processing vote" },
      { status: 500 }
    );
  }
}
