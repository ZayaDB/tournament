import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { participantId, tournamentId, value, judgeId } =
      await request.json();

    if (!participantId || !tournamentId || !value || !judgeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate score range
    if (value < 1 || value > 10) {
      return NextResponse.json(
        { error: "Score must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Check if this judge already scored this participant in this tournament
    const existingScore = await prisma.score.findFirst({
      where: {
        participantId,
        tournamentId,
        judgeId,
      },
    });

    let newScore;
    if (existingScore) {
      // Update existing score
      newScore = await prisma.score.update({
        where: { id: existingScore.id },
        data: { value },
      });
    } else {
      // Create new score
      newScore = await prisma.score.create({
        data: {
          value,
          judgeId,
          participantId,
          tournamentId,
        },
      });
    }

    // Get updated participant with all scores
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        scores: {
          where: { tournamentId },
        },
      },
    });

    return NextResponse.json({
      score: newScore,
      participant,
      averageScore: participant?.scores.length
        ? participant.scores.reduce((sum, s) => sum + s.value, 0) /
          participant.scores.length
        : 0,
    });
  } catch (error) {
    console.error("Error creating score:", error);
    return NextResponse.json(
      { error: "Error creating score" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const participantId = searchParams.get("participantId");

    if (!tournamentId) {
      return NextResponse.json(
        { error: "Tournament ID is required" },
        { status: 400 }
      );
    }

    const where: any = { tournamentId };
    if (participantId) {
      where.participantId = participantId;
    }

    const scores = await prisma.score.findMany({
      where,
      include: {
        participant: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Error fetching scores" },
      { status: 500 }
    );
  }
}
