#!/bin/bash
set -e # Dừng ngay nếu có lỗi

# --- CẤU HÌNH ---
SNAPSHOT_FILE="data-snapshot-$(date +%Y-%m-%d).tar.gz"
TMP_DIR="./tmp_export"
DATABASE_NAME="gear-up"

# --- BẮT ĐẦU ---
echo "🚀 Bắt đầu quá trình export..."

# Dọn dẹp nếu còn sót lại từ lần trước
rm -rf $TMP_DIR
mkdir -p $TMP_DIR/mongo $TMP_DIR/publics

# 1. Export MongoDB
echo "📦 Đang dump database '$DATABASE_NAME' từ service 'mongo'..."
docker-compose exec -T mongo sh -c "mongodump --archive --gzip --db=$DATABASE_NAME > /tmp/dump.gz"
docker cp "$(docker-compose ps -q mongo)":/tmp/dump.gz $TMP_DIR/mongo/dump.gz
echo "✅ Dump database thành công."

# 2. Export thư mục publics
echo "📦 Đang sao chép thư mục 'publics' từ service 'api'..."
docker cp "$(docker-compose ps -q api)":/usr/src/app/publics/. $TMP_DIR/publics/
echo "✅ Sao chép 'publics' thành công."

# 3. Nén tất cả vào một file
echo "🗜️ Đang nén dữ liệu vào file: $SNAPSHOT_FILE..."
tar -czvf $SNAPSHOT_FILE -C $TMP_DIR .
echo "✅ Nén thành công."

# 4. Dọn dẹp
rm -rf $TMP_DIR
echo "✨ Hoàn tất! File dữ liệu của bạn là: $SNAPSHOT_FILE"