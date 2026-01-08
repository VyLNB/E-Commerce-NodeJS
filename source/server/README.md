### tdtu-nodejs-ecommerce

---

## ⚠️ CẢNH BÁO

Cấu trúc phản hồi của API ở môi trường **Development** và môi trường **Production** là khác nhau. Vui lòng **không khởi chạy API ở môi trường Development** cho quá trình phát triển giao diện và triển khai thực tế.

---

## 🔑 CẤU HÌNH BÍ MẬT

Các tệp bí mật trong thư mục `./source/server/secrets` là cần thiết để khởi chạy API. Yêu cầu tải về [tại đây](https://drive.google.com/drive/folders/1kRGuchC4DP-xlxVjweGvBg0H2CrGBERe?usp=sharing).

Note: đảm bảo tên tệp chính xác là ".env".

---

## ⚙️ MÔI TRƯỜNG KHỞI CHẠY API (./source/server)

### Môi trường Development

- **Khởi chạy với mã nguồn:** `npm run dev`

### Môi trường Production

- **Khởi chạy với mã nguồn:** `npm run production`

---

## ✍️ QUY CHUẨN MÃ NGUỒN API (CODE CONVENTION)

- API sử dụng gói **ESLint** để thiết lập các nguyên tắc cho cú pháp mã nguồn.
- Nên sử dụng **Visual Studio Code** kết hợp với **ESLint extension** để trực quan hóa và phát hiện sớm các đoạn mã vi phạm quy chuẩn.
- API đã được thiết lập để gây khó khăn cho việc khởi chạy nếu mã nguồn không tuân thủ các quy chuẩn được định nghĩa trong tệp `eslint.config.mjs`.
- Kiểm tra các vi phạm bằng cách thủ công: `npm run lint`

### ➡️ CÁCH BỎ QUA MỘT QUY TẮC

Bạn có thể sử dụng các chỉ dẫn sau để bỏ qua một quy tắc khi cần thiết:

```javascript
// Bỏ qua một dòng cụ thể
const express = require("express"); // eslint-disable-line no-var

// Bỏ qua dòng tiếp theo
// eslint-disable-next-line no-console
console.log("Server started");

// Bỏ qua một khối mã
/* eslint-disable no-console */
console.log("debug");
console.log("another log");
/* eslint-enable no-console */
```
