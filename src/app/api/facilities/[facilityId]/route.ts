import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateFacilitySchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { facilityId } = await params;

  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      _count: { select: { floorPlans: true, assets: true } },
    },
  });

  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  return NextResponse.json(facility);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { facilityId } = await params;
  const body = await req.json();
  const parsed = updateFacilitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const facility = await prisma.facility.update({
    where: { id: facilityId },
    data: parsed.data,
  });

  return NextResponse.json(facility);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { facilityId } = await params;

  await prisma.facility.delete({ where: { id: facilityId } });

  return NextResponse.json({ success: true });
}
