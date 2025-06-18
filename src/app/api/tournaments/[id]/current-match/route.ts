import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Find active match for the tournament
    const match = await prisma.match.findFirst({
      where: {
        tournamentId: params.id,
        winnerId: null,
        participants: {
          some: {}, // At least one participant
        },
      },
      include: {
        participants: true,
        tournament: {
          include: {
            judges: true,
          },
        },
      },
      orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    });

    if (!match) {
      return NextResponse.json(
        { error: "No active match found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ currentMatch: match });
  } catch (error) {
    console.error("Error fetching current match:", error);
    return NextResponse.json(
      { error: "Error fetching current match" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
