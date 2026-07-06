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
