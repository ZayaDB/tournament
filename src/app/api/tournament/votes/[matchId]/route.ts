import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: { matchId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(_request: Request | NextRequest, context: Context) {
  const matchId = context.params.matchId;

  try {
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
