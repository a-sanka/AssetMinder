import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAssetSchema } from "@/lib/validators";
import { encodeAssetQr } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const facilityId = req.nextUrl.searchParams.get("facilityId");
  const search = req.nextUrl.searchParams.get("search");
  const type = req.nextUrl.searchParams.get("type");

  const assets = await prisma.asset.findMany({
    where: {
      ...(facilityId ? { facilityId } : {}),
      ...(type ? { type } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { serialNumber: { contains: search } },
              { type: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      placements: {
        include: { floorPlan: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createAssetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Create with placeholder, then update with real QR data
  const asset = await prisma.asset.create({
    data: {
      ...parsed.data,
      qrCodeData: "placeholder",
    },
  });

  const updated = await prisma.asset.update({
    where: { id: asset.id },
    data: { qrCodeData: encodeAssetQr(asset.id) },
  });

  return NextResponse.json(updated, { status: 201 });
}
