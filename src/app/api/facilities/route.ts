import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createFacilitySchema } from "@/lib/validators";

export async function GET() {
  const facilities = await prisma.facility.findMany({
    include: {
      _count: {
        select: { floorPlans: true, assets: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(facilities);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createFacilitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const facility = await prisma.facility.create({
    data: parsed.data,
  });

  return NextResponse.json(facility, { status: 201 });
}
