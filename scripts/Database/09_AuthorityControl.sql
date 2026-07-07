-- Migration Script: 09_AuthorityControl
-- Bổ sung các bảng cho phân hệ Kiểm soát chuẩn (Authority Control)

BEGIN TRANSACTION;

CREATE TABLE "AuthorityRecords" (
    "Id" SERIAL PRIMARY KEY,
    "AuthorityType" VARCHAR(50) NOT NULL DEFAULT 'Personal Name',
    "MainEntry" VARCHAR(500) NOT NULL,
    "Fields" JSONB NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NULL
);

CREATE TABLE "BibAuthorityLinks" (
    "Id" SERIAL PRIMARY KEY,
    "BibliographicRecordId" INTEGER NOT NULL,
    "AuthorityRecordId" INTEGER NOT NULL,
    "LinkedTag" VARCHAR(10) NOT NULL,
    CONSTRAINT "FK_BibAuthorityLinks_BibliographicRecords_BibliographicRecordId" FOREIGN KEY ("BibliographicRecordId") REFERENCES "BibliographicRecords" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_BibAuthorityLinks_AuthorityRecords_AuthorityRecordId" FOREIGN KEY ("AuthorityRecordId") REFERENCES "AuthorityRecords" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_BibAuthorityLinks_BibliographicRecordId" ON "BibAuthorityLinks" ("BibliographicRecordId");
CREATE INDEX "IX_BibAuthorityLinks_AuthorityRecordId" ON "BibAuthorityLinks" ("AuthorityRecordId");

COMMIT;
