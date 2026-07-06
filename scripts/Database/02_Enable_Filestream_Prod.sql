-- Script: 02_Enable_Filestream_Prod.sql
-- Description: Kích hoạt FILESTREAM cho hệ thống thư viện.
-- CẢNH BÁO: FILESTREAM chỉ hoạt động trên hệ điều hành Windows Server (sử dụng NTFS/ReFS).
-- KHÔNG chạy script này trên môi trường Linux/Docker/Mac.

USE master;
GO

-- 1. Kích hoạt mức Instance
EXEC sp_configure 'filestream access level', 2; 
RECONFIGURE;
GO

-- 2. Thêm FileGroup FILESTREAM vào Database (Chỉ chạy trên Server Windows đã cấu hình sẵn thư mục)
/*
ALTER DATABASE UniversityLibraryDb
ADD FILEGROUP LibraryFSGroup CONTAINS FILESTREAM;
GO

ALTER DATABASE UniversityLibraryDb
ADD FILE (
    NAME = 'LibraryFSData',
    FILENAME = 'C:\SQLData\LibraryFS'
) TO FILEGROUP LibraryFSGroup;
GO
*/
