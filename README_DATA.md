# HƯỚNG DẪN QUẢN LÝ DỮ LIỆU (IMPORT/EXPORT)

Tài liệu này hướng dẫn cách sử dụng hai script `export.sh` và `import.sh` để sao lưu và khôi phục/khởi tạo dữ liệu (MongoDB, thư mục publics) cho ứng dụng.

**YÊU CẦU BẮT BUỘC:**

- Docker và Docker Compose đã được cài đặt.
- **Trên Windows:** Phải sử dụng **Git Bash** (đi kèm khi cài Git) hoặc WSL. KHÔNG dùng CMD hay PowerShell.

---

## 1. Export Dữ liệu (Tạo file snapshot)

Sử dụng khi muốn tạo một file `data-snapshot.tar.gz` từ dữ liệu chuẩn trên máy để chia sẻ sang các máy khác.

**Các bước thực hiện:**

1.  **Đảm bảo các container đang chạy:**

    ```bash
    docker-compose up -d
    ```

2.  **Chạy script `export.sh`:**

    ```bash
    bash export.sh
    ```

3.  **Hoàn tất:**
    - Một file có tên `data-snapshot-[ngày].tar.gz` sẽ được tạo ra. Đây chính là file chứa dữ liệu của ứng dụng.

---

## 2. Import Dữ liệu (Nạp dữ liệu vào máy)

Sử dụng khi khởi chạy hệ thống lần đầu hoặc muốn "reset" dữ liệu trên máy của mình về bản dữ liệu ban đầu.

**CẢNH BÁO: Script này sẽ XÓA SẠCH dữ liệu database và các file trong thư mục `publics` hiện tại của bạn trước khi nạp dữ liệu mới.**

**Các bước thực hiện:**

1.  **Tải file dữ liệu:**

    - Tải file `[filename].tar.gz`...

2.  **Đặt file vào thư mục gốc:**

    - Đảm bảo file `[filename].tar.gz` nằm ngay tại thư mục ngang hàng với file `docker-compose.yml`.

3.  **Chạy script `import.sh`:**

    Cú pháp: `bash import.sh [tên_file_snapshot] [môi_trường]`

    - **Môi trường Development:**

      ```bash
      bash import.sh data-seed.tar.gz dev
      ```

      _(Script sẽ tự động sử dụng `docker-compose.dev.yml` để đảm bảo các port được mở đúng cách)_

    - **Môi trường Production (Mặc định):**
      ```bash
      bash import.sh data-seed.tar.gz
      # Hoặc chỉ định rõ:
      bash import.sh data-seed.tar.gz prod
      ```

4.  **Xác nhận:**
    - Script sẽ hỏi bạn có chắc chắn muốn tiếp tục không. Gõ `y` và `Enter` để xác nhận.
    - Script sẽ tự động khởi động các container cần thiết, xóa dữ liệu cũ và nạp dữ liệu mới. Quá trình này có thể mất vài giây.

---

## 3. Xử lý lỗi thường gặp

**Lỗi 1: `Permission denied` (Quyền bị từ chối)**

- **Lý do:** File script của bạn chưa có quyền thực thi.
- **Giải pháp:** Chạy lệnh sau MỘT LẦN DUY NHẤT để cấp quyền:
  ```bash
  chmod +x export.sh import.sh
  ```

**Lỗi 2: `getaddrinfo ENOTFOUND mongo` khi kết nối bằng MongoDB Compass**

- **Lý do:** Do MongoDB chạy ở chế độ Replica Set, nó trả về hostname là `mongo` mà máy tính của bạn (Windows) không hiểu được.
- **Giải pháp:**
  - Thêm `?directConnection=true` vào cuối chuỗi kết nối.
  - Ví dụ: `mongodb://localhost:27017/gear-up?directConnection=true`
  - Hoặc trong Compass, bật tùy chọn **Direct Connection** trong tab **Advanced Connection Options**.
