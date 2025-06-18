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

    // Create score
    const newScore = await prisma.score.create({
      data: {
        value,
        judgeId,
        participantId,
        tournamentId,
      },
    });

    return NextResponse.json(newScore);
  } catch (error) {
    console.error("Error creating score:", error);
    return NextResponse.json(
      { error: "Error creating score" },
      { status: 500 }
    );
  }
}
