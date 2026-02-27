import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPlacementSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const floorPlanId = req.nextUrl.searchParams.get("floorPlanId");

  const placements = await prisma.assetPlacement.findMany({
    where: floorPlanId ? { floorPlanId } : undefined,
    include: {
      asset: true,
      floorPlan: true,
    },
    orderBy: { scannedAt: "desc" },
  });

  return NextResponse.json(placements);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createPlacementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Upsert: each asset has exactly one current placement
  const placement = await prisma.assetPlacement.upsert({
    where: { assetId: parsed.data.assetId },
    update: {
      floorPlanId: parsed.data.floorPlanId,
      x: parsed.data.x,
      y: parsed.data.y,
      scannedAt: new Date(),
      scannedBy: parsed.data.scannedBy,
      notes: parsed.data.notes,
    },
    create: {
      assetId: parsed.data.assetId,
      floorPlanId: parsed.data.floorPlanId,
      x: parsed.data.x,
      y: parsed.data.y,
      scannedBy: parsed.data.scannedBy,
      notes: parsed.data.notes,
    },
    include: {
      asset: true,
      floorPlan: true,
    },
  });

  return NextResponse.json(placement, { status: 201 });
}
