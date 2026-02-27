import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, QrCode, Clock } from "lucide-react";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
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

  if (!asset) notFound();

  const placement = asset.placements[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/assets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{asset.name}</h1>
          <p className="text-muted-foreground">{asset.facility.name}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {asset.type}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">
                Serial Number
              </span>
              <p className="font-medium">{asset.serialNumber || "—"}</p>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Type</span>
              <p className="font-medium">{asset.type}</p>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="font-medium">{asset.description || "—"}</p>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">QR Code</span>
              <p className="font-mono text-sm">{asset.qrCodeData}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Current placement on floor plan</CardDescription>
          </CardHeader>
          <CardContent>
            {placement ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {placement.floorPlan.name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Position: ({(placement.x * 100).toFixed(1)}%,{" "}
                  {(placement.y * 100).toFixed(1)}%)
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last scanned:{" "}
                  {new Date(placement.scannedAt).toLocaleString()}
                </div>
                {placement.scannedBy && (
                  <div className="text-sm text-muted-foreground">
                    Scanned by: {placement.scannedBy}
                  </div>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/floor-plan/${placement.floorPlanId}`}>
                    View on Floor Plan
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  This asset has not been placed on a floor plan yet.
                </p>
                <p className="text-muted-foreground text-sm">
                  Use the scanner to place it.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code
          </CardTitle>
          <CardDescription>
            Print and attach this QR code to the asset
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/generate?data=${encodeURIComponent(asset.qrCodeData)}&format=svg&size=200`}
            alt={`QR code for ${asset.name}`}
            width={200}
            height={200}
          />
        </CardContent>
      </Card>
    </div>
  );
}
