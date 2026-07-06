-- =============================================
-- Script: 08_Init_PhysicalItems.sql
-- Description: Tạo bảng PhysicalItems và cấu trúc lại BookLoans
-- =============================================

USE [UniversityLibraryDb];
GO

-- 1. Tạo bảng PhysicalItems (Bản sao vật lý của sách)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PhysicalItems]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PhysicalItems] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [CatalogId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Catalogs](Id),
        [Barcode] NVARCHAR(50) NOT NULL UNIQUE,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'Available', -- Available, Borrowed, Lost, Damaged
        [RowVersion] TIMESTAMP NOT NULL -- Cột dùng cho Optimistic Concurrency
    );

    -- Dữ liệu mẫu: Giả sử CatalogId = 1 có 1 cuốn duy nhất (Để dễ test Race Condition)
    -- Nếu chưa có Catalog nào thì chèn 1 cái
    IF NOT EXISTS (SELECT * FROM [dbo].[Catalogs])
    BEGIN
        INSERT INTO [dbo].[Catalogs] (Title, Author, ISBN, PublishYear, Category, Type)
        VALUES (N'Toán Cao Cấp', N'Nguyễn Đình Trí', '978-604-0-12345-6', 2020, 'Math', 'Physical');
    END

    DECLARE @CatId INT = (SELECT TOP 1 Id FROM [dbo].[Catalogs]);

    INSERT INTO [dbo].[PhysicalItems] (CatalogId, Barcode, Status)
    VALUES (@CatId, 'TC-001', 'Available');
END
GO

-- 2. Drop BookLoans hiện tại (Xóa cẩn thận khóa ngoại trước)
-- Vì khóa ngoại được sinh tự động nên ta phải lấy tên động để xóa
DECLARE @ForeignKeyName NVARCHAR(200);
SELECT @ForeignKeyName = f.name 
FROM sys.foreign_keys f
INNER JOIN sys.tables t ON f.parent_object_id = t.object_id
WHERE t.name = 'BookLoans' AND f.referenced_object_id = OBJECT_ID('Users');

IF @ForeignKeyName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[BookLoans] DROP CONSTRAINT [' + @ForeignKeyName + ']');

SELECT @ForeignKeyName = f.name 
FROM sys.foreign_keys f
INNER JOIN sys.tables t ON f.parent_object_id = t.object_id
WHERE t.name = 'BookLoans' AND f.referenced_object_id = OBJECT_ID('Catalogs');

IF @ForeignKeyName IS NOT NULL
    EXEC('ALTER TABLE [dbo].[BookLoans] DROP CONSTRAINT [' + @ForeignKeyName + ']');

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BookLoans]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[BookLoans];
END
GO

-- 3. Tạo lại bảng BookLoans với PhysicalItemId thay vì CatalogId
CREATE TABLE [dbo].[BookLoans] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Users](Id),
    [PhysicalItemId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[PhysicalItems](Id),
    [BorrowDate] DATETIME NOT NULL DEFAULT GETDATE(),
    [DueDate] DATETIME NOT NULL,
    [ReturnDate] DATETIME NULL,
    [Status] NVARCHAR(20) NOT NULL, -- Borrowed, Returned, Overdue
    [FineAmount] DECIMAL(18,2) DEFAULT 0
);
GO
