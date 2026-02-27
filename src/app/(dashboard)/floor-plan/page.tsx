"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Map, Plus, Package, MapPin } from "lucide-react";

interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  facilityId: string;
  _count: { assetPlacements: number; locationMarkers: number };
}

interface Facility {
  id: string;
  name: string;
}

export default function FloorPlanListPage() {
  return (
    <Suspense>
      <FloorPlanListContent />
    </Suspense>
  );
}

function FloorPlanListContent() {
  const searchParams = useSearchParams();
  const preselectedFacilityId = searchParams.get("facilityId") || "";
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState(preselectedFacilityId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/facilities").then((r) => r.json()).then(setFacilities);
  }, []);

  useEffect(() => {
    const url = selectedFacilityId
      ? `/api/floor-plans?facilityId=${selectedFacilityId}`
      : "/api/floor-plans";
    fetch(url).then((r) => r.json()).then(setFloorPlans);
  }, [selectedFacilityId]);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/floor-plans", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      toast.error("Failed to upload floor plan");
      setUploading(false);
      return;
    }

    toast.success("Floor plan uploaded");
    setDialogOpen(false);
    setUploading(false);
    // Refresh list
    const url = selectedFacilityId
      ? `/api/floor-plans?facilityId=${selectedFacilityId}`
      : "/api/floor-plans";
    fetch(url).then((r) => r.json()).then(setFloorPlans);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Floor Plans</h1>
          <p className="text-muted-foreground">
            View and manage your factory floor plans
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Floor Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Floor Plan</DialogTitle>
              <DialogDescription>
                Upload an image of your factory floor plan
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-facility">Facility *</Label>
                <Select name="facilityId" required defaultValue={selectedFacilityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-name">Name *</Label>
                <Input
                  id="upload-name"
                  name="name"
                  placeholder="Building A - Ground Floor"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-image">Image *</Label>
                <Input
                  id="upload-image"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  ref={fileInputRef}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or WebP. Max 10MB.
                </p>
              </div>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {facilities.length > 1 && (
        <div className="flex items-center gap-2">
          <Label className="text-sm">Filter by facility:</Label>
          <Select
            value={selectedFacilityId}
            onValueChange={setSelectedFacilityId}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All facilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All facilities</SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {floorPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No floor plans yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first factory floor plan
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {floorPlans.map((fp) => (
            <Link key={fp.id} href={`/floor-plan/${fp.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={fp.imageUrl}
                    alt={fp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{fp.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {fp._count.assetPlacements} assets
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {fp._count.locationMarkers} markers
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
