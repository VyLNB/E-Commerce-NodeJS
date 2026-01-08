import { Queue } from "bullmq";
import { env } from "~/config/environment.js";

const redisConnection = {
  host: env.DEFAULT_REDIS_HOST,
  port: env.DEFAULT_REDIS_PORT,
  password: env.DEFAULT_REDIS_PASSWORD,
};

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});

export const uploadFileToCloudStorageQueue = new Queue(
  "upload-file-to-cloud-storage-queue",
  { connection: redisConnection }
);

export const deleteFileFromCloudStorageQueue = new Queue(
  "delete-file-from-cloud-storage-queue",
  { connection: redisConnection }
);
