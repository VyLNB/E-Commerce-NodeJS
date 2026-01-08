import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import {
  emailQueue,
  uploadFileToCloudStorageQueue,
} from "~/providers/jobQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(uploadFileToCloudStorageQueue),
  ],
  serverAdapter: serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter();
