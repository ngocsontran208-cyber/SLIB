-- Script: 06_Init_Drm_Policies.sql
-- Description: Thêm cấu hình DRM vào bảng LibraryPolicies

USE [UniversityLibraryDb];
GO

IF NOT EXISTS (SELECT * FROM [dbo].[LibraryPolicies] WHERE PolicyKey = 'MaxPdfViewCount')
BEGIN
    INSERT INTO [dbo].[LibraryPolicies] ([PolicyKey], [PolicyValue], [Description], [UpdatedBy])
    VALUES ('MaxPdfViewCount', '10', N'Số lần mở xem PDF tối đa cho mỗi sinh viên', 'System');
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[LibraryPolicies] WHERE PolicyKey = 'DrmWatermarkTemplate')
BEGIN
    INSERT INTO [dbo].[LibraryPolicies] ([PolicyKey], [PolicyValue], [Description], [UpdatedBy])
    VALUES ('DrmWatermarkTemplate', 'CONFIDENTIAL - %Email% - %DateTime%', N'Khuôn mẫu Watermark in chìm', 'System');
END
GO
