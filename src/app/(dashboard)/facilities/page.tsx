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

export default async function FacilitiesPage() {
  const facilities = await prisma.facility.findMany({
    include: {
      _count: { select: { floorPlans: true, assets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage your factory locations</p>
        </div>
        <Button asChild>
          <Link href="/facilities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Facility
          </Link>
        </Button>
      </div>

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
            <Card key={facility.id}>
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
          ))}
        </div>
      )}
    </div>
  );
}
