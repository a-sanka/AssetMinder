import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { FloorPlanCanvas } from "@/components/floor-plan/FloorPlanCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function FloorPlanViewerPage({
  params,
}: {
  params: Promise<{ floorPlanId: string }>;
}) {
  const { floorPlanId } = await params;

  const floorPlan = await prisma.floorPlan.findUnique({
    where: { id: floorPlanId },
    include: {
      facility: true,
      locationMarkers: { orderBy: { name: "asc" } },
      assetPlacements: {
        include: { asset: true },
        orderBy: { scannedAt: "desc" },
      },
    },
  });

  if (!floorPlan) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/floor-plan">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{floorPlan.name}</h1>
          <p className="text-sm text-muted-foreground">
            {floorPlan.facility.name}
          </p>
        </div>
      </div>

      <FloorPlanCanvas
        floorPlanId={floorPlan.id}
        imageUrl={floorPlan.imageUrl}
        imageWidth={floorPlan.imageWidth}
        imageHeight={floorPlan.imageHeight}
        locationMarkers={floorPlan.locationMarkers}
        assetPlacements={floorPlan.assetPlacements.map((p) => ({
          ...p,
          scannedAt: p.scannedAt.toISOString(),
        }))}
      />
    </div>
  );
}
