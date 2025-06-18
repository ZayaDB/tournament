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
