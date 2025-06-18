import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ 여기에 Props 따로 선언하지 마세요
export async function GET(
  request: NextRequest,
  context: { params: { matchId: string } } // 이거만!
) {
  try {
    const { matchId } = context.params;

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

export const dynamic = "force-dynamic";
