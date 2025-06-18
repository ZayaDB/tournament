import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true,
        matches: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { error: "Error fetching tournament" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all related data manually
    await prisma.$transaction(async (tx) => {
      // Get all matches for this tournament
      const matches = await tx.match.findMany({
        where: { tournamentId: id },
        select: { id: true },
      });

      const matchIds = matches.map((m) => m.id);

      // Delete votes for matches in this tournament
      await tx.vote.deleteMany({
        where: { matchId: { in: matchIds } },
      });

      // Delete scores for this tournament
      await tx.score.deleteMany({
        where: { tournamentId: id },
      });

      // Delete matches for this tournament
      await tx.match.deleteMany({
        where: { tournamentId: id },
      });

      // Delete participants for this tournament
      await tx.participant.deleteMany({
        where: { tournamentId: id },
      });

      // Finally delete the tournament
      await tx.tournament.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { error: "Error deleting tournament" },
      { status: 500 }
    );
  }
}
