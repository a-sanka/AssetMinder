import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ floorPlanId: string }> }
) {
  const { floorPlanId } = await params;

  const floorPlan = await prisma.floorPlan.findUnique({
    where: { id: floorPlanId },
    include: {
      facility: true,
      locationMarkers: { orderBy: { name: "asc" } },
      assetPlacements: {
        include: {
          asset: true,
        },
        orderBy: { scannedAt: "desc" },
      },
    },
  });

  if (!floorPlan) {
    return NextResponse.json(
      { error: "Floor plan not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(floorPlan);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ floorPlanId: string }> }
) {
  const { floorPlanId } = await params;
  const body = await req.json();

  const floorPlan = await prisma.floorPlan.update({
    where: { id: floorPlanId },
    data: { name: body.name },
  });

  return NextResponse.json(floorPlan);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ floorPlanId: string }> }
) {
  const { floorPlanId } = await params;

  await prisma.floorPlan.delete({ where: { id: floorPlanId } });

  return NextResponse.json({ success: true });
}
