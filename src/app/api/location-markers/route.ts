import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createLocationMarkerSchema } from "@/lib/validators";
import { encodeLocationQr } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const floorPlanId = req.nextUrl.searchParams.get("floorPlanId");

  const markers = await prisma.locationMarker.findMany({
    where: floorPlanId ? { floorPlanId } : undefined,
    include: { floorPlan: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(markers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createLocationMarkerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const marker = await prisma.locationMarker.create({
    data: {
      ...parsed.data,
      qrCodeData: "placeholder",
    },
  });

  const updated = await prisma.locationMarker.update({
    where: { id: marker.id },
    data: { qrCodeData: encodeLocationQr(marker.id) },
  });

  return NextResponse.json(updated, { status: 201 });
}
