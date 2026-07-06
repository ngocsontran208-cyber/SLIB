# SLIB Frontend Monorepo

Đây là Monorepo cho phần Frontend của hệ thống University Library System (SLIB). Kiến trúc sử dụng Turborepo để quản lý nhiều ứng dụng (apps) và các package dùng chung (packages).

## Quy trình thực hiện (Workflow) đề xuất cho Team FE

Để triển khai 1 tính năng mới (Ví dụ: Chức năng Mượn/Trả sách), team Frontend cần tuân thủ nghiêm ngặt luồng sau:

- **Bước 1 (Packages)**: Định nghĩa Type dữ liệu tương ứng (VD: `BookLoan`) trong `@slib/types` để đảm bảo đồng bộ với Domain Entities của Backend.
- **Bước 2 (Packages)**: Viết các hàm gọi API (VD: `borrowBook(userId, barcode)`) tương ứng trong các service của `@slib/api-client` (như `circulation.service.ts`).
- **Bước 3 (UI Core - Tùy chọn)**: Nếu cần một UI Component dùng chung mới (VD: Bảng lịch sử có phân trang, Nút tuỳ chỉnh đặc biệt), hãy viết trong `@slib/ui-core`.
- **Bước 4 (App)**: Tạo UI logic và các màn hình nghiệp vụ phức tạp trong thư mục tính năng của app, ví dụ `staff-portal/src/features/circulation/`.
- **Bước 5 (App)**: Lắp ghép tính năng vừa tạo thành một trang hoàn chỉnh (Page Wrapper), ví dụ đưa vào `staff-portal/src/pages/circulation/BorrowReturn.tsx`.
- **Bước 6 (App)**: Khai báo route cho trang vừa tạo trong file định tuyến của app (VD: `staff-portal/src/App.tsx` hoặc App Router của Next.js).
- **Bước 7 (i18n)**: Bổ sung các text ngôn ngữ liên quan vào các file dịch thuật `@slib/i18n/src/locales/vi.json` và `en.json`.

Việc tuân thủ quy trình 7 bước này giúp duy trì cấu trúc dự án sạch, phân tách rõ ràng trách nhiệm của từng package, và giúp các dự án (`staff-portal`, `opac-web`) có thể dễ dàng tái sử dụng mã nguồn.
