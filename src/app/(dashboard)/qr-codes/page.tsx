"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Printer, MapPin, Package } from "lucide-react";

interface LocationMarker {
  id: string;
  name: string;
  qrCodeData: string;
  floorPlan: { name: string };
}

interface Asset {
  id: string;
  name: string;
  type: string;
  qrCodeData: string;
  facility: { name: string };
}

function QrCodeCard({
  label,
  sublabel,
  qrData,
}: {
  label: string;
  sublabel: string;
  qrData: string;
}) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6 space-y-2">
        <img
          src={`/api/qr/generate?data=${encodeURIComponent(qrData)}&format=svg&size=180`}
          alt={`QR: ${label}`}
          width={180}
          height={180}
          className="mx-auto"
        />
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
        <p className="text-xs font-mono text-muted-foreground">{qrData}</p>
      </CardContent>
    </Card>
  );
}

export default function QrCodesPage() {
  const [markers, setMarkers] = useState<LocationMarker[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    fetch("/api/location-markers")
      .then((r) => r.json())
      .then(setMarkers);
    fetch("/api/assets")
      .then((r) => r.json())
      .then(setAssets);
  }, []);

  function printQrCodes(type: "locations" | "assets") {
    const items = type === "locations" ? markers : assets;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const cards = items
      .map((item) => {
        const label = item.name;
        const qrData = item.qrCodeData;
        return `
        <div style="display:inline-block;text-align:center;padding:16px;border:1px solid #ccc;margin:8px;break-inside:avoid;">
          <img src="/api/qr/generate?data=${encodeURIComponent(qrData)}&format=svg&size=200" width="200" height="200" />
          <p style="font-weight:bold;margin:8px 0 4px;">${label}</p>
          <p style="font-size:12px;color:#666;font-family:monospace;">${qrData}</p>
        </div>
      `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head><title>QR Codes - ${type}</title></head>
        <body style="font-family:system-ui;padding:20px;">
          <h1 style="margin-bottom:20px;">${type === "locations" ? "Location Marker" : "Asset"} QR Codes</h1>
          <div style="display:flex;flex-wrap:wrap;">${cards}</div>
          <script>setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR Codes</h1>
        <p className="text-muted-foreground">
          Generate and print QR codes for location markers and assets
        </p>
      </div>

      <Tabs defaultValue="locations">
        <TabsList>
          <TabsTrigger value="locations" className="gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Location Markers ({markers.length})
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-1">
            <Package className="h-3.5 w-3.5" />
            Assets ({assets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => printQrCodes("locations")}
              disabled={markers.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print All Location QR Codes
            </Button>
          </div>
          {markers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No location markers to generate QR codes for
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {markers.map((marker) => (
                <QrCodeCard
                  key={marker.id}
                  label={marker.name}
                  sublabel={marker.floorPlan.name}
                  qrData={marker.qrCodeData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => printQrCodes("assets")}
              disabled={assets.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print All Asset QR Codes
            </Button>
          </div>
          {assets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No assets to generate QR codes for
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset) => (
                <QrCodeCard
                  key={asset.id}
                  label={asset.name}
                  sublabel={asset.type}
                  qrData={asset.qrCodeData}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
