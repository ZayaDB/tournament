import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const judge = await prisma.judge.findUnique({
      where: { id },
      include: {
        tournament: {
          include: {
            participants: {
              include: {
                scores: true,
              },
              orderBy: {
                registrationNumber: "asc",
              },
            },
            judges: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    return NextResponse.json({ judge });
  } catch (error) {
    console.error("Error fetching judge:", error);
    return NextResponse.json(
      { error: "Error fetching judge" },
      { status: 500 }
    );
  }
}
