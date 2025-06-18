import { NextResponse } from "next/server";
import { createTournament } from "@/lib/tournament";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, danceStyle, participantCount } = await request.json();

    if (!name || !danceStyle || !participantCount) {
      return NextResponse.json(
        { error: "Name, dance style, and participant count are required" },
        { status: 400 }
      );
    }

    // 활성화된 토너먼트가 있는지 확인
    const activeTournament = await prisma.tournament.findFirst({
      where: {
        status: "ACTIVE",
      },
    });

    // 이미 활성화된 토너먼트가 있으면 그것을 반환
    if (activeTournament) {
      return NextResponse.json(activeTournament);
    }

    // 활성화된 토너먼트가 없으면 새로 생성
    const tournament = await createTournament(
      name,
      danceStyle,
      participantCount,
      "default-event"
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
