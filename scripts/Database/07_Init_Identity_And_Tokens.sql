-- Script: 07_Init_Identity_And_Tokens.sql
-- Description: Tạo bảng Roles, UserRoles, UserClaims, RefreshTokens

USE [UniversityLibraryDb];
GO

-- 1. Bảng Roles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(50) NOT NULL UNIQUE,
        [Description] NVARCHAR(255)
    );

    -- Dữ liệu mẫu
    INSERT INTO [dbo].[Roles] (Name, Description) VALUES 
    ('Admin', 'Quản trị viên hệ thống'),
    ('Librarian', 'Thủ thư'),
    ('Student', 'Sinh viên');
END
GO

-- 2. Bảng UserRoles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRoles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserRoles] (
        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Users](Id),
        [RoleId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Roles](Id),
        PRIMARY KEY (UserId, RoleId)
    );
END
GO

-- 3. Bảng UserClaims (Nhãn thuộc tính cho người dùng - ABAC)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserClaims]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserClaims] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Users](Id),
        [ClaimType] NVARCHAR(100) NOT NULL, -- VD: 'Department', 'Permission'
        [ClaimValue] NVARCHAR(255) NOT NULL -- VD: 'IT', 'CanManageDRM'
    );
END
GO

-- 4. Bảng RefreshTokens
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RefreshTokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RefreshTokens] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Users](Id),
        [Token] NVARCHAR(500) NOT NULL,
        [JwtId] NVARCHAR(100) NOT NULL,
        [CreationDate] DATETIME NOT NULL DEFAULT GETDATE(),
        [ExpiryDate] DATETIME NOT NULL,
        [IsRevoked] BIT NOT NULL DEFAULT 0
    );
END
GO
