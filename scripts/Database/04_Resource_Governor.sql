-- Script: 04_Resource_Governor.sql
-- Description: Thiết lập Resource Governor để phân bổ tài nguyên CPU/RAM
-- CẢNH BÁO: Chỉ hỗ trợ trên bản Enterprise/Developer của SQL Server (kể cả Linux/Windows).
-- KHÔNG hỗ trợ trên Azure SQL Edge (Docker/Mac M1).

USE master;
GO

/* Bỏ chú thích (uncomment) khối này trên môi trường Production để kích hoạt
-- Bật Resource Governor
ALTER RESOURCE GOVERNOR RECONFIGURE;
GO

-- 1. Tạo Resource Pool cho người dùng tra cứu (OpacSearch)
CREATE RESOURCE POOL OpacSearchPool
WITH
(
    MAX_CPU_PERCENT = 40,      -- Dành tối đa 40% CPU
    MAX_MEMORY_PERCENT = 30    -- Dành tối đa 30% RAM
);
GO

-- 2. Tạo Resource Pool cho tiến trình ngầm (Background Workers)
CREATE RESOURCE POOL BackgroundWorkerPool
WITH
(
    MAX_CPU_PERCENT = 20,      -- Worker chạy ngầm chiếm ít CPU
    MAX_MEMORY_PERCENT = 20
);
GO

-- 3. Tạo Workload Group tương ứng
CREATE WORKLOAD GROUP OpacSearchGroup
USING OpacSearchPool;
GO

CREATE WORKLOAD GROUP BackgroundWorkerGroup
USING BackgroundWorkerPool;
GO

-- 4. Tạo Hàm Phân loại (Classifier Function)
CREATE FUNCTION dbo.rg_Classifier()
RETURNS SYSNAME WITH SCHEMABINDING
AS
BEGIN
    DECLARE @appName NVARCHAR(128) = APP_NAME();
    DECLARE @groupName SYSNAME = 'default';

    IF (@appName LIKE '%OpacSearch%')
        SET @groupName = 'OpacSearchGroup';
    ELSE IF (@appName LIKE '%BackgroundWorker%')
        SET @groupName = 'BackgroundWorkerGroup';
        
    RETURN @groupName;
END;
GO

-- 5. Đăng ký hàm với Resource Governor và áp dụng
ALTER RESOURCE GOVERNOR WITH (CLASSIFIER_FUNCTION = dbo.rg_Classifier);
ALTER RESOURCE GOVERNOR RECONFIGURE;
GO
*/
