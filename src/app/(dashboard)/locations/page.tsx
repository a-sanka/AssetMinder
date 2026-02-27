import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import Link from "next/link";

export default async function LocationsPage() {
  const markers = await prisma.locationMarker.findMany({
    include: {
      floorPlan: { include: { facility: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Location Markers</h1>
        <p className="text-muted-foreground">
          Fixed reference points on your floor plans. Place them in admin mode on a floor plan, then print their QR codes.
        </p>
      </div>

      {markers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No location markers yet</h3>
            <p className="text-muted-foreground">
              Open a floor plan in admin mode to place markers
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Floor Plan</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>QR Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markers.map((marker) => (
                <TableRow key={marker.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      {marker.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/floor-plan/${marker.floorPlanId}`}
                      className="hover:underline"
                    >
                      {marker.floorPlan.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {marker.floorPlan.facility.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {(marker.x * 100).toFixed(0)}%, {(marker.y * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {marker.qrCodeData}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
