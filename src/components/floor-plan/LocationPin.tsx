"use client";

import { MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationPinProps {
  name: string;
  x: number;
  y: number;
}

export function LocationPin({ name, x, y }: LocationPinProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full z-5"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-default">
            <MapPin className="h-5 w-5 text-orange-500 drop-shadow-sm opacity-60" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {name}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
