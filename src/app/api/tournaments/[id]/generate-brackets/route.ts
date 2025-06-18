import { NextResponse } from "next/server";
import { generateBrackets } from "@/lib/tournament";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { adminPassword } = await request.json();

    // base64로 디코딩
    const decodedPassword = atob(adminPassword);

    if (decodedPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const matches = await generateBrackets(id);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error generating brackets:", error);
    return NextResponse.json(
      { error: "Error generating brackets" },
      { status: 500 }
    );
  }
}
