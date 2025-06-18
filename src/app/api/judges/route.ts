import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Save image
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageName = `judge-${Date.now()}-${image.name}`;
    const imagePath = join(process.cwd(), "public", "uploads", imageName);
    await writeFile(imagePath, buffer);
    const imageUrl = `/uploads/${imageName}`;

    console.log("Image saved:", imageUrl);

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
