import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = formData.get("category") as "floor-plans" | "assets";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!["floor-plans", "assets"].includes(category)) {
    return NextResponse.json(
      { error: "Invalid category. Must be 'floor-plans' or 'assets'" },
      { status: 400 }
    );
  }

  try {
    const result = await saveUploadedFile(file, category);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
