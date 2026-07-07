-- Script mồi dữ liệu chuẩn MARC 21 (Data Seeding)
-- Bảng: MarcDictionaries

INSERT INTO MarcDictionaries (Tag, Name, Description, IsRepeatable, FieldType, SubfieldsDefinition)
VALUES 
('020', 'International Standard Book Number', 'ISBN', 1, 'Data', '[{"code":"a","name":"International Standard Book Number","repeatable":false},{"code":"c","name":"Terms of availability","repeatable":false},{"code":"z","name":"Canceled/invalid ISBN","repeatable":true}]'),
('100', 'Main Entry-Personal Name', 'Tác giả chính', 0, 'Data', '[{"code":"a","name":"Personal name","repeatable":false},{"code":"d","name":"Dates associated with a name","repeatable":false},{"code":"e","name":"Relator term","repeatable":true}]'),
('245', 'Title Statement', 'Nhan đề chính', 0, 'Data', '[{"code":"a","name":"Title","repeatable":false},{"code":"b","name":"Remainder of title","repeatable":false},{"code":"c","name":"Statement of responsibility, etc.","repeatable":false}]'),
('250', 'Edition Statement', 'Lần xuất bản', 0, 'Data', '[{"code":"a","name":"Edition statement","repeatable":false},{"code":"b","name":"Remainder of edition statement","repeatable":false}]'),
('260', 'Publication, Distribution, etc. (Imprint)', 'Xuất bản', 1, 'Data', '[{"code":"a","name":"Place of publication, distribution, etc.","repeatable":true},{"code":"b","name":"Name of publisher, distributor, etc.","repeatable":true},{"code":"c","name":"Date of publication, distribution, etc.","repeatable":true}]'),
('300', 'Physical Description', 'Mô tả vật lý', 1, 'Data', '[{"code":"a","name":"Extent","repeatable":true},{"code":"b","name":"Other physical details","repeatable":false},{"code":"c","name":"Dimensions","repeatable":true}]')
;
GO

-- Seed: MarcTemplates
SET IDENTITY_INSERT MarcTemplates ON;
INSERT INTO MarcTemplates (Id, Name, DocumentType, Description, IsActive)
VALUES 
(1, 'Sách in tiếng Việt', 'Book', 'Mẫu chuẩn dành cho sách in tiếng Việt', 1),
(2, 'Tạp chí, báo cáo', 'Journal', 'Mẫu chuẩn dành cho ấn phẩm định kỳ', 1),
(3, 'Luận văn, luận án', 'Thesis', 'Mẫu chuẩn dành cho tài liệu nội sinh', 1);
SET IDENTITY_INSERT MarcTemplates OFF;
GO

-- Seed: TemplateFieldConfigs
INSERT INTO TemplateFieldConfigs (TemplateId, Tag, AllowedSubfields, IsRequired, DefaultValue)
VALUES 
-- Template 1: Sách in
(1, '020', '["a","c"]', 0, NULL),
(1, '100', '["a","d"]', 1, NULL),
(1, '245', '["a","b","c"]', 1, NULL),
(1, '250', '["a"]', 0, NULL),
(1, '260', '["a","b","c"]', 1, NULL),
(1, '300', '["a","b","c"]', 1, NULL),

-- Template 2: Tạp chí
(2, '022', '["a"]', 0, NULL),
(2, '245', '["a","b","c"]', 1, NULL),
(2, '260', '["a","b","c"]', 1, NULL),
(2, '300', '["a","b","c"]', 1, NULL),

-- Template 3: Luận văn
(3, '100', '["a","d"]', 1, NULL),
(3, '245', '["a","b","c"]', 1, NULL),
(3, '260', '["a","b","c"]', 1, NULL),
(3, '300', '["a","b","c"]', 1, NULL),
(3, '502', '["a"]', 1, 'Luận văn Thạc sĩ');
GO
