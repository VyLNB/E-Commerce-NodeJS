### Dự án Cuối kỳ môn Lập trình Web với NodeJS 
Đây là Dự án nhóm với các thành viên
- Nguyễn Thành Tiến (https://github.com/TDeV-VN): Backend
- Lê Phú Hào (https://github.com/tdtu-lph1110): Frontend người dùng
- Lê Ngọc Bích Vy: Frontend quản trị viên

---

## BẮT ĐẦU VỚI

- Yêu cầu tải xuống tệp `docker-compose.dev.env` và `docker-compose.prod.env` [tại đây](https://drive.google.com/drive/folders/1h5b5-GDS9FRcfvpKlhRZ9WT4-viov-iK?usp=sharing) (nếu chưa có) và đặt trong thư mục cùng cấp với tệp `docker-compose.yml`.
- Xem qua tệp `README_DATA.md` để khởi tạo dữ liệu cho ứng dụng.

---

## KHỞI CHẠY ỨNG DỤNG (./source)

- **Môi trường Development:** `npm run docker:dev`

- **Môi trường Production:** `npm run docker:prod`

---

## Các môi trường

### Môi trường development (dev)

- **Đồng bộ** code trong các container với thư mục trên máy host và hỗ trợ **hot reload** (trừ các thao tác liên quan tới thay đổi dependencies)

- **Đồng bộ** thư mục publics (chứa các file tài nguyên chia sẻ như ảnh người dùng, ảnh sản phẩm,...) của api server trong container với thư mục trên máy host

- Mongodb và redis thực tế đang kết nối với các dịch vụ **đám mây** của bên thứ ba, không kết nối với các docker container

- Các tài nguyên trong thư mục publics sẽ được tải lên dịch vụ **đám mây** và cập nhật lại url trong database

### Môi trường production (prod)

- **Không đồng bộ** code trong các container với thư mục trên máy host

- **Không đồng bộ** thư mục publics trong container với thư mục trên máy host

- Các service database như mongodb và redis **không thể truy cập** từ bên ngoài docker-network

---

## Các đường dẫn truy cập hệ thống

- **Trang cửa hàng dành cho khách hàng:** http://localhost:3000

- **Trang quản lý cửa hàng dành cho quản trị viên:** http://localhost:4000

- **Gọi đến các api service:** http://localhost:5000/v1/

- **Quan sát log của tất cả các container:** http://localhost:8888

---

## MÔ TẢ CÁC LỆNH

Dưới đây là mô tả chi tiết các lệnh `npm` được định nghĩa trong `./source/package.json`.

### Môi trường Development

- `npm run docker:dev`

  > Khởi chạy toàn bộ các service cho môi trường development. Lệnh này sẽ build lại image nếu có thay đổi trong mã nguồn hoặc `Dockerfile` (`--build`).

- `npm run docker:dev:down`

  > Dừng và xóa các container/network của môi trường development. Dữ liệu trong volume (ví dụ: database) sẽ **được giữ lại**.

- `npm run docker:dev:clean`

  > Dọn dẹp triệt để môi trường development, bao gồm cả việc **xóa các volume** chứa dữ liệu (`-v`). Dùng khi muốn reset hoàn toàn database.

- `npm run docker:dev:restart`
  > Khởi động lại tất cả các service của môi trường development mà không cần dừng toàn bộ hệ thống.

### Môi trường Production

- `npm run docker:prod`

  > Khởi chạy toàn bộ các service cho môi trường production ở chế độ nền (`-d`).

- `npm run docker:prod:down`

  > Dừng và xóa các container/network của môi trường production.

- `npm run docker:prod:clean`

  > Dọn dẹp triệt để môi trường production, bao gồm cả việc **xóa các volume** chứa dữ liệu (`-v`). Dùng khi muốn reset hoàn toàn database.

- `npm run docker:dev:restart`
  > Khởi động lại tất cả các service của môi trường production mà không cần dừng toàn bộ hệ thống.
