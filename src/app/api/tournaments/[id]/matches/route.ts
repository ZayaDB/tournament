import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matches = await prisma.match.findMany({
      where: {
        tournamentId: id,
      },
      include: {
        participants: true,
      },
      orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching tournament matches:", error);
    return NextResponse.json(
      { error: "Error fetching tournament matches" },
      { status: 500 }
    );
  }
}
