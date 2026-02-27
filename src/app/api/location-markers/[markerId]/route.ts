import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateLocationMarkerSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ markerId: string }> }
) {
  const { markerId } = await params;

  const marker = await prisma.locationMarker.findUnique({
    where: { id: markerId },
    include: { floorPlan: { include: { facility: true } } },
  });

  if (!marker) {
    return NextResponse.json(
      { error: "Location marker not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(marker);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ markerId: string }> }
) {
  const { markerId } = await params;
  const body = await req.json();
  const parsed = updateLocationMarkerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const marker = await prisma.locationMarker.update({
    where: { id: markerId },
    data: parsed.data,
  });

  return NextResponse.json(marker);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ markerId: string }> }
) {
  const { markerId } = await params;

  await prisma.locationMarker.delete({ where: { id: markerId } });

  return NextResponse.json({ success: true });
}
