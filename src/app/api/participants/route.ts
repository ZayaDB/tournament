import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

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

    // Save image to public directory
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imagePath = `/uploads/${Date.now()}-${image.name}`;
    await writeFile(join(process.cwd(), "public", imagePath), buffer);

    // Get the next registration number and create participant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUniqueOrThrow({
        where: { id: tournamentId },
      });

      const participant = await tx.participant.create({
        data: {
          name,
          imageUrl: imagePath,
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
