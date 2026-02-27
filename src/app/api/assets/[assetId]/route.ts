import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateAssetSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      facility: true,
      placements: {
        include: { floorPlan: true },
      },
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json(asset);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const body = await req.json();
  const parsed = updateAssetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: parsed.data,
  });

  return NextResponse.json(asset);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;

  await prisma.asset.delete({ where: { id: assetId } });

  return NextResponse.json({ success: true });
}
