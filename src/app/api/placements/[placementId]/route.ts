import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ placementId: string }> }
) {
  const { placementId } = await params;

  await prisma.assetPlacement.delete({ where: { id: placementId } });

  return NextResponse.json({ success: true });
}
