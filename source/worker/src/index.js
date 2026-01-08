import { Worker } from "bullmq";
import { env } from "./configs/environment.js";
import { myLogger } from "./loggers/myLogger.js";
import {
  sendRegistrationConfirmationEmail,
  sendResetPasswordEmail,
  sendPasswordChangeNotificationEmail,
} from "./emailProvider.js";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { CONNECT_DB } from "./configs/mongodb.js";
import { userModel } from "./models/userModel.js";
import { productModel } from "./models/productModel.js";

const getContentType = (ext) => {
  if (!ext) return undefined;
  const e = ext.toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".gif") return "image/gif";
  if (e === ".webp") return "image/webp";
  if (e === ".svg") return "image/svg+xml";
  if (e === ".pdf") return "application/pdf";
  if (e === ".txt") return "text/plain";
  return undefined;
};

import { redisConnection } from "./configs/redis.js";
import { orderProcessor } from "./processors/orderProcessor.js";

let supabase;

try {
  // Kết nối MongoDB
  await CONNECT_DB();

  // Tạo client Supabase (lấy cấu hình từ env)
  // NOTE: Các dự án miễn phí sẽ bị tạm dừng sau 1 tuần không hoạt động. Giới hạn 2 dự án đang hoạt động.
  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
} catch (error) {
  // Hiện tại cái này không quan trọng nên không cần thoát
  myLogger.error("Error during initial setup: " + error.message, {
    stack: error.stack,
  });
  // process.exit(1);
}

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    try {
      myLogger.info(
        `Starting Job #${job.id} of type ${job.name}, sending to ${job.data.email}`
      );
      if (job.name === "send_welcome_email") {
        await sendRegistrationConfirmationEmail(
          job.data.to,
          job.data.userName,
          job.data.resetLink,
          job.data.email_confirmation_token_life
        );
      } else if (job.name === "send_reset_password_email") {
        await sendResetPasswordEmail(
          job.data.to,
          job.data.resetLink,
          job.data.reset_password_token_life
        );
      } else if (job.name === "send_password_change_notification_email") {
        await sendPasswordChangeNotificationEmail(job.data.to);
      } else {
        throw new Error(`Unknown job type: ${job.name}`);
      }
      return { status: "Success", sentTo: job.data.email };
    } catch (error) {
      myLogger.error(`Error processing job: ${error.message}`, {
        stack: error.stack,
      });
    }
  },
  { connection: redisConnection }
);

emailWorker.on("completed", (job, result) => {
  myLogger.info(`Job #${job.id} completed! Result: ${JSON.stringify(result)}`);
});

emailWorker.on("failed", (job, err) => {
  myLogger.error(`Job #${job.id} failed with error: ${err.message}`, {
    stack: err.stack,
  });
});

emailWorker.on("error", (err) => {
  myLogger.error(`Worker error: ${err.message}`, { stack: err.stack });
});

const uploadFileToCloudStorageWorker = new Worker(
  "upload-file-to-cloud-storage-queue",
  async (job) => {
    try {
      myLogger.info(
        `Starting Job #${job.id} of type ${job.name}, uploading file to ${job.data.destPath} in cloud storage`
      );
      if (job.name === "upload_file") {
        const bucket = job.data.bucket || env.SUPABASE_BUCKET;
        const destPath =
          job.data.destPath || path.basename(job.data.filePath || "unknown");

        let fileBuffer;
        if (job.data.fileBuffer) {
          // Accept Buffer or base64 string
          if (typeof job.data.fileBuffer === "string") {
            // assume base64
            fileBuffer = Buffer.from(job.data.fileBuffer, "base64");
          } else {
            fileBuffer = Buffer.from(job.data.fileBuffer);
          }
        } else if (job.data.filePath) {
          const localPath = job.data.filePath;
          fileBuffer = await fs.promises.readFile(localPath);
        } else {
          throw new Error("No fileBuffer or filePath provided in job data");
        }

        const ext = path.extname(destPath);
        const contentType = job.data.contentType || getContentType(ext);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(destPath, fileBuffer, { upsert: true, contentType });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        } else {
          // Luôn lấy ra publicUrl
          const publicUrl = supabase.storage.from(bucket).getPublicUrl(destPath)
            .data.publicUrl;

          if (!publicUrl) {
            throw new Error("Could not get public URL after upload");
          }
          // nếu là avatar thì cập nhật luôn url vào database
          if (job.data.isAvatar && job.data.userId) {
            const user = await userModel.updateUser(job.data.userId, {
              avatar: publicUrl,
            });
          } else if (
            !job.data.isAvatar &&
            job.data.productId &&
            job.data.localPath
          ) {
            await productModel.updateImagePath(
              job.data.productId,
              job.data.localPath, // Đường dẫn tạm trên server (vd: publics/products/uuid.jpg)
              publicUrl // Đường dẫn mới trên cloud
            );
          }
        }

        myLogger.info(`File uploaded successfully: ${JSON.stringify(data)}`);
        return { status: "Success", filePath: data?.path || destPath };
      } else {
        throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      myLogger.error(`Error processing job: ${error.message}`, {
        stack: error.stack,
      });
      // rethrow so the job is marked as failed
      throw error;
    }
  },
  { connection: redisConnection }
);

uploadFileToCloudStorageWorker.on("completed", (job, result) => {
  myLogger.info(`Job #${job.id} completed! Result: ${JSON.stringify(result)}`);
});
uploadFileToCloudStorageWorker.on("failed", (job, err) => {
  myLogger.error(`Job #${job.id} failed with error: ${err.message}`, {
    stack: err.stack,
  });
});
uploadFileToCloudStorageWorker.on("error", (err) => {
  myLogger.error(`Worker error: ${err.message}`, { stack: err.stack });
});

// JOB XÓA FILE

const deleteFileProcessor = async (job) => {
  try {
    myLogger.info(
      `Starting Job #${job.id} of type ${job.name}, deleting file: ${job.data.fileUrl}`
    );

    if (job.name === "delete_file") {
      const fileUrl = job.data.fileUrl;
      if (!fileUrl || !fileUrl.startsWith("http")) {
        throw new Error(`Invalid or missing fileUrl: ${fileUrl}`);
      }

      // Lấy bucket name từ file env
      const bucketName = env.SUPABASE_BUCKET;
      if (!bucketName) {
        throw new Error("SUPABASE_BUCKET environment variable is not set.");
      }

      // Trích xuất filePath từ fileUrl
      // Ví dụ URL: https://<project>.supabase.co/storage/v1/object/public/<bucket_name>/products/image.jpg
      // Chúng ta cần trích xuất: 'products/image.jpg'
      const url = new URL(fileUrl);
      const pathPrefix = `/storage/v1/object/public/${bucketName}/`;

      if (!url.pathname.startsWith(pathPrefix)) {
        throw new Error(
          `File URL does not match expected Supabase structure for bucket ${bucketName}. URL: ${fileUrl}`
        );
      }

      // Lấy phần path sau tên bucket
      const filePath = url.pathname.substring(pathPrefix.length);

      if (!filePath) {
        throw new Error(`Could not extract file path from URL: ${fileUrl}`);
      }

      myLogger.info(
        `[Worker] Deleting from Supabase: Bucket='${bucketName}', Path='${filePath}'`
      );

      // Gọi Supabase API để xóa file
      // hàm .remove() của supabase nhận một mảng các file paths
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        // Ném lỗi nếu Supabase trả về lỗi
        throw new Error(`Supabase deletion failed: ${error.message}`);
      }

      myLogger.info(
        `File deleted successfully from Supabase: ${filePath}`,
        data
      );
      return { status: "Success", deletedPath: filePath };
    } else {
      throw new Error(`Unknown job type: ${job.name}`);
    }
  } catch (error) {
    myLogger.error(`Error processing delete job: ${error.message}`, {
      stack: error.stack,
    });
    // Ném lỗi ra ngoài để BullMQ biết job này failed và có thể retry
    throw error;
  }
};

/**
 * Khởi tạo Worker để lắng nghe queue xóa file
 */
const deleteFileWorker = new Worker(
  "delete-file-from-cloud-storage-queue",
  deleteFileProcessor,
  { connection: redisConnection }
);

deleteFileWorker.on("completed", (job, result) => {
  myLogger.info(
    `Delete Job #${job.id} completed! Result: ${JSON.stringify(result)}`
  );
});
deleteFileWorker.on("failed", (job, err) => {
  myLogger.error(`Delete Job #${job.id} failed with error: ${err.message}`, {
    stack: err.stack,
  });
});
deleteFileWorker.on("error", (err) => {
  myLogger.error(`Delete Worker error: ${err.message}`, { stack: err.stack });
});

myLogger.info("Worker is running...");

// --- Order Worker ---
const orderWorker = new Worker("orderQueue", orderProcessor, {
  connection: redisConnection,
});

orderWorker.on("completed", (job) => {
  myLogger.info(`Order Job #${job.id} completed!`);
});

orderWorker.on("failed", (job, err) => {
  myLogger.error(`Order Job #${job.id} failed with error: ${err.message}`, {
    stack: err.stack,
  });
});

myLogger.info("Order Worker started and listening to orderQueue...");
