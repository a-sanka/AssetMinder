import type {
  Facility,
  FloorPlan,
  LocationMarker,
  Asset,
  AssetPlacement,
} from "@prisma/client";

export type { Facility, FloorPlan, LocationMarker, Asset, AssetPlacement };

export type FloorPlanWithRelations = FloorPlan & {
  facility: Facility;
  locationMarkers: LocationMarker[];
  assetPlacements: (AssetPlacement & {
    asset: Asset;
  })[];
};

export type AssetWithPlacement = Asset & {
  placements: (AssetPlacement & {
    floorPlan: FloorPlan;
  })[];
};

export type FacilityWithCounts = Facility & {
  _count: {
    floorPlans: number;
    assets: number;
  };
};
