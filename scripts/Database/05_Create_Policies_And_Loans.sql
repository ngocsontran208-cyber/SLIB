-- Script: 05_Create_Policies_And_Loans.sql
-- Description: Tạo bảng lưu cấu hình động (Policies) và lịch sử giao dịch mượn/trả (BookLoans)

USE [UniversityLibraryDb];
GO

-- 1. Bảng Cấu hình Chính sách Động (LibraryPolicies)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LibraryPolicies]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LibraryPolicies] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [PolicyKey] NVARCHAR(100) NOT NULL UNIQUE, -- Vd: 'MaxBorrowDays', 'DailyFineAmount'
        [PolicyValue] NVARCHAR(255) NOT NULL,
        [Description] NVARCHAR(255),
        [UpdatedAt] DATETIME DEFAULT GETDATE(),
        [UpdatedBy] NVARCHAR(50) -- Tên Admin sửa đổi
    );
    
    -- Thêm cấu hình mặc định
    INSERT INTO [dbo].[LibraryPolicies] ([PolicyKey], [PolicyValue], [Description], [UpdatedBy])
    VALUES 
    ('MaxBorrowDays', '14', N'Số ngày mượn sách tối đa', 'System'),
    ('MaxBooksAllowed', '5', N'Số sách tối đa một sinh viên được mượn', 'System'),
    ('DailyFineAmount', '5000', N'Số tiền phạt mỗi ngày trễ hạn (VND)', 'System');
END
GO

-- 2. Bảng Giao dịch mượn/trả (BookLoans)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BookLoans]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BookLoans] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Users](Id),
        [CatalogId] INT NOT NULL FOREIGN KEY REFERENCES [dbo].[Catalogs](Id),
        [BorrowDate] DATETIME NOT NULL DEFAULT GETDATE(),
        [DueDate] DATETIME NOT NULL,
        [ReturnDate] DATETIME NULL,
        [Status] NVARCHAR(20) NOT NULL, -- Borrowed, Returned, Overdue
        [FineAmount] DECIMAL(18,2) DEFAULT 0
    );
END
GO
