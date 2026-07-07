# HỆ THỐNG QUẢN TRỊ THƯ VIỆN ĐẠI HỌC (UNIVERSITY LIBRARY SYSTEM)

## TỔNG QUAN HỆ THỐNG
Hệ thống Thư viện Đại học (SLIB) là một nền tảng quản trị thư viện toàn diện, được xây dựng dựa trên kiến trúc hiện đại (Clean Architecture). Hệ thống kết hợp các tiêu chuẩn thư viện quốc tế như MARC 21, Z39.50/SRU, cùng các tiêu chuẩn quản trị Bổ sung (Acquisition) tiên tiến của FOLIO và Alma. Đặc biệt, hệ thống đặt trọng tâm vào hiệu năng cao, tính toàn vẹn dữ liệu (Database Transactions), và lưu vết kiểm toán tài chính (Audit Trail) tuyệt đối thông qua tính năng System-versioned Temporal Tables của Microsoft SQL Server.

## KIẾN TRÚC VÀ CÔNG NGHỆ CHÍNH
- Ngôn ngữ và Nền tảng: C# 13, .NET 9
- Kiến trúc phần mềm: Clean Architecture (Domain, Application, Infrastructure, Api, Worker)
- ORM: Entity Framework Core 9 (EF Core 9 Code-First Migrations)
- Cơ sở dữ liệu: Microsoft SQL Server (sử dụng Native JSON Mapping và System-versioned Temporal Tables)
- API: RESTful API (ASP.NET Core Web API)
- Xử lý nền: Hangfire, Background TCP Socket
- Giao tiếp thời gian thực: SignalR
- Xác thực và Phân quyền: JWT Authentication, Policy-based Authorization (ABAC và RBAC)
- Tích hợp chuẩn thư viện: Giao thức SRU (Search/Retrieve via URL), Cấu trúc phân tích XML/ISO 2709, SUSHI/COUNTER 5, SIP2/NCIP

## GIAI ĐOẠN 1: KHỞI TẠO KIẾN TRÚC NỀN TẢNG VÀ AN NINH BẢO MẬT (FOUNDATION & SECURITY)
Giai đoạn khởi tạo thiết lập bộ khung vững chắc cho toàn bộ dự án:
- Phân chia Clean Architecture: Các dự án con được tổ chức logic thành LibrarySystem.Domain (Thực thể), LibrarySystem.Application (Giao diện dịch vụ), LibrarySystem.Infrastructure (Triển khai kỹ thuật và Database), và LibrarySystem.Api (Điểm cuối RESTful).
- Cơ sở dữ liệu: Thiết lập Microsoft SQL Server qua EF Core 9 Code-First Migrations. Áp dụng System-versioned Temporal Tables cho các bảng tài chính (PurchaseOrder, Fund, Invoice) để lưu vết thay đổi dữ liệu vĩnh viễn (Audit Trail).
- Hệ thống Identity & Access Management: Xây dựng cơ chế phát hành JWT kết hợp các chính sách phân quyền mềm dẻo dựa trên thuộc tính (ABAC - Attribute-Based Access Control) và vai trò (RBAC - Role-Based Access Control). Hệ thống sử dụng Claims để kiểm soát quyền truy cập chi tiết đến từng API.
- Rate Limiting: Middleware Rate Limiting được cấu hình và kiểm thử tải (Load Testing) kỹ lưỡng nhằm đảm bảo các endpoint nhạy cảm (như DRM Engine) có khả năng chống chịu trước các cuộc tấn công DDoS và lưu lượng truy cập bất thường.

## GIAI ĐOẠN 2: XÂY DỰNG ĐỘNG CƠ QUẢN TRỊ SIÊU DỮ LIỆU VÀ BIÊN MỤC (CATALOGING ENGINE)
Giai đoạn này tập trung vào phân hệ thao tác với chuẩn MARC 21, đảm bảo tính toàn vẹn và hiệu suất xử lý dữ liệu thư mục:
- Ánh xạ Native JSON: Thay vì sử dụng chuỗi văn bản thuần túy, dữ liệu MARC 21 (với hàng ngàn trường và trường con) được thiết kế bằng cấu trúc List<MarcField>. Cấu trúc này được ánh xạ trực tiếp thành các cột Native JSON thông qua hàm `.ToJson()` của EF Core 9 trên SQL Server. Điều này cho phép hệ thống sử dụng các truy vấn LINQ mạnh mẽ, tự động biên dịch thành các hàm SQL JSON bản địa để tìm kiếm bên trong cấu trúc MARC.
- Động cơ Lọc Dữ liệu (Marc Sanitization Service): Cấu hình các mẫu biên mục (Template) quy định nghiêm ngặt trường nào (Tag) và trường con nào (Subfield Code) được phép xuất hiện. Dữ liệu nạp vào luôn được lưới lọc duyệt qua để loại bỏ dữ liệu rác, tuân thủ chặt chẽ quyền RBAC do Quản trị viên thiết lập.
- Trình phân tích (Parser) ISO 2709: Xây dựng cơ chế đọc luồng nhị phân (Binary Stream) cho chuẩn ISO 2709. Dữ liệu từ các file `.mrc` dung lượng lớn được đọc tuần tự theo lô (batch) từ IFormFile, đảm bảo không gây quá tải bộ nhớ (RAM) khi quản trị viên nhập khẩu toàn bộ dữ liệu lịch sử từ phần mềm ILS cũ.
- Tích hợp SRU Client: Cấu hình HttpClient để kết nối trực tiếp đến Thư viện Quốc hội Mỹ (Library of Congress). Hệ thống nhận dữ liệu MARCXML, sử dụng LINQ to XML (Descendants) để chuyển đổi mượt mà sang cấu trúc Flat JSON của hệ thống (List<MarcField>), sau đó đi qua lưới lọc MarcSanitizationService trước khi lưu trữ.
- Kiểm thử kịch bản (Unit Tests): Các dịch vụ như MarcSanitizationService và SruClientService được bao phủ bởi Unit Tests (sử dụng thư viện Moq và MockQueryable), đảm bảo độ tin cậy của việc truy vấn LINQ trên JSON và xử lý logic nghiệp vụ mà không phụ thuộc vào Database thật.

## GIAI ĐOẠN 3: PHÂN HỆ BỔ SUNG, MUA SẮM VÀ VÒNG ĐỜI TÀI LIỆU (ACQUISITION & PHYSICAL ITEM LIFECYCLE)
Dựa trên mô hình của FOLIO/Alma:
- Quản lý Quỹ (Fund): Theo dõi Total Budget, Committed Amount, và Spent Amount.
- Đơn đặt hàng (PO/POL): Khi tạo Purchase Order Line (POL), hệ thống tự động sinh một bản ghi thư mục rút gọn (Brief Record) định dạng MARC 21, đồng thời phong tỏa ngân sách (Committed).
- Thuật toán Cấp mã ĐKCB (Barcode Sequence): Sử dụng cấu trúc mã vạch có tiền tố cấu hình linh hoạt (LibraryPolicy). Việc sinh mã vạch dựa vào đối tượng `Sequence` nguyên tử của SQL Server (SELECT NEXT VALUE) đảm bảo không bao giờ có xung đột (Concurrency) dù hệ thống tiếp nhận nhập kho đa luồng.
- Liên thông MARC 21: Mã ĐKCB (Barcode) vừa sinh lập tức được cấy (inject) tự động vào mảng JSON MARC 21 tại thẻ 852, trường con $p để duy trì kết nối từ tầng Bổ sung sang Biên mục.
- Thanh lọc (Weeding): Xử lý vòng đời tài liệu bằng cách dọn dẹp ấn bản bị hỏng/mất khỏi cơ sở dữ liệu đồng thời tự động làm sạch JSON MARC 21 (xóa đúng subfield 852$p tương ứng) để không bị hiển thị lỗi trên OPAC.

## GIAI ĐOẠN 4: QUẢN TRỊ TÀI NGUYÊN ĐIỆN TỬ (ERM) & TÍCH HỢP SUSHI/COUNTER 5
Giải quyết bài toán thu thập số liệu sử dụng CSDL của thư viện:
- Quản lý Giấy phép (License Management): Lưu trữ hồ sơ hợp đồng mua e-journals, e-books của Elsevier, Springer kèm theo thông tin chi phí và cấu hình kết nối API SUSHI.
- Tự động hóa qua Giao thức SUSHI: Thiết lập Hangfire Job (SushiHarvestJob) tự động thức dậy định kỳ hàng tháng. Hệ thống dùng HttpClient để gọi trực tiếp tới API Endpoint của nhà xuất bản, rút trích JSON mà không cần can thiệp thủ công.
- Tuân thủ Chuẩn Đo lường COUNTER 5: Hệ thống có bộ phân giải đọc hiểu chuẩn COUNTER 5 (TR_J1) để tìm đúng chỉ số lượt tải bài báo thành công (Successful Article Requests). Từ đó, Backend (IErmService) tự động tính toán ra chỉ số Cost-Per-Use (Chi phí trên mỗi lượt sử dụng) phục vụ công tác tài chính của nhà trường.

## GIAI ĐOẠN 5: TÍCH HỢP HỆ SINH THÁI THIẾT BỊ TỰ PHỤC VỤ (RFID & SIP2/NCIP)
Biến không gian thư viện thành mô hình Smart Library:
- Máy chủ Lắng nghe SIP2 TCP Socket: Tạo dịch vụ đa luồng (Sip2SocketServerService) chạy ngầm liên tục ở port 6009 trong Worker, sẵn sàng tiếp nhận kết nối giao thức chuẩn quốc tế SIP2 từ bất kỳ Trạm Kiosk hay Smart Book Drop nào.
- Chuỗi Xử lý Thông điệp Thời gian thực: Bộ phân giải (Sip2Handler) đọc mã `23` (Patron Status Request) và `11` (Checkout). Mọi yêu cầu được thẩm định thần tốc thông qua Entity Framework để kiểm tra công nợ và khởi tạo phiên mượn sách.
- Điều khiển Phần cứng (Hardware Command): Khi giao dịch mượn thành công (Message 12), hệ thống lập tức xuất lệnh (`ToggleEasBit`) thẳng tới thiết bị RFID Pad để cấu hình tắt cờ an ninh EAS/AFI trên chip. Sinh viên có thể qua cổng từ bảo vệ an toàn mà không làm chuông kêu.

## GIAI ĐOẠN 6: HỆ THỐNG QUẢN TRỊ TRUNG TÂM (STAFF PORTAL & FRONTEND)
Dự án bao gồm một Monorepo Frontend (Vite + React 18 + TypeScript) đóng vai trò là giao diện điều hành toàn bộ thư viện:
- Giao diện hiện đại (Modern UI/UX): Tích hợp Tailwind CSS v3 với hệ thống quản lý Theme động (Theme Switcher) cho phép cán bộ thư viện chọn giữa 5 dải màu (Blue, Emerald, Purple, Orange, Rose) và chế độ Dark/Light mode theo sở thích.
- Đa ngôn ngữ (i18n): Áp dụng 100% song ngữ Anh-Việt (`i18next`) xuyên suốt mọi phân hệ, cho phép chuyển đổi ngôn ngữ tức thì không cần tải lại trang.
- Quản trị linh hoạt (Admin-driven Configuration):
  - **SRU & ERM**: Cấu hình các máy chủ liên thông thư mục và thông số kết nối API SUSHI để lấy báo cáo COUNTER tự động.
  - **Mẫu Biên Mục (MARC Templates)**: Giao diện trực quan tự động load sẵn toàn bộ 76 trường MARC 21 tiêu chuẩn (từ 001 đến 856). Quản trị viên chỉ việc "check" chọn các trường bắt buộc và cấu hình form hiển thị mặc định cho từng loại tài liệu, giảm thiểu sai sót cho thủ thư khi nhập liệu.
  - **Tích hợp Kiosk & SIP2**: Khai báo IP, Port của các cổng anượng ninh và Kiosk tự phục vụ.
  - **Phân quyền Bảo mật Kép (Double Security Layer)**: Bên cạnh Backend, lớp Component `ProtectedRoute` phía Frontend sẽ chủ động đánh chặn ngay từ vòng gửi xe (ngăn chặn văng tài khoản Sinh Viên cố tình truy cập vào Dashboard của Staff Portal).

## GIAI ĐOẠN 7: TÍCH HỢP QUY TRÌNH NGHIỆP VỤ NÂNG CAO VÀ MỞ RỘNG (ADVANCED WORKFLOWS)
Hệ thống tiếp tục được mở rộng với hàng loạt quy trình nghiệp vụ chuyên sâu theo quy chuẩn thư viện quốc tế:
- **Tài liệu cho Khóa học (Course Reserves)**: Liên kết trực tiếp sách và giáo trình với từng Học phần/Môn học. Hệ thống áp dụng chính sách mượn đặc biệt (rút ngắn thời gian mượn xuống theo giờ hoặc theo ngày) để tối ưu vòng quay tài liệu cho toàn bộ sinh viên trong lớp.
- **Quản trị Ấn phẩm định kỳ (Serials Management)**: Dựa trên cấu trúc Prediction Pattern của MARC 21 để dự báo chu kỳ xuất bản (Tạp chí theo tháng, tuần). Giao diện quản lý hiển thị các Issue (Kỳ báo) trực quan kèm trạng thái (Expected, Received, Claimed).
- **Mượn Liên Thư viện (Interlibrary Loan - ILL)**: Tuân thủ tiêu chuẩn giao dịch ISO 18626, cung cấp Bảng Kanban Board cho thủ thư kéo thả theo dõi quá trình mượn sách từ các trường Đại học đối tác (Pending, In Transit, Received, Returned).
- **Kiểm kê & Tồn kho (Inventory/Stocktake)**: Số hóa quy trình kiểm kê thư viện. Thủ thư có thể dùng máy quét Barcode hoặc thiết bị đọc RFID cầm tay để quét hàng loạt kệ sách. Hệ thống cập nhật trạng thái "Missing" hoặc "Found" tức thì qua kết nối SignalR thời gian thực.
- **Trình dựng Mẫu Thông báo & Nhãn (Template Builder)**: Module thiết kế WYSIWYG Editor tích hợp biến động (Dynamic Variables). Hỗ trợ render ra HTML (dành cho Email nhắc hạn trả) hoặc render trực tiếp ra ngôn ngữ ZPL (để đẩy lệnh tới máy in tem/nhãn gáy sách chuyên dụng qua TCP/IP). Hệ thống tích hợp sẵn Grid Preview trực quan mô phỏng khổ giấy Decal Tomy để thủ thư căn chỉnh lề chính xác 100% trước khi in.

## GIAI ĐOẠN 8: HỆ THỐNG QUẢN TRỊ TÀI NGUYÊN SỐ (DAM) VÀ BẢO VỆ BẢN QUYỀN (DRM)
Nâng cấp khả năng quản lý tài nguyên nội sinh và học liệu số với các tiêu chuẩn bảo mật khắt khe:
- **Lưu trữ Phân tán & Tải lên Chia nhỏ (Chunked Uploading)**: Thay vì upload nguyên file lớn dễ gây lỗi nghẽn mạng (Timeout), Frontend (React) sẽ chia file thành các mảnh nhỏ (Chunk 5MB) và upload đồng thời (Concurrency). Backend (API) tiếp nhận, lưu tạm vào thư mục `Temp` và chỉ thực hiện gộp (Merge) khi nhận đủ các mảnh. Điều này cho phép hệ thống xử lý mượt mà các file PDF/Video lên tới hàng Gigabyte.
- **Bảo mật Kỹ thuật Số (DRM Engine - Digital Rights Management)**:
  - **Dynamic Watermark (Thủy ấn động)**: Backend tự động khắc chìm mã sinh viên, thời gian truy cập, và IP lên mọi trang tài liệu PDF trước khi trả về luồng stream. Kẻ gian không thể dùng công cụ chỉnh sửa để xóa vì thủy ấn đã được "hòa tan" vào cấu trúc PDF (Flattened).
  - **Giới hạn Đọc thử (Max Preview Pages)**: Cấu hình linh hoạt cho phép sinh viên chỉ xem được N trang đầu tiên hoặc N% tổng số trang của tài liệu. Để xem toàn văn, sinh viên phải thực hiện Mượn tài liệu số.
  - **Chống Sao chép (Anti-Copy/Download)**: Component Trình xem nội bộ (Secure Viewer) chặn đứng các nỗ lực chuột phải, bôi đen (user-select: none), và sử dụng `URL.createObjectURL()` từ luồng Blob Streaming để giấu kín đường dẫn file thực tế, ngăn chặn triệt để việc dùng IDM (Internet Download Manager) bắt link tải lậu.
- **Xử lý Ngầm (Background Processing)**: Sau khi gộp file hoàn tất, Message Queue (RabbitMQ) sẽ điều phối các Background Worker (chạy tách biệt khỏi API chính) để thực hiện:
  - **OCR & Trích xuất Văn bản**: Bóc tách Text từ PDF để đồng bộ vào Elasticsearch, phục vụ tính năng Tìm kiếm Toàn văn (Full-text Search).
  - **Tạo Ảnh bìa (Thumbnail Generation)**: Tự động trích xuất trang đầu tiên của PDF hoặc khung hình bất kỳ của Video để làm ảnh đại diện cho tài liệu.
  - **Cập nhật Thời gian thực (Real-time Notification)**: Trạng thái tiến trình của Worker (Đang OCR, Đang tạo ảnh bìa...) được bắn trực tiếp về Frontend thông qua SignalR, giúp người quản trị nắm bắt tiến độ mà không cần làm mới trang.

## HƯỚNG DẪN KHỞI CHẠY (GETTING STARTED)

1. Yêu cầu hệ thống:
- .NET 9 SDK
- Microsoft SQL Server (hoặc Docker Container)

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

4. Điểm truy cập:
- Swagger UI (API Docs): `http://localhost:5132/swagger`
- Hangfire Dashboard: `http://localhost:5132/hangfire`
