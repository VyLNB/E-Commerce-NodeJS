import fs from "fs/promises";
import path from "path";
import { myLogger } from "~/loggers/mylogger.log.js";
import { uploadFileToCloudStorageQueue } from "~/providers/jobQueue.js";

const enqueueProductImageUpload = async (localPath, productId) => {
  // Bỏ qua nếu path không hợp lệ hoặc đã là URL cloud
  if (
    !localPath ||
    typeof localPath !== "string" ||
    localPath.startsWith("http")
  ) {
    return;
  }

  try {
    const absolutePath = path.isAbsolute(localPath)
      ? localPath
      : path.join(process.cwd(), localPath);

    // Kiểm tra file tồn tại
    await fs.access(absolutePath);

    const b64 = await fs.readFile(absolutePath, "base64");
    const filename = path.basename(localPath);
    const destPath = `products/${filename}`; // Đường dẫn trên cloud

    // Thêm job vào queue
    await uploadFileToCloudStorageQueue.add("upload_file", {
      fileBuffer: b64,
      destPath,
      isAvatar: false, // Báo cho worker đây không phải avatar
      productId: productId.toString(),
      localPath: localPath, // Path để worker tìm và thay thế trong DB
    });

    myLogger.info(`[Dev Mode] Enqueued job for product image: ${localPath}`);
  } catch (err) {
    myLogger.error(
      `[Dev Mode] Failed to enqueue job for image ${localPath}: ${err.message}`
    );
  }
};

export default enqueueProductImageUpload;
