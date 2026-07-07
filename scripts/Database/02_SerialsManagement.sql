-- Migration Script: 02_SerialsManagement
-- Bổ sung các bảng cho phân hệ Quản lý Ấn phẩm định kỳ (Serials Management)

BEGIN TRANSACTION;

CREATE TABLE "SerialSubscriptions" (
    "Id" SERIAL PRIMARY KEY,
    "BibliographicRecordId" INTEGER NOT NULL,
    "PurchaseOrderLineId" INTEGER NULL,
    "Source" VARCHAR(50) NOT NULL DEFAULT 'Purchase',
    "Title" VARCHAR(500) NOT NULL,
    "ISSN" VARCHAR(20) NOT NULL,
    "StartDate" TIMESTAMP NOT NULL,
    "EndDate" TIMESTAMP NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    CONSTRAINT "FK_SerialSubscriptions_BibliographicRecords_BibliographicRecordId" FOREIGN KEY ("BibliographicRecordId") REFERENCES "BibliographicRecords" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_SerialSubscriptions_PurchaseOrderLines_PurchaseOrderLineId" FOREIGN KEY ("PurchaseOrderLineId") REFERENCES "PurchaseOrderLines" ("Id") ON DELETE SET NULL
);

CREATE INDEX "IX_SerialSubscriptions_BibliographicRecordId" ON "SerialSubscriptions" ("BibliographicRecordId");
CREATE INDEX "IX_SerialSubscriptions_PurchaseOrderLineId" ON "SerialSubscriptions" ("PurchaseOrderLineId");

CREATE TABLE "PredictionPatterns" (
    "Id" SERIAL PRIMARY KEY,
    "SerialSubscriptionId" INTEGER NOT NULL,
    "MarcPattern" VARCHAR(200) NOT NULL,
    "Frequency" VARCHAR(10) NOT NULL,
    "VolumeCaption" VARCHAR(50) NOT NULL,
    "IssueCaption" VARCHAR(50) NOT NULL,
    CONSTRAINT "FK_PredictionPatterns_SerialSubscriptions_SerialSubscriptionId" FOREIGN KEY ("SerialSubscriptionId") REFERENCES "SerialSubscriptions" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_PredictionPatterns_SerialSubscriptionId" ON "PredictionPatterns" ("SerialSubscriptionId");

CREATE TABLE "SerialIssues" (
    "Id" SERIAL PRIMARY KEY,
    "SerialSubscriptionId" INTEGER NOT NULL,
    "Enumeration" VARCHAR(100) NOT NULL,
    "Chronology" VARCHAR(100) NOT NULL,
    "ExpectedDate" TIMESTAMP NOT NULL,
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Expected',
    "PhysicalItemId" INTEGER NULL,
    CONSTRAINT "FK_SerialIssues_SerialSubscriptions_SerialSubscriptionId" FOREIGN KEY ("SerialSubscriptionId") REFERENCES "SerialSubscriptions" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_SerialIssues_PhysicalItems_PhysicalItemId" FOREIGN KEY ("PhysicalItemId") REFERENCES "PhysicalItems" ("Id") ON DELETE SET NULL
);

CREATE INDEX "IX_SerialIssues_SerialSubscriptionId" ON "SerialIssues" ("SerialSubscriptionId");
CREATE INDEX "IX_SerialIssues_PhysicalItemId" ON "SerialIssues" ("PhysicalItemId");

COMMIT;
