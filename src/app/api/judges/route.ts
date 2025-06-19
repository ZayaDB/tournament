import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RAILWAY_API_URL =
  process.env.RAILWAY_API_URL ||
  "https://tournament-production-4613.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File;
    const tournamentId = formData.get("tournamentId") as string;

    console.log("Received judge data:", {
      name,
      tournamentId,
      imageName: image?.name,
    });

    if (!name || !image || !tournamentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // 이미지 Railway 서버로 업로드
    const uploadFormData = new FormData();
    uploadFormData.append("image", image);
    const uploadResponse = await fetch(`${RAILWAY_API_URL}/api/upload`, {
      method: "POST",
      body: uploadFormData,
    });
    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image to Railway");
    }
    const uploadResult = await uploadResponse.json();
    const imageUrl = `${RAILWAY_API_URL}/api/images/${uploadResult.filename}`;

    // Create judge in database
    const judge = await prisma.judge.create({
      data: {
        name,
        imageUrl,
        tournamentId,
      },
    });

    console.log("Judge created:", judge.id);

    return NextResponse.json({ judge });
  } catch (error) {
    console.error("Error creating judge:", error);
    return NextResponse.json(
      {
        error: `Error creating judge: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
