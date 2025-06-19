import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RAILWAY_API_URL =
  process.env.RAILWAY_API_URL ||
  "https://tournament-production-4613.up.railway.app";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File;
    const tournamentId = formData.get("tournamentId") as string;

    if (!name || !image || !tournamentId) {
      return NextResponse.json(
        { error: "Name, image, and tournament ID are required" },
        { status: 400 }
      );
    }

    // Upload image to Railway server
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

    // Get the next registration number and create participant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUniqueOrThrow({
        where: { id: tournamentId },
      });

      const participant = await tx.participant.create({
        data: {
          name,
          imageUrl,
          registrationNumber: tournament.nextRegistrationNumber,
          tournamentId,
        },
      });

      await tx.tournament.update({
        where: { id: tournamentId },
        data: {
          nextRegistrationNumber: tournament.nextRegistrationNumber + 1,
        },
      });

      return participant;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Error creating participant" },
      { status: 500 }
    );
  }
}
