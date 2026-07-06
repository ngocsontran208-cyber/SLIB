-- Script: 01_Config_Memory.sql
-- Description: Cấu hình giới hạn RAM tối đa cho SQL Server.

USE master;
GO

-- Kích hoạt show advanced options
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
GO

-- Cấu hình max server memory (tính bằng MB). Ví dụ: 2048 MB = 2GB
-- Lưu ý: Lệnh này thường dùng cho Server vật lý/VM. Trên Docker, RAM được giới hạn qua cấu hình Container.
EXEC sp_configure 'max server memory (MB)', 2048;
RECONFIGURE;
GO

-- Tắt lại show advanced options
EXEC sp_configure 'show advanced options', 0;
RECONFIGURE;
GO
