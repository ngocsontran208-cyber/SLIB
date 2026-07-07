-- Migration Script: 10_CourseReserves
-- Bổ sung các bảng cho phân hệ Tài liệu dự khóa (Course Reserves)

BEGIN TRANSACTION;

CREATE TABLE [Instructors] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL,
    [Email] NVARCHAR(200) NOT NULL,
    [Department] NVARCHAR(200) NOT NULL
);

CREATE TABLE [Courses] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Code] NVARCHAR(50) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [InstructorId] INT NOT NULL,
    CONSTRAINT [FK_Courses_Instructors_InstructorId] FOREIGN KEY ([InstructorId]) REFERENCES [Instructors] ([Id])
);

CREATE TABLE [CourseReserveLists] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [CourseId] INT NOT NULL,
    [Term] NVARCHAR(100) NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Active',
    [ActiveFrom] DATETIME2 NOT NULL,
    [ActiveTo] DATETIME2 NOT NULL,
    CONSTRAINT [FK_CourseReserveLists_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [CourseReserveItems] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [CourseReserveListId] INT NOT NULL,
    [PhysicalItemId] INT NOT NULL,
    [ReservePolicy] NVARCHAR(50) NOT NULL DEFAULT '2 Hours',
    CONSTRAINT [FK_CourseReserveItems_CourseReserveLists_ListId] FOREIGN KEY ([CourseReserveListId]) REFERENCES [CourseReserveLists] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CourseReserveItems_PhysicalItems_ItemId] FOREIGN KEY ([PhysicalItemId]) REFERENCES [PhysicalItems] ([Id]) ON DELETE CASCADE
);

CREATE INDEX "IX_Courses_InstructorId" ON "Courses" ("InstructorId");
CREATE INDEX "IX_CourseReserveLists_CourseId" ON "CourseReserveLists" ("CourseId");
CREATE INDEX "IX_CourseReserveItems_CourseReserveListId" ON "CourseReserveItems" ("CourseReserveListId");
CREATE INDEX "IX_CourseReserveItems_PhysicalItemId" ON "CourseReserveItems" ("PhysicalItemId");

-- Seeding data
INSERT INTO "Instructors" ("Name", "Email", "Department") VALUES 
('PGS.TS. Nguyễn Văn A', 'nguyenvana@university.edu.vn', 'Khoa Công nghệ thông tin'),
('TS. Trần Thị B', 'tranthib@university.edu.vn', 'Khoa Toán Tin');

INSERT INTO "Courses" ("Code", "Name", "InstructorId") VALUES 
('IT101', 'Lập trình Web Cơ bản', 1),
('IT202', 'Cấu trúc dữ liệu và giải thuật', 1),
('MA101', 'Toán Cao Cấp 1', 2);

INSERT INTO "CourseReserveLists" ("CourseId", "Term", "Status", "ActiveFrom", "ActiveTo") VALUES 
(1, 'Fall 2026', 'Active', '2026-09-01 00:00:00', '2026-12-31 23:59:59'),
(3, 'Fall 2026', 'Active', '2026-09-01 00:00:00', '2026-12-31 23:59:59');

COMMIT;
