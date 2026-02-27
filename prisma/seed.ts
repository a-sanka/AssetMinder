import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function encodeLocationQr(id: string) {
  return `am://L/${id}`;
}

function encodeAssetQr(id: string) {
  return `am://A/${id}`;
}

async function main() {
  // Clean existing data
  await prisma.assetPlacement.deleteMany();
  await prisma.locationMarker.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.floorPlan.deleteMany();
  await prisma.facility.deleteMany();

  // Create facility
  const facility = await prisma.facility.create({
    data: {
      name: "Main Manufacturing Plant",
      address: "123 Industrial Blvd, Detroit, MI 48201",
      description: "Primary manufacturing facility with 3 production lines",
    },
  });

  // Create floor plan (using a placeholder image path)
  const floorPlan = await prisma.floorPlan.create({
    data: {
      name: "Building A - Ground Floor",
      imageUrl: "/uploads/floor-plans/sample-floor-plan.png",
      imageWidth: 1200,
      imageHeight: 800,
      facilityId: facility.id,
    },
  });

  // Create location markers at various positions on the floor plan
  const markerData = [
    { name: "Pillar A1", x: 0.1, y: 0.15 },
    { name: "Pillar A2", x: 0.1, y: 0.5 },
    { name: "Pillar A3", x: 0.1, y: 0.85 },
    { name: "Pillar B1", x: 0.5, y: 0.15 },
    { name: "Pillar B2", x: 0.5, y: 0.5 },
    { name: "Pillar B3", x: 0.5, y: 0.85 },
    { name: "Door North", x: 0.3, y: 0.02 },
    { name: "Door South", x: 0.3, y: 0.98 },
    { name: "Loading Dock", x: 0.9, y: 0.5 },
  ];

  const markers = [];
  for (const data of markerData) {
    const marker = await prisma.locationMarker.create({
      data: {
        name: data.name,
        x: data.x,
        y: data.y,
        floorPlanId: floorPlan.id,
        qrCodeData: "placeholder",
      },
    });
    // Update with proper QR code data using the generated ID
    const updated = await prisma.locationMarker.update({
      where: { id: marker.id },
      data: { qrCodeData: encodeLocationQr(marker.id) },
    });
    markers.push(updated);
  }

  // Create assets
  const assetData = [
    { name: "CNC Mill #1", type: "CNC Machine", serialNumber: "CNC-2024-001" },
    { name: "CNC Mill #2", type: "CNC Machine", serialNumber: "CNC-2024-002" },
    { name: "Hydraulic Press A", type: "Press", serialNumber: "HP-2023-015" },
    { name: "Welding Robot #1", type: "Robot", serialNumber: "WR-2024-003" },
    { name: "Conveyor Belt Line 1", type: "Conveyor", serialNumber: "CB-2022-007" },
    { name: "Forklift #3", type: "Forklift", serialNumber: "FL-2023-003" },
    { name: "Air Compressor", type: "Compressor", serialNumber: "AC-2021-001" },
    { name: "Lathe Machine #1", type: "Lathe", serialNumber: "LM-2024-001" },
    { name: "Paint Booth", type: "Paint System", serialNumber: "PB-2023-001" },
    { name: "Quality Scanner", type: "Scanner", serialNumber: "QS-2024-005" },
  ];

  const assets = [];
  for (const data of assetData) {
    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        facilityId: facility.id,
        qrCodeData: "placeholder",
      },
    });
    const updated = await prisma.asset.update({
      where: { id: asset.id },
      data: { qrCodeData: encodeAssetQr(asset.id) },
    });
    assets.push(updated);
  }

  // Place some assets on the floor plan (simulating scans near location markers)
  const placements = [
    { assetIndex: 0, markerIndex: 0 }, // CNC Mill #1 near Pillar A1
    { assetIndex: 1, markerIndex: 1 }, // CNC Mill #2 near Pillar A2
    { assetIndex: 2, markerIndex: 3 }, // Hydraulic Press near Pillar B1
    { assetIndex: 3, markerIndex: 4 }, // Welding Robot near Pillar B2
    { assetIndex: 4, markerIndex: 5 }, // Conveyor near Pillar B3
    { assetIndex: 6, markerIndex: 8 }, // Air Compressor near Loading Dock
  ];

  for (const p of placements) {
    await prisma.assetPlacement.create({
      data: {
        assetId: assets[p.assetIndex].id,
        floorPlanId: floorPlan.id,
        x: markers[p.markerIndex].x,
        y: markers[p.markerIndex].y,
        scannedBy: "System (seed)",
      },
    });
  }

  console.log("Seed complete:");
  console.log(`  - 1 facility: ${facility.name}`);
  console.log(`  - 1 floor plan: ${floorPlan.name}`);
  console.log(`  - ${markers.length} location markers`);
  console.log(`  - ${assets.length} assets`);
  console.log(`  - ${placements.length} asset placements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
