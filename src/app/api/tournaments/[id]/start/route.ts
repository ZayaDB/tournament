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

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Update tournament status to ACTIVE
    const tournament = await prisma.tournament.update({
      where: { id },
      data: { status: "ACTIVE" },
      include: {
        matches: {
          include: {
            participants: true,
          },
          orderBy: {
            round: "asc",
          },
        },
      },
    });

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error starting tournament:", error);
    return NextResponse.json(
      { error: "Error starting tournament" },
      { status: 500 }
    );
  }
}
