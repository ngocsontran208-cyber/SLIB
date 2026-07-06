# SLIB Staff Portal

Staff Portal là hệ thống Giao diện Quản trị (Admin/Librarian Dashboard) dành riêng cho cán bộ thư viện thuộc dự án **University Library System (SLIB)**.
Hệ thống được phát triển với triết lý: **"Admin chỉ làm nhiệm vụ Cấu hình - Các Role khác thao tác dựa trên Cấu hình đó"**.

## 🚀 Công nghệ sử dụng
- **React 18 + Vite** (Môi trường phát triển cực nhanh).
- **TypeScript** (Bảo đảm an toàn kiểu dữ liệu).
- **Tailwind CSS v3** (Thiết kế hiện đại).
- **Theme & Dark Mode Switcher** (Tùy biến 5 dải màu: Blue, Emerald, Purple, Orange, Rose và chế độ Dark/Light).
- **React Router v6** (Định tuyến SPA mượt mà).
- **Lucide React** (Bộ thư viện icon vector).
- **i18next** (Đa ngôn ngữ Anh/Việt hoàn chỉnh, áp dụng 100% các trang).
- **Axios** (Tích hợp bảo mật HttpOnly Cookie tự động gia hạn JWT).

## 🛠 Các Phân Hệ Quản Trị Đã Hoàn Thiện (Sử dụng Real API)

### 1. Phân Hệ Cấu Hình SRU / Z39.50 (`SruConfig`)
- Giao diện khai báo và cấu hình các máy chủ liên thông biên mục (Ví dụ: Library of Congress).
- Hỗ trợ đầy đủ CRUD.
- **Backend Entity**: `SruTarget`.

### 2. Phân Hệ Tài Nguyên Số ERM & SUSHI (`ErmConfig`)
- Giao diện khai báo bản quyền (Licenses) và gán với Nhà Cung Cấp (Vendors).
- Cấu hình thông số Endpoint SUSHI (API URL, Requestor ID, API Key) để tự động thu thập báo cáo COUNTER 5.
- **Backend Entity**: `ElectronicResourceLicense`, `Vendor`.

### 3. Phân Hệ Quản Lý Người Dùng & Phân Quyền (`UserManagement`)
- Quản trị toàn bộ danh sách cán bộ, độc giả.
- Hỗ trợ gán/cắt quyền (Role-Based Access Control) thông qua giao diện trực quan.
- Bật/Khóa tài khoản khẩn cấp (Ban/Unban).
- **Backend Entity**: `User`, `Role`, `UserRole`.

### 4. Cấu hình Form Biên Mục MARC21 (`MarcTemplateConfig`)
- Giao diện trực quan cho phép Admin định nghĩa các "Mẫu biên mục" (Templates) cho từng loại tài liệu (Sách in, Đồ án, Tạp chí, v.v.).
- Khởi tạo sẵn **toàn bộ 76 trường MARC 21 tiêu chuẩn** (từ 001 đến 856). Admin chỉ việc đánh dấu trường Bắt buộc (Required) hoặc Xóa bớt những trường không dùng tới.
- Thiết lập cờ `IsActive` (Áp dụng làm mẫu hiển thị) để đưa mẫu vào danh sách cho thủ thư sử dụng.
- **Backend Entity**: `MarcTemplate`, `TemplateFieldConfig`.

## 🚧 Các Phân Hệ Đang Trọng Tâm Phát Triển
1. **Cấu hình Kiosk & SIP2**: Khai báo danh sách thiết bị mượn trả tự động, thiết lập thông số Socket (TCP/IP).
2. **Dashboard Analytics**: Thống kê số liệu thật từ toàn bộ cơ sở dữ liệu.

## 📦 Hướng Dẫn Cài Đặt & Chạy
```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường Dev
npm run dev
```

*Lưu ý: Mọi giao tiếp với API đều đi qua proxy hoặc endpoint chỉ định ở biến môi trường. Cookie đăng nhập (AccessToken) được tự động đính kèm thông qua tuỳ chọn `withCredentials: true` của Axios.*
