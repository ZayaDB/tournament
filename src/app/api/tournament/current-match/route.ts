import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        status: "ACTIVE",
      },
      include: {
        matches: {
          where: {
            winnerId: null,
          },
          include: {
            participants: true,
          },
          orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
          take: 1,
        },
      },
    });

    if (!tournament || tournament.matches.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(tournament.matches[0]);
  } catch (error) {
    console.error("Error fetching current match:", error);
    return NextResponse.json(
      { error: "Error fetching current match" },
      { status: 500 }
    );
  }
}
