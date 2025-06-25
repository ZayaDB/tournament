import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        tournaments: {
          include: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error fetching events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, date } = await request.json();

    if (!name || !date) {
      return NextResponse.json(
        { error: "Event name and date are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name,
        date: new Date(date),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    );
  }
}
