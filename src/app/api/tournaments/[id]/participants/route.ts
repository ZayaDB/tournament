import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participants = await prisma.participant.findMany({
      where: {
        tournamentId: id,
      } as Prisma.ParticipantWhereInput,
      include: {
        scores: true,
      } as Prisma.ParticipantInclude,
      orderBy: {
        registrationNumber: "asc",
      } as Prisma.ParticipantOrderByWithRelationInput,
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Error fetching participants" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const { participantId } = await request.json();

    // 참가자 삭제
    await prisma.participant.delete({
      where: { id: participantId },
    });

    // 남은 참가자 수로 status 자동 전환
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { participants: true },
    });
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }
    const count = tournament.participants.length;
    const limit = tournament.participantCount;
    let newStatus = "PENDING";
    if (count === limit) newStatus = "READY_TO_BRACKET";
    else if (count > limit) newStatus = "PRESELECTION";
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: newStatus },
    });

    return NextResponse.json({ status: newStatus, participantCount: count });
  } catch (error) {
    console.error("Error deleting participant:", error);
    return NextResponse.json(
      { error: "Error deleting participant" },
      { status: 500 }
    );
  }
}
