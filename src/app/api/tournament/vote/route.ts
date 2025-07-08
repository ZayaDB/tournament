import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matchId, participantId, judgeId } = await request.json();

    if (!matchId || !judgeId) {
      return NextResponse.json(
        { error: "Match ID and judge ID are required" },
        { status: 400 }
      );
    }

    // For tie votes, participantId will be "tie"
    if (participantId !== "tie" && !participantId) {
      return NextResponse.json(
        { error: "Participant ID is required for non-tie votes" },
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
    const votes = await prisma.vote.findMany({
      where: {
        matchId,
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
        participants: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const totalJudges = match.tournament.judges.length;
    const totalVotes = votes.length;

    // If all judges have voted
    if (totalVotes >= totalJudges) {
      // Count tie votes
      const tieVotes = votes.filter((v) => v.votedFor === "tie").length;

      // If all judges voted for tie
      if (tieVotes === totalJudges) {
        // For tie, we don't set a winner (winnerId remains null)
        // This indicates a tie situation
        return NextResponse.json({
          success: true,
          result: "tie",
          message: "All judges voted for tie",
        });
      }

      // If not all tie votes, count regular votes
      const voteCount = votes.reduce((acc, vote) => {
        if (vote.votedFor !== "tie") {
          acc[vote.votedFor] = (acc[vote.votedFor] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number });

      // Find the winner (participant with most votes)
      let maxVotes = 0;
      let winnerId = null;

      Object.entries(voteCount).forEach(([participantId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          winnerId = participantId;
        }
      });

      if (winnerId) {
        // Update match winner
        await prisma.match.update({
          where: { id: matchId },
          data: {
            winnerId,
          },
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
                  connect: [{ id: winnerId }],
                },
              },
            });
          }
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
