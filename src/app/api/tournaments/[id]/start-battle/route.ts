import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { adminPassword } = await request.json();

    // Verify admin password
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get tournament and verify it has participants
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: true,
        matches: {
          where: { round: 1 },
          orderBy: { matchNumber: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.participants.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 participants to start battle" },
        { status: 400 }
      );
    }

    // Update tournament status to BATTLE
    await prisma.tournament.update({
      where: { id },
      data: { status: "BATTLE" },
    });

    return NextResponse.json({
      success: true,
      message: "Battle started successfully",
      currentRound: 1,
      currentMatch: 1,
    });
  } catch (error) {
    console.error("Error starting battle:", error);
    return NextResponse.json(
      { error: "Error starting battle" },
      { status: 500 }
    );
  }
}
