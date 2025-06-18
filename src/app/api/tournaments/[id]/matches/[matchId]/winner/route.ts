import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(
  request: Request,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const { matchId } = params;
    const { winnerId, adminPassword } = await request.json();

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // 현재 매치 정보 가져오기
    const currentMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        participants: true,
      },
    });

    if (!currentMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // 승자가 현재 매치의 참가자인지 확인
    if (!currentMatch.participants.some((p) => p.id === winnerId)) {
      return NextResponse.json({ error: "Invalid winner" }, { status: 400 });
    }

    // 다음 라운드의 매치 찾기
    const nextMatch = await prisma.match.findFirst({
      where: {
        tournamentId: currentMatch.tournamentId,
        round: currentMatch.round + 1,
        matchNumber: Math.ceil(currentMatch.matchNumber / 2),
      },
    });

    // 트랜잭션으로 승자 업데이트와 다음 라운드 매치 업데이트를 동시에 처리
    const updatedMatch = await prisma.$transaction(async (tx) => {
      // 현재 매치의 승자 업데이트
      const updated = await tx.match.update({
        where: { id: matchId },
        data: { winnerId },
        include: {
          participants: true,
        },
      });

      if (nextMatch) {
        // 승자를 다음 라운드 매치의 참가자로 추가
        await tx.match.update({
          where: { id: nextMatch.id },
          data: {
            participants: {
              connect: { id: winnerId },
            },
          },
        });
      }

      return updated;
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error selecting winner:", error);
    return NextResponse.json(
      { error: "Error selecting winner" },
      { status: 500 }
    );
  }
}
