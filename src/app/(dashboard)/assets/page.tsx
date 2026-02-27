import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, MapPin } from "lucide-react";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string; search?: string }>;
}) {
  const { facilityId, search } = await searchParams;

  const assets = await prisma.asset.findMany({
    where: {
      ...(facilityId ? { facilityId } : {}),
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
      facility: true,
      placements: {
        include: { floorPlan: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-muted-foreground">
            Manage your factory machinery and equipment
          </p>
        </div>
        <Button asChild>
          <Link href="/assets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Link>
        </Button>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first piece of equipment
            </p>
            <Button asChild>
              <Link href="/assets/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Facility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => {
                const placement = asset.placements[0];
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium hover:underline"
                      >
                        {asset.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{asset.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.serialNumber || "—"}
                    </TableCell>
                    <TableCell>
                      {placement ? (
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-green-600" />
                          {placement.floorPlan.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not placed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {asset.facility.name}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
