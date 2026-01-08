import { Queue } from "bullmq";
import { env } from "~/config/environment.js";

const redisConfig = {
  host: env.DEFAULT_REDIS_HOST || "localhost",
  port: env.DEFAULT_REDIS_PORT || 6379,
  password: env.DEFAULT_REDIS_PASSWORD,
};

export const orderQueue = new Queue("orderQueue", {
  connection: redisConfig,
});
