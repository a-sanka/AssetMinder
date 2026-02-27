import { z } from "zod";

export const createFacilitySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
});

export const updateFacilitySchema = createFacilitySchema.partial();

export const createFloorPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  facilityId: z.string().min(1, "Facility is required"),
});

export const createAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.string().min(1, "Type is required").max(100),
  serialNumber: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  facilityId: z.string().min(1, "Facility is required"),
});

export const updateAssetSchema = createAssetSchema.partial().omit({
  facilityId: true,
});

export const createLocationMarkerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  floorPlanId: z.string().min(1, "Floor plan is required"),
});

export const updateLocationMarkerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
});

export const createPlacementSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  floorPlanId: z.string().min(1, "Floor plan is required"),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  scannedBy: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
});
