-- Migration Script: 12_ILL
-- Bổ sung các bảng cho phân hệ Mượn liên thư viện (ILL)

BEGIN TRANSACTION;

CREATE TABLE [IllPartners] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL,
    [Email] NVARCHAR(200) NOT NULL,
    [ContactPerson] NVARCHAR(200) NOT NULL,
    [ApiEndpoint] NVARCHAR(500) NOT NULL
);

CREATE TABLE [IllRequests] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [PatronId] INT NOT NULL,
    [Title] NVARCHAR(500) NOT NULL,
    [Author] NVARCHAR(200) NOT NULL,
    [PartnerId] INT NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [RequestedAt] DATETIME2 NOT NULL,
    [ExpectedDate] DATETIME2 NULL,
    CONSTRAINT [FK_IllRequests_Users_PatronId] FOREIGN KEY ([PatronId]) REFERENCES [Users] ([Id]) ON DELETE RESTRICT,
    CONSTRAINT [FK_IllRequests_IllPartners_PartnerId] FOREIGN KEY ([PartnerId]) REFERENCES [IllPartners] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_IllRequests_PatronId] ON [IllRequests] ([PatronId]);
CREATE INDEX [IX_IllRequests_PartnerId] ON [IllRequests] ([PartnerId]);

-- Seed Data
INSERT INTO [IllPartners] ([Name], [Email], [ContactPerson], [ApiEndpoint])
VALUES 
('Thư viện ĐHQG Hà Nội', 'ill@vnu.edu.vn', 'Nguyễn Văn A', 'https://api.vnu.edu.vn/ill'),
('Thư viện ĐHQG TPHCM', 'ill@vnuhcm.edu.vn', 'Trần Thị B', 'https://api.vnuhcm.edu.vn/ill');

-- Lấy một User có role Student để làm dữ liệu mẫu
DECLARE @StudentId INT = (SELECT TOP 1 [Id] FROM [Users] WHERE [Role] = 'Student');

IF @StudentId IS NOT NULL
BEGIN
    INSERT INTO [IllRequests] ([PatronId], [Title], [Author], [PartnerId], [Status], [RequestedAt])
    VALUES 
    (@StudentId, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 1, 'Pending', GETUTCDATE()),
    (@StudentId, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma', 2, 'InTransit', GETUTCDATE());
END

COMMIT;
