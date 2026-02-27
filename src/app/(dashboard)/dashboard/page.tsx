import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Map, Package, Plus } from "lucide-react";

export default async function DashboardPage() {
  const facilities = await prisma.facility.findMany({
    include: {
      _count: { select: { floorPlans: true, assets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalAssets = await prisma.asset.count();
  const placedAssets = await prisma.assetPlacement.count();
  const totalFloorPlans = await prisma.floorPlan.count();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your factory assets
          </p>
        </div>
        <Button asChild>
          <Link href="/facilities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Facility
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Facilities
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {placedAssets} placed on floor plans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Floor Plans</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFloorPlans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Facilities */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Facilities</h2>
        {facilities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No facilities yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first facility to get started
              </p>
              <Button asChild>
                <Link href="/facilities/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Facility
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <Link key={facility.id} href={`/floor-plan?facilityId=${facility.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>{facility.name}</CardTitle>
                    <CardDescription>{facility.address}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Map className="h-3.5 w-3.5" />
                        {facility._count.floorPlans} floor plans
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {facility._count.assets} assets
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
