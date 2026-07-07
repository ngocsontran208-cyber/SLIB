-- =======================================================
-- Migration 13: Notification Templates
-- =======================================================

CREATE TABLE [NotificationTemplates] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [DefaultVariables] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_NotificationTemplates] PRIMARY KEY ([Id])
);
GO

-- Seed data for Email Template
INSERT INTO [NotificationTemplates] ([Name], [Type], [Content], [DefaultVariables], [Description])
VALUES (
    'Overdue Notice Email',
    'Email',
    '<html><body><h2>Kính gửi {{PatronName}},</h2><p>Tài liệu <b>{{Title}}</b> đã quá hạn trả từ ngày {{DueDate}}.</p><p>Vui lòng đến thư viện để trả sách và đóng phí phạt. Trân trọng!</p></body></html>',
    '["PatronName", "Title", "DueDate"]',
    'Mẫu email thông báo sách quá hạn'
);

-- Seed data for Spine Label ZPL
INSERT INTO [NotificationTemplates] ([Name], [Type], [Content], [DefaultVariables], [Description])
VALUES (
    'Standard Spine Label',
    'ZPL',
    '^XA^FO50,50^A0N,30,30^FD{{CallNumber}}^FS^FO50,100^A0N,30,30^FD{{Title}}^FS^FO50,150^BCN,50,Y,N,N^FD{{Barcode}}^FS^XZ',
    '["CallNumber", "Title", "Barcode"]',
    'Mẫu in nhãn gáy sách (chuẩn ZPL)'
);
GO
