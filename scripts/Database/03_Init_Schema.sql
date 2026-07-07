-- Script: 03_Init_Schema.sql
-- Description: Khởi tạo CSDL và tạo các bảng cốt lõi của hệ thống thư viện

-- Tạo cơ sở dữ liệu nếu chưa có
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'UniversityLibraryDb')
BEGIN
    CREATE DATABASE [UniversityLibraryDb];
END
GO

USE [UniversityLibraryDb];
GO

-- 1. Bảng Users (Người dùng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [FullName] NVARCHAR(100) NOT NULL,
        [Email] NVARCHAR(100) NOT NULL,
        [Role] NVARCHAR(20) NOT NULL, -- Sinh viên, Giảng viên, Thủ thư, Admin
        [CreatedAt] DATETIME DEFAULT GETDATE(),
        [IsActive] BIT DEFAULT 1
    );
END
GO

-- 2. Bảng Catalogs (Danh mục sách/tài liệu)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Catalogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Catalogs] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Title] NVARCHAR(255) NOT NULL,
        [Author] NVARCHAR(150) NOT NULL,
        [ISBN] NVARCHAR(20),
        [PublishYear] INT,
        [Category] NVARCHAR(50),
        [Type] NVARCHAR(20) NOT NULL -- Physical, Digital
    );
END
GO

-- 3. Bảng DigitalAssets (Tài nguyên số - PDF, Audio, Video)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DigitalAssets]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DigitalAssets] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [CatalogId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Catalogs](Id),
        [FileName] NVARCHAR(255) NOT NULL,
        [FileType] NVARCHAR(50) NOT NULL,
        [FileSizeMB] DECIMAL(10, 2),
        [FileId] UNIQUEIDENTIFIER ROWGUIDCOL NOT NULL UNIQUE DEFAULT NEWID(),
        -- Sử dụng VARBINARY(MAX) mặc định cho Local/Linux.
        -- Trên Windows Production, dòng này có thể được đổi thành: [FileData] VARBINARY(MAX) FILESTREAM NULL
        [FileData] VARBINARY(MAX) NULL,
        [UploadedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- 4. Bảng MarcTemplates (Mẫu biên mục MARC 21)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MarcTemplates]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MarcTemplates] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [DocumentType] NVARCHAR(50) NOT NULL DEFAULT 'Book',
        [Description] NVARCHAR(255),
        [IsActive] BIT DEFAULT 1,
        [CreatedAt] DATETIME DEFAULT GETDATE()
    );
END
GO

-- 5. Bảng TemplateFieldConfigs (Cấu hình trường MARC cho Mẫu)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TemplateFieldConfigs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TemplateFieldConfigs] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [TemplateId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[MarcTemplates](Id) ON DELETE CASCADE,
        [Tag] NVARCHAR(3) NOT NULL,
        [AllowedSubfields] NVARCHAR(MAX),
        [IsRequired] BIT DEFAULT 0,
        [DefaultValue] NVARCHAR(MAX)
    );
END
GO
