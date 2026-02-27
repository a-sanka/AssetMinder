"use client";

import { MapPin } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AssetPinProps {
  id: string;
  name: string;
  type: string;
  serialNumber: string | null;
  x: number;
  y: number;
  scannedAt: string;
  floorPlanId: string;
}

export function AssetPin({
  id,
  name,
  type,
  serialNumber,
  x,
  y,
  scannedAt,
}: AssetPinProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full z-10"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button className="group cursor-pointer focus:outline-none">
            <MapPin className="h-8 w-8 text-blue-600 drop-shadow-md group-hover:text-blue-700 group-hover:scale-110 transition-transform" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64" side="top" sideOffset={4}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{name}</h4>
              <Badge variant="secondary" className="text-xs">
                {type}
              </Badge>
            </div>
            {serialNumber && (
              <p className="text-sm text-muted-foreground">
                S/N: {serialNumber}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Last scanned: {new Date(scannedAt).toLocaleString()}
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/assets/${id}`}>View Details</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
