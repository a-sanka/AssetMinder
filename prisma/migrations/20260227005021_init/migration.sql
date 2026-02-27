-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "floor_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "facilityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "floor_plans_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "location_markers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "floorPlanId" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "location_markers_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "floor_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "facilityId" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "assets_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asset_placements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "floorPlanId" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedBy" TEXT,
    "notes" TEXT,
    CONSTRAINT "asset_placements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asset_placements_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "floor_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "floor_plans_facilityId_idx" ON "floor_plans"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "location_markers_qrCodeData_key" ON "location_markers"("qrCodeData");

-- CreateIndex
CREATE INDEX "location_markers_floorPlanId_idx" ON "location_markers"("floorPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "assets_qrCodeData_key" ON "assets"("qrCodeData");

-- CreateIndex
CREATE INDEX "assets_facilityId_idx" ON "assets"("facilityId");

-- CreateIndex
CREATE INDEX "assets_serialNumber_idx" ON "assets"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "asset_placements_assetId_key" ON "asset_placements"("assetId");

-- CreateIndex
CREATE INDEX "asset_placements_floorPlanId_idx" ON "asset_placements"("floorPlanId");

-- CreateIndex
CREATE INDEX "asset_placements_scannedAt_idx" ON "asset_placements"("scannedAt");
