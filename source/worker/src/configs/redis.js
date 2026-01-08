import { Redis } from "ioredis";
import { env } from "./environment.js";
import { myLogger } from "../loggers/myLogger.js";

export const redisConnection = new Redis({
  host: env.DEFAULT_REDIS_HOST || "localhost",
  port: env.DEFAULT_REDIS_PORT || 6379,
  password: env.DEFAULT_REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required by BullMQ
});

export const redisPublisher = new Redis({
  host: env.DEFAULT_REDIS_HOST || "localhost",
  port: env.DEFAULT_REDIS_PORT || 6379,
  password: env.DEFAULT_REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  myLogger.info("Redis client (worker) connected");
});
redisConnection.on("error", (err) => {
  myLogger.error("Redis Client (worker) Error", err);
});

redisPublisher.on("connect", () => {
  myLogger.info("Redis Publisher connected");
});
redisPublisher.on("error", (err) => {
  myLogger.error("Redis Publisher Error", err);
});
