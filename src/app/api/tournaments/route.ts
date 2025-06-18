import { NextResponse } from "next/server";
import { createTournament } from "@/lib/tournament";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        event: true,
        judges: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Error fetching tournaments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { eventId, name, danceStyle, participantCount } =
      await request.json();

    if (!eventId || !danceStyle || !participantCount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const tournamentName = name ?? `${danceStyle} Battle`;
    const tournament = await createTournament(
      tournamentName,
      danceStyle,
      participantCount,
      eventId
    );
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Error creating tournament" },
      { status: 500 }
    );
  }
}
