import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createFloorPlanSchema } from "@/lib/validators";
import { saveUploadedFile } from "@/lib/upload";

export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");

  const floorPlans = await prisma.floorPlan.findMany({
    where: facilityId ? { facilityId } : undefined,
    include: {
      facility: true,
      _count: { select: { assetPlacements: true, locationMarkers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(floorPlans);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const facilityId = formData.get("facilityId") as string;
  const image = formData.get("image") as File | null;

  const parsed = createFloorPlanSchema.safeParse({ name, facilityId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (!image) {
    return NextResponse.json(
      { error: { image: ["Floor plan image is required"] } },
      { status: 400 }
    );
  }

  const uploaded = await saveUploadedFile(image, "floor-plans");

  const floorPlan = await prisma.floorPlan.create({
    data: {
      name: parsed.data.name,
      facilityId: parsed.data.facilityId,
      imageUrl: uploaded.url,
      imageWidth: uploaded.width ?? 1200,
      imageHeight: uploaded.height ?? 800,
    },
  });

  return NextResponse.json(floorPlan, { status: 201 });
}
