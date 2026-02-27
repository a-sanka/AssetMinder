import { describe, it, expect } from "vitest";
import {
  createFacilitySchema,
  updateFacilitySchema,
  createAssetSchema,
  updateAssetSchema,
  createLocationMarkerSchema,
  updateLocationMarkerSchema,
  createPlacementSchema,
  createFloorPlanSchema,
} from "@/lib/validators";

describe("createFacilitySchema", () => {
  it("accepts valid facility data", () => {
    const result = createFacilitySchema.safeParse({
      name: "Test Factory",
      address: "123 Main St",
      description: "A test facility",
    });
    expect(result.success).toBe(true);
  });

  it("accepts name only (address and description optional)", () => {
    const result = createFacilitySchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createFacilitySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createFacilitySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    const result = createFacilitySchema.safeParse({ name: "a".repeat(256) });
    expect(result.success).toBe(false);
  });
});

describe("updateFacilitySchema", () => {
  it("accepts partial updates", () => {
    const result = updateFacilitySchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (all fields optional)", () => {
    const result = updateFacilitySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("createAssetSchema", () => {
  it("accepts valid asset data", () => {
    const result = createAssetSchema.safeParse({
      name: "CNC Mill",
      type: "CNC Machine",
      serialNumber: "CNC-001",
      facilityId: "cm5abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = createAssetSchema.safeParse({ name: "CNC Mill" });
    expect(result.success).toBe(false);
  });

  it("accepts without optional serialNumber", () => {
    const result = createAssetSchema.safeParse({
      name: "CNC Mill",
      type: "CNC Machine",
      facilityId: "cm5abc123",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateAssetSchema", () => {
  it("accepts partial asset updates", () => {
    const result = updateAssetSchema.safeParse({ name: "Updated Mill" });
    expect(result.success).toBe(true);
  });

  it("does not include facilityId", () => {
    const result = updateAssetSchema.safeParse({ facilityId: "cm5abc" });
    // facilityId is omitted from schema, so it should be stripped but not fail
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("facilityId");
    }
  });
});

describe("createLocationMarkerSchema", () => {
  it("accepts valid marker data", () => {
    const result = createLocationMarkerSchema.safeParse({
      name: "Pillar A1",
      x: 0.5,
      y: 0.3,
      floorPlanId: "cm5fp123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects x out of range", () => {
    const result = createLocationMarkerSchema.safeParse({
      name: "Pillar A1",
      x: 1.5,
      y: 0.3,
      floorPlanId: "cm5fp123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative y", () => {
    const result = createLocationMarkerSchema.safeParse({
      name: "Pillar A1",
      x: 0.5,
      y: -0.1,
      floorPlanId: "cm5fp123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts boundary values 0 and 1", () => {
    const result = createLocationMarkerSchema.safeParse({
      name: "Corner",
      x: 0,
      y: 1,
      floorPlanId: "cm5fp123",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateLocationMarkerSchema", () => {
  it("accepts partial updates", () => {
    const result = updateLocationMarkerSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid coordinates", () => {
    const result = updateLocationMarkerSchema.safeParse({ x: 2.0 });
    expect(result.success).toBe(false);
  });
});

describe("createPlacementSchema", () => {
  it("accepts valid placement data", () => {
    const result = createPlacementSchema.safeParse({
      assetId: "cm5asset1",
      floorPlanId: "cm5fp1",
      x: 0.25,
      y: 0.75,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional scannedBy and notes", () => {
    const result = createPlacementSchema.safeParse({
      assetId: "cm5asset1",
      floorPlanId: "cm5fp1",
      x: 0.5,
      y: 0.5,
      scannedBy: "John",
      notes: "Near the east wall",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = createPlacementSchema.safeParse({ x: 0.5, y: 0.5 });
    expect(result.success).toBe(false);
  });

  it("rejects coordinates out of range", () => {
    const result = createPlacementSchema.safeParse({
      assetId: "cm5asset1",
      floorPlanId: "cm5fp1",
      x: -0.1,
      y: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("createFloorPlanSchema", () => {
  it("accepts valid floor plan data", () => {
    const result = createFloorPlanSchema.safeParse({
      name: "Ground Floor",
      facilityId: "cm5fac1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createFloorPlanSchema.safeParse({
      name: "",
      facilityId: "cm5fac1",
    });
    expect(result.success).toBe(false);
  });
});
