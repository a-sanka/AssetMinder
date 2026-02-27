"use client";

import { useRef, useState, useCallback } from "react";
import { useFloorPlanTransform } from "@/hooks/useFloorPlanTransform";
import { AssetPin } from "./AssetPin";
import { LocationPin } from "./LocationPin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LocationMarker {
  id: string;
  name: string;
  x: number;
  y: number;
  qrCodeData: string;
}

interface AssetPlacement {
  id: string;
  x: number;
  y: number;
  scannedAt: string;
  asset: {
    id: string;
    name: string;
    type: string;
    serialNumber: string | null;
  };
}

interface FloorPlanCanvasProps {
  floorPlanId: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  locationMarkers: LocationMarker[];
  assetPlacements: AssetPlacement[];
}

export function FloorPlanCanvas({
  floorPlanId,
  imageUrl,
  imageWidth,
  imageHeight,
  locationMarkers: initialMarkers,
  assetPlacements,
}: FloorPlanCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { state, handlers, controls, isPanning } = useFloorPlanTransform();

  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationMarkers, setShowLocationMarkers] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [locationMarkers, setLocationMarkers] = useState(initialMarkers);

  // Admin: marker placement dialog
  const [pendingMarker, setPendingMarker] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [markerName, setMarkerName] = useState("");
  const [savingMarker, setSavingMarker] = useState(false);

  const filteredPlacements = assetPlacements.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.asset.name.toLowerCase().includes(q) ||
      p.asset.type.toLowerCase().includes(q) ||
      (p.asset.serialNumber?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!adminMode || isPanning.current) return;

      const viewport = viewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      // Convert viewport click to position within the transformed container
      const containerX = (e.clientX - rect.left - state.panX) / state.zoom;
      const containerY = (e.clientY - rect.top - state.panY) / state.zoom;

      // Normalize to 0-1
      const x = Math.max(0, Math.min(1, containerX / imageWidth));
      const y = Math.max(0, Math.min(1, containerY / imageHeight));

      setPendingMarker({ x, y });
      setMarkerName("");
    },
    [adminMode, state, imageWidth, imageHeight, isPanning]
  );

  async function saveMarker() {
    if (!pendingMarker || !markerName.trim()) return;
    setSavingMarker(true);

    const res = await fetch("/api/location-markers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: markerName,
        x: pendingMarker.x,
        y: pendingMarker.y,
        floorPlanId,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to create location marker");
      setSavingMarker(false);
      return;
    }

    const marker = await res.json();
    setLocationMarkers((prev) => [...prev, marker]);
    setPendingMarker(null);
    setSavingMarker(false);
    toast.success(`Location marker "${markerName}" created`);
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={controls.zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center font-mono">
              {Math.round(state.zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={controls.zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={controls.resetView}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button
            variant={showLocationMarkers ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowLocationMarkers(!showLocationMarkers)}
          >
            {showLocationMarkers ? (
              <Eye className="mr-1 h-3.5 w-3.5" />
            ) : (
              <EyeOff className="mr-1 h-3.5 w-3.5" />
            )}
            Markers
          </Button>

          <Button
            variant={adminMode ? "default" : "outline"}
            size="sm"
            onClick={() => setAdminMode(!adminMode)}
          >
            <Settings className="mr-1 h-3.5 w-3.5" />
            {adminMode ? "Exit Admin" : "Admin Mode"}
          </Button>
        </div>

        {adminMode && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Admin mode: Click anywhere on the floor plan to place a new location
            marker.
          </div>
        )}

        {/* Viewport */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden border rounded-lg bg-muted"
          style={{ height: "calc(100vh - 280px)", touchAction: "none" }}
          onWheel={(e) => {
            if (!viewportRef.current) return;
            handlers.onWheel(e, viewportRef.current.getBoundingClientRect());
          }}
          onPointerDown={handlers.onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={handlers.onPointerUp}
          onClick={handleCanvasClick}
        >
          <div
            style={{
              transform: `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`,
              transformOrigin: "0 0",
              position: "relative",
              width: imageWidth,
              height: imageHeight,
            }}
          >
            {/* Floor plan image */}
            <img
              src={imageUrl}
              alt="Floor plan"
              width={imageWidth}
              height={imageHeight}
              className="block select-none"
              draggable={false}
            />

            {/* Location marker pins */}
            {showLocationMarkers &&
              locationMarkers.map((marker) => (
                <LocationPin
                  key={marker.id}
                  name={marker.name}
                  x={marker.x}
                  y={marker.y}
                />
              ))}

            {/* Asset pins */}
            {filteredPlacements.map((placement) => (
              <AssetPin
                key={placement.id}
                id={placement.asset.id}
                name={placement.asset.name}
                type={placement.asset.type}
                serialNumber={placement.asset.serialNumber}
                x={placement.x}
                y={placement.y}
                scannedAt={placement.scannedAt}
                floorPlanId={floorPlanId}
              />
            ))}

            {/* Pending marker preview */}
            {pendingMarker && (
              <div
                className="absolute -translate-x-1/2 -translate-y-full z-20 animate-bounce"
                style={{
                  left: `${pendingMarker.x * 100}%`,
                  top: `${pendingMarker.y * 100}%`,
                }}
              >
                <div className="h-6 w-6 rounded-full bg-orange-500 border-2 border-white shadow-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{filteredPlacements.length} assets shown</span>
          <span>{locationMarkers.length} location markers</span>
          {searchQuery && (
            <span>
              Filtered from {assetPlacements.length} total
            </span>
          )}
        </div>

        {/* Admin: New Marker Dialog */}
        <Dialog
          open={!!pendingMarker}
          onOpenChange={(open) => !open && setPendingMarker(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Location Marker</DialogTitle>
              <DialogDescription>
                Name this location marker. It will be printed as a QR code and placed at this position.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={markerName}
                  onChange={(e) => setMarkerName(e.target.value)}
                  placeholder="Pillar A1, Door North, etc."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveMarker();
                  }}
                />
              </div>
              {pendingMarker && (
                <p className="text-sm text-muted-foreground">
                  Position: ({(pendingMarker.x * 100).toFixed(1)}%,{" "}
                  {(pendingMarker.y * 100).toFixed(1)}%)
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={saveMarker}
                  disabled={!markerName.trim() || savingMarker}
                >
                  {savingMarker ? "Creating..." : "Create Marker"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPendingMarker(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
