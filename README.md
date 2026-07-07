# HỆ THỐNG QUẢN TRỊ THƯ VIỆN ĐẠI HỌC (UNIVERSITY LIBRARY SYSTEM)

## TỔNG QUAN HỆ THỐNG
Hệ thống Thư viện Đại học (SLIB) là một nền tảng quản trị thư viện toàn diện, được xây dựng dựa trên kiến trúc hiện đại (Clean Architecture). Hệ thống kết hợp các tiêu chuẩn thư viện quốc tế như MARC 21, Z39.50/SRU, cùng các tiêu chuẩn quản trị Bổ sung (Acquisition) tiên tiến của FOLIO và Alma. Đặc biệt, hệ thống đặt trọng tâm vào hiệu năng cao, tính toàn vẹn dữ liệu (Database Transactions), và lưu vết kiểm toán tài chính (Audit Trail) tuyệt đối thông qua tính năng System-versioned Temporal Tables của Microsoft SQL Server.

## KIẾN TRÚC VÀ CÔNG NGHỆ CHÍNH
- Ngôn ngữ và Nền tảng: C# 13, .NET 9
- Kiến trúc phần mềm: Clean Architecture (Domain, Application, Infrastructure, Api, Worker)
- ORM: Entity Framework Core 9 (EF Core 9 Code-First Migrations)
- Cơ sở dữ liệu: Microsoft SQL Server (sử dụng Native JSON Mapping và System-versioned Temporal Tables)
- API: RESTful API (ASP.NET Core Web API)
- Xử lý nền: Hangfire, Background TCP Socket, RabbitMQ
- Giao tiếp thời gian thực: SignalR
- Xác thực và Phân quyền: JWT Authentication, Policy-based Authorization (ABAC và RBAC)
- Tích hợp chuẩn thư viện: Giao thức SRU (Search/Retrieve via URL), Cấu trúc phân tích XML/ISO 2709, SUSHI/COUNTER 5, SIP2/NCIP, MARC 21.
- Frontend: Vite + React 18 + TypeScript + Tailwind CSS v3

---

## CÁC PHÂN HỆ VÀ CHỨC NĂNG CỐT LÕI

### 1. KIẾN TRÚC NỀN TẢNG VÀ BẢO MẬT (FOUNDATION & SECURITY)
- **Kiến trúc Clean Architecture:** Tổ chức mã nguồn chặt chẽ thành các tầng độc lập (Domain, Application, Infrastructure, API).
- **Audit Trail & System-versioned Temporal Tables:** Lưu vết vĩnh viễn mọi thay đổi dữ liệu của các bảng tài chính nhạy cảm (PurchaseOrder, Fund, Invoice), chống gian lận và phục vụ kiểm toán tài chính.
- **Bảo mật Đa lớp (IAM & IAM):** Xác thực bằng JWT, phân quyền chi tiết tới từng endpoint bằng ABAC (Attribute-Based) và RBAC (Role-Based). 
- **Chống DDoS & Rate Limiting:** Bảo vệ hệ thống thông qua Middleware Rate Limiting (nhất là với các endpoint truyền tải tài liệu số).
- **Phân quyền Frontend:** Lớp `ProtectedRoute` đánh chặn chủ động ngay trên giao diện, ngăn người dùng không đủ thẩm quyền (VD: Sinh viên) truy cập vào Portal của Cán bộ thư viện.

### 2. PHÂN HỆ QUẢN TRỊ SIÊU DỮ LIỆU & BIÊN MỤC (CATALOGING ENGINE)
- **Kiến trúc Native JSON MARC 21:** Thay vì thiết kế hàng ngàn bảng/cột vật lý, toàn bộ cấu trúc MARC 21 được ánh xạ thành `List<MarcField>` và lưu trữ dưới dạng Native JSON trên SQL Server, hỗ trợ truy vấn LINQ sang SQL bản địa tốc độ cao.
- **Trình phân tích chuẩn ISO 2709:** Bộ Parser đọc luồng nhị phân trực tiếp (Binary Stream), cho phép xử lý hàng loạt lô dữ liệu (batching) hàng triệu biểu ghi từ phần mềm cũ mà không quá tải RAM.
- **Động cơ Lọc Dữ liệu (Marc Sanitization):** Hệ thống Template linh hoạt chỉ cho phép các trường (Tags) và trường con (Subfields) hợp lệ đi qua, tự động loại bỏ rác dữ liệu.
- **Liên thông Thư mục SRU/Z39.50:** Tự động lấy siêu dữ liệu MARCXML từ Thư viện Quốc hội Mỹ (Library of Congress) hoặc các trung tâm thư mục lớn, parse và làm sạch theo quy chuẩn nội bộ trước khi lưu vào cơ sở dữ liệu.

### 3. PHÂN HỆ BỔ SUNG & QUẢN TRỊ VÒNG ĐỜI TÀI LIỆU (ACQUISITION & LIFECYCLE)
- **Quản lý Ngân quỹ (Fund Management):** Tính toán và theo dõi trực tiếp Tổng ngân sách (Total Budget), Số tiền phong tỏa (Committed Amount) và Đã chi (Spent Amount).
- **Tự động hóa Đơn đặt hàng (Purchase Order):** Sinh bản ghi thư mục rút gọn (Brief Record) định dạng MARC 21 tự động mỗi khi tạo Purchase Order Line.
- **Thuật toán sinh mã ĐKCB (Barcode Sequence):** Không bao giờ trùng lặp mã ĐKCB nhờ tận dụng đối tượng `Sequence` của SQL Server. Hỗ trợ tiền tố mã vạch đa dạng (LibraryPolicy).
- **Liên thông MARC 21 thời gian thực:** Mã Barcode mới tạo lập tức được nhúng (inject) tự động vào thẻ `852$p` của hồ sơ JSON MARC 21.
- **Quản lý Hàng tồn & Thanh lọc (Weeding):** Số hóa quy trình kiểm kê bằng máy quét Barcode/RFID (cập nhật trạng thái tự động). Khi thanh lý sách, hệ thống sẽ gỡ tự động dữ liệu khỏi `852$p` để không hiện ảo trên hệ thống tra cứu OPAC.

### 4. PHÂN HỆ QUẢN TRỊ TÀI NGUYÊN SỐ (DAM) VÀ BẢN QUYỀN (DRM)
- **Tải lên phân mảnh (Chunked Uploading):** Xử lý an toàn các file Video/PDF dung lượng Gigabyte. Tách nhỏ (Chunk 5MB), upload đồng thời (Concurrency) và nối file tại Server.
- **Bảo mật Kỹ thuật số (DRM Engine):**
  - **Dynamic Watermark (Thủy ấn động):** Khắc tự động mã số sinh viên, IP, thời gian lên từng trang PDF. Thủy ấn là dạng Flattened không thể bóc tách chỉnh sửa.
  - **Giới hạn truy cập (Max Preview):** Chỉ cho phép đọc thử N trang hoặc N% số trang nếu người dùng chưa có đặc quyền mượn sách số.
  - **Chống Sao chép:** Vô hiệu hóa chuột phải, bôi đen, ẩn URL gốc thông qua Blob Streaming và `URL.createObjectURL()`. Ngăn chặn hoàn toàn Internet Download Manager (IDM) tải lậu.
- **Xử lý Hậu cảnh Ngầm (Background Processing) qua RabbitMQ & SignalR:**
  - Tự động bóc tách Text (OCR) đồng bộ lên Elasticsearch.
  - Tạo ảnh bìa (Thumbnail Generation) cho PDF và Video tự động.
  - Bắn thông báo trạng thái tiến trình thời gian thực (Real-time) cho Cán bộ thư viện bằng SignalR.

### 5. PHÂN HỆ QUẢN TRỊ TÀI NGUYÊN ĐIỆN TỬ (ERM) & COUNTER 5
- **Quản trị Giấy phép (License Management):** Hồ sơ tập trung lưu trữ hợp đồng, giấy phép CSDL Elsevier, Springer... kèm cấu hình API SUSHI.
- **Thu hoạch Tự động qua SUSHI:** Job tự động ngầm (Hangfire) được kích hoạt hàng tháng, lấy số liệu tĩnh (JSON) từ cổng dữ liệu của nhà xuất bản mà không cần con người thao tác.
- **Phân giải và Tính toán COUNTER 5:** Bóc tách chính xác chỉ số TR_J1 (Successful Article Requests). Hệ thống tính toán và xuất báo cáo tự động cho chỉ số hiệu quả kinh tế Cost-Per-Use (Chi phí/lượt sử dụng).

### 6. PHÂN HỆ THIẾT BỊ TỰ PHỤC VỤ (RFID & KIOSK) - SMART LIBRARY
- **Lõi máy chủ SIP2/NCIP:** Dịch vụ TCP Socket đa luồng chạy ngầm tại Port 6009, luôn lắng nghe yêu cầu từ các Trạm Kiosk mượn/trả, Smart Book Drop hoặc thiết bị phân loại tự động (Sorter).
- **Xử lý Thông điệp siêu tốc:** Thẩm định thông tin người dùng (Patron Status - 23), kiểm tra công nợ và khởi tạo phiên mượn sách (Checkout - 11) tính bằng milliseconds.
- **Điều khiển Phần cứng RFID:** Tích hợp bộ phát lệnh tắt bật từ tính (EAS/AFI) trực tiếp đến RFID Pad (`ToggleEasBit`), đảm bảo an ninh liên hoàn khi sinh viên mượn sách qua cổng từ.

### 7. PHÂN HỆ NGHIỆP VỤ NÂNG CAO (ADVANCED WORKFLOWS)
- **Tài liệu theo Khóa học (Course Reserves):** Cơ chế liên kết tài liệu với từng Môn học. Áp dụng khung thời gian mượn ngắn hạn (theo giờ/ngày) để tăng tốc độ xoay vòng tài liệu, phục vụ đủ cho các lớp đông sinh viên.
- **Quản lý Ấn phẩm định kỳ (Serials Prediction):** Kế thừa Prediction Pattern của MARC 21 để dự báo chu kỳ xuất bản (Issue). Trực quan hóa trạng thái từng kỳ báo (Expected, Received, Claimed).
- **Mượn Liên Thư Viện (ILL):** Tuân thủ ISO 18626, cung cấp giao diện dạng Kanban Board kéo-thả để theo dõi quá trình mượn trả từ các trường Đại học/Thư viện đối tác.
- **Trình dựng Thông báo & In Nhãn (Template Builder):** WYSIWYG Editor sinh động, chèn biến số động (Dynamic Variables). Cho phép xuất HTML gửi Email tự động, hoặc render trực tiếp ra định dạng ngôn ngữ ZPL đẩy thẳng IP in ra máy in tem/nhãn gáy chuyên dụng, mô phỏng lề chính xác trên giấy Decal Tomy.

### 8. GIAO DIỆN ĐIỀU HÀNH TRUNG TÂM (STAFF PORTAL)
- **Công nghệ Hiện đại:** Xây dựng bằng Vite, React 18, TypeScript và Tailwind CSS v3.
- **Đa ngôn ngữ (i18n):** Hệ thống song ngữ Anh - Việt 100%, chuyển đổi linh hoạt.
- **Giao diện trực quan động (Dynamic Theming):** Chế độ Sáng/Tối (Dark/Light mode) và bảng màu đa dạng (Blue, Emerald, Purple, Orange, Rose) giúp thư giãn thị giác cho Thủ thư.
- **Quản trị Tự phục vụ:** Cấu hình hệ thống linh hoạt thông qua UI, từ SRU, máy chủ SUSHI, cổng SIP2, đến mẫu thư mục tự động điền sẵn (MARC Template) cho các loại tài liệu khác nhau.

---

## HƯỚNG DẪN KHỞI CHẠY (GETTING STARTED)

1. Yêu cầu hệ thống:
- .NET 9 SDK
- Microsoft SQL Server (hoặc Docker Container)
- Node.js & npm (Cho Frontend)

2. Khởi tạo Cơ sở dữ liệu:
Sử dụng công cụ EF Core CLI để cập nhật database từ thư mục gốc của dự án:
```bash
dotnet ef database update --project src/Backend/LibrarySystem.Infrastructure --startup-project src/Backend/LibrarySystem.Api
```

3. Chạy Dự án:
Có thể sử dụng Makefile đi kèm trên môi trường macOS/Linux:
- Chạy Backend API (với chế độ Hot-reload): `make dev`
- Chạy Background Worker: `make worker`
- Chạy Database qua Docker: `make db`
- Chạy Frontend: `npm run dev` tại thư mục `slib-frontend-monorepo`

4. Điểm truy cập:
- Swagger UI (API Docs): `http://localhost:5132/swagger`
- Hangfire Dashboard (Background Jobs): `http://localhost:5132/hangfire`
- Staff Portal: `http://localhost:3000` (Cổng mặc định Frontend)
