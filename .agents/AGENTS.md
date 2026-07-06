
## Frontend Development Workflow
Khi triển khai 1 tính năng mới trên Frontend (ví dụ Chức năng Mượn/Trả sách), agent phải tuân thủ nghiêm ngặt 7 bước sau:
1. **Packages**: Định nghĩa Type trong `@slib/types`.
2. **Packages**: Viết hàm gọi API trong `@slib/api-client`.
3. **UI Core**: Khởi tạo UI Component dùng chung trong `@slib/ui-core` (nếu cần).
4. **App (Features)**: Tạo UI logic và nghiệp vụ trong `src/features/<tên-tính-năng>/`.
5. **App (Pages)**: Lắp ghép tính năng vào Page Wrapper trong `src/pages/<tên-tính-năng>/` (hoặc `src/app/` với Next.js).
6. **App (Routes)**: Khai báo Route.
7. **i18n**: Bổ sung ngôn ngữ vào `@slib/i18n/src/locales/`.
