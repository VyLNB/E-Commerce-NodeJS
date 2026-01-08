#!/bin/bash
set -e # Dừng ngay nếu có lỗi

# --- CẤU HÌNH ---
SNAPSHOT_FILE=${1:-"data-seed.tar.gz"} # Lấy tên file từ tham số, nếu không có thì dùng mặc định
ENV_MODE=${2:-"prod"} # Lấy môi trường từ tham số 2 (mặc định là prod)
TMP_DIR="./tmp_import"

# Xác định lệnh docker-compose dựa trên môi trường
if [ "$ENV_MODE" == "prod" ]; then
    COMPOSE_CMD="docker-compose -f docker-compose.yml"
    echo "🌍 Chế độ: PRODUCTION"
else
    COMPOSE_CMD="docker-compose -f docker-compose.yml -f docker-compose.dev.yml"
    echo "🛠️ Chế độ: DEVELOPMENT"
fi

# --- BẮT ĐẦU ---
if [ ! -f "$SNAPSHOT_FILE" ]; then
    echo "❌ Lỗi: Không tìm thấy file '$SNAPSHOT_FILE'. Hãy tải về và đặt vào thư mục gốc."
    exit 1
fi

echo "🚀 Bắt đầu quá trình import từ file '$SNAPSHOT_FILE'..."
echo "⚠️  CẢNH BÁO: Dữ liệu database và publics hiện tại sẽ bị ghi đè."
read -p "Bạn có chắc chắn muốn tiếp tục? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. Giải nén file
echo "🗜️ Đang giải nén dữ liệu..."
rm -rf $TMP_DIR
mkdir -p $TMP_DIR
tar -xzvf $SNAPSHOT_FILE -C $TMP_DIR
echo "✅ Giải nén thành công."

# 2. Đảm bảo các container đang chạy
echo "🐳 Đang khởi động các service..."
$COMPOSE_CMD up -d api mongo

# Chờ MongoDB khởi động và khởi tạo Replica Set
echo "⏳ Đang chờ MongoDB khởi động..."
sleep 5
echo "⚙️ Kiểm tra và khởi tạo Replica Set..."
$COMPOSE_CMD exec -T mongo mongosh --eval "try { rs.status() } catch (e) { rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongo:27017'}]}) }" --quiet || true

# 3. Import MongoDB
echo "📦 Đang import database vào service 'mongo'..."
docker cp $TMP_DIR/mongo/dump.gz "$($COMPOSE_CMD ps -q mongo)":/tmp/dump.gz
# --drop sẽ xóa collection cũ trước khi import để đảm bảo dữ liệu sạch.
# Sử dụng //tmp/dump.gz để tránh Git Bash trên Windows tự động chuyển đổi đường dẫn sang dạng Windows
$COMPOSE_CMD exec -T mongo mongorestore --archive=//tmp/dump.gz --gzip --drop
echo "✅ Import database thành công."

# 4. Import thư mục publics
echo "📦 Đang sao chép thư mục 'publics' vào service 'api'..."
# Xóa nội dung cũ trước khi copy
$COMPOSE_CMD exec -T api sh -c "rm -rf /usr/src/app/publics/*"
docker cp $TMP_DIR/publics/. "$($COMPOSE_CMD ps -q api)":/usr/src/app/publics/
echo "✅ Sao chép 'publics' thành công."

# 5. Dọn dẹp
rm -rf $TMP_DIR
echo "✨ Hoàn tất! Dữ liệu đã được import thành công."