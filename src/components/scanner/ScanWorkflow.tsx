"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { parseQrData } from "@/lib/qr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Package,
  CheckCircle2,
  ScanLine,
  ArrowRight,
  RotateCcw,
  Map,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const QrScannerView = dynamic(
  () =>
    import("@/components/scanner/QrScannerView").then(
      (mod) => mod.QrScannerView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-muted rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

type WorkflowState =
  | "IDLE"
  | "SCANNING_LOCATION"
  | "LOCATION_CONFIRMED"
  | "SCANNING_ASSET"
  | "PROCESSING"
  | "SUCCESS"
  | "ERROR";

interface LocationInfo {
  id: string;
  name: string;
  floorPlanId: string;
  floorPlanName: string;
  x: number;
  y: number;
}

interface PlacementResult {
  assetName: string;
  locationName: string;
  floorPlanId: string;
}

export function ScanWorkflow() {
  const [state, setState] = useState<WorkflowState>("IDLE");
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = useCallback(() => {
    setState("IDLE");
    setLocation(null);
    setResult(null);
    setErrorMsg("");
  }, []);

  const handleLocationScan = useCallback(async (raw: string) => {
    const parsed = parseQrData(raw);
    if (parsed.type !== "location") {
      toast.error("Not a Location QR code. Please scan a location marker.");
      return;
    }

    // Stop scanning while we fetch
    setState("PROCESSING");

    try {
      const res = await fetch(`/api/location-markers/${parsed.id}`);
      if (!res.ok) {
        toast.error("Unknown location marker. Not registered in the system.");
        setState("SCANNING_LOCATION");
        return;
      }

      const marker = await res.json();
      setLocation({
        id: marker.id,
        name: marker.name,
        floorPlanId: marker.floorPlanId,
        floorPlanName: marker.floorPlan.name,
        x: marker.x,
        y: marker.y,
      });
      setState("LOCATION_CONFIRMED");
    } catch {
      toast.error("Network error. Please try again.");
      setState("SCANNING_LOCATION");
    }
  }, []);

  const handleAssetScan = useCallback(
    async (raw: string) => {
      const parsed = parseQrData(raw);
      if (parsed.type !== "asset") {
        toast.error("Not an Asset QR code. Please scan the asset.");
        return;
      }

      if (!location) return;
      setState("PROCESSING");

      try {
        const res = await fetch("/api/placements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: parsed.id,
            floorPlanId: location.floorPlanId,
            x: location.x,
            y: location.y,
            scannedBy: "Scanner",
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Failed to register asset");
          setState("ERROR");
          return;
        }

        const placement = await res.json();
        setResult({
          assetName: placement.asset.name,
          locationName: location.name,
          floorPlanId: location.floorPlanId,
        });
        setState("SUCCESS");
      } catch {
        setErrorMsg("Network error. Please check your connection.");
        setState("ERROR");
      }
    },
    [location]
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            state === "SCANNING_LOCATION" || state === "LOCATION_CONFIRMED"
              ? "bg-blue-100 text-blue-700"
              : state === "IDLE"
                ? "bg-muted text-muted-foreground"
                : "bg-green-100 text-green-700"
          }`}
        >
          <MapPin className="h-3 w-3" />
          Step 1: Location
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            state === "SCANNING_ASSET"
              ? "bg-green-100 text-green-700"
              : state === "SUCCESS"
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
          }`}
        >
          <Package className="h-3 w-3" />
          Step 2: Asset
        </div>
      </div>

      {/* IDLE */}
      {state === "IDLE" && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 space-y-4">
            <ScanLine className="h-16 w-16 text-primary" />
            <h2 className="text-xl font-bold">Ready to Scan</h2>
            <p className="text-muted-foreground text-center text-sm">
              First scan a location QR code near the asset, then scan the
              asset&apos;s QR code.
            </p>
            <Button size="lg" onClick={() => setState("SCANNING_LOCATION")}>
              <ScanLine className="mr-2 h-5 w-5" />
              Start Scanning
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SCANNING_LOCATION */}
      {state === "SCANNING_LOCATION" && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold">Scan Location QR Code</h2>
            <p className="text-sm text-muted-foreground">
              Point at a location marker near the asset
            </p>
          </div>
          <QrScannerView
            onScan={handleLocationScan}
            active={true}
            borderColor="border-blue-500"
          />
          <Button variant="outline" className="w-full" onClick={reset}>
            Cancel
          </Button>
        </div>
      )}

      {/* LOCATION_CONFIRMED */}
      {state === "LOCATION_CONFIRMED" && location && (
        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{location.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {location.floorPlanName}
                  </p>
                </div>
                <Badge className="ml-auto" variant="secondary">
                  Confirmed
                </Badge>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => setState("SCANNING_ASSET")}
            >
              <Package className="mr-2 h-4 w-4" />
              Scan Asset QR
            </Button>
            <Button
              variant="outline"
              onClick={() => setState("SCANNING_LOCATION")}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Rescan
            </Button>
          </div>
        </div>
      )}

      {/* SCANNING_ASSET */}
      {state === "SCANNING_ASSET" && location && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>
              Location: <strong>{location.name}</strong>
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold">Scan Asset QR Code</h2>
            <p className="text-sm text-muted-foreground">
              Now scan the QR code on the asset
            </p>
          </div>
          <QrScannerView
            onScan={handleAssetScan}
            active={true}
            borderColor="border-green-500"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setState("LOCATION_CONFIRMED")}
          >
            Back
          </Button>
        </div>
      )}

      {/* PROCESSING */}
      {state === "PROCESSING" && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Processing...</p>
          </CardContent>
        </Card>
      )}

      {/* SUCCESS */}
      {state === "SUCCESS" && result && (
        <Card className="border-green-200">
          <CardContent className="flex flex-col items-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-700">
              Asset Registered
            </h2>
            <div className="text-center space-y-1">
              <p className="font-medium">{result.assetName}</p>
              <p className="text-sm text-muted-foreground">
                placed at <strong>{result.locationName}</strong>
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button className="flex-1" onClick={reset}>
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Another
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/floor-plan/${result.floorPlanId}`}>
                  <Map className="mr-1 h-4 w-4" />
                  View Map
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ERROR */}
      {state === "ERROR" && (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center py-8 space-y-4">
            <p className="text-destructive font-medium">Error</p>
            <p className="text-sm text-muted-foreground text-center">
              {errorMsg}
            </p>
            <div className="flex gap-3">
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" onClick={() => setState("SCANNING_ASSET")}>
                Retry Asset Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
