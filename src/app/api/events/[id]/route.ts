import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all related data manually
    await prisma.$transaction(async (tx) => {
      // Get all tournaments for this event
      const tournaments = await tx.tournament.findMany({
        where: { eventId: id },
        select: { id: true },
      });

      const tournamentIds = tournaments.map((t) => t.id);

      // Delete votes for matches in these tournaments
      const matches = await tx.match.findMany({
        where: { tournamentId: { in: tournamentIds } },
        select: { id: true },
      });

      const matchIds = matches.map((m) => m.id);

      await tx.vote.deleteMany({
        where: { matchId: { in: matchIds } },
      });

      // Delete scores for these tournaments
      await tx.score.deleteMany({
        where: { tournamentId: { in: tournamentIds } },
      });

      // Delete matches for these tournaments
      await tx.match.deleteMany({
        where: { tournamentId: { in: tournamentIds } },
      });

      // Delete participants for these tournaments
      await tx.participant.deleteMany({
        where: { tournamentId: { in: tournamentIds } },
      });

      // Delete tournaments
      await tx.tournament.deleteMany({
        where: { eventId: id },
      });

      // Finally delete the event
      await tx.event.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    );
  }
}
