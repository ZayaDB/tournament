import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteSegmentProps {
  params: { matchId: string };
}

export async function GET(req: NextRequest, { params }: RouteSegmentProps) {
  try {
    const { matchId } = params;

    const votes = await prisma.vote.findMany({
      where: { matchId },
      include: {
        judge: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json(
      { error: "Error fetching votes" },
      { status: 500 }
    );
  }
}

// Route segment config
export const dynamic = "force-dynamic";
