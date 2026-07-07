-- Migration Script: 11_Inventory
-- Bổ sung các bảng cho phân hệ Kiểm kê & Xử lý kho (Inventory & Stocktaking)

BEGIN TRANSACTION;

CREATE TABLE [StocktakeSessions] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL,
    [StartTime] DATETIME2 NOT NULL,
    [EndTime] DATETIME2 NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'InProgress',
    [CreatedBy] NVARCHAR(100) NOT NULL
);

CREATE TABLE [StocktakeScans] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [SessionId] INT NOT NULL,
    [PhysicalItemId] INT NOT NULL,
    [ScannedAt] DATETIME2 NOT NULL,
    [ExpectedStatus] NVARCHAR(50) NOT NULL,
    [ResultColor] NVARCHAR(20) NOT NULL,
    CONSTRAINT [FK_StocktakeScans_StocktakeSessions_SessionId] FOREIGN KEY ([SessionId]) REFERENCES [StocktakeSessions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_StocktakeScans_PhysicalItems_PhysicalItemId] FOREIGN KEY ([PhysicalItemId]) REFERENCES [PhysicalItems] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_StocktakeScans_SessionId] ON [StocktakeScans] ([SessionId]);
CREATE INDEX [IX_StocktakeScans_PhysicalItemId] ON [StocktakeScans] ([PhysicalItemId]);

COMMIT;
