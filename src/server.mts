import http from "http";

import { Server as SocketServer } from "socket.io";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { ensureSeedAdmin } from "./services/auth.service.js";
import { initializeSocket } from "./lib/socket.js";
import { logger } from "./utils/logger.js";


const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

initializeSocket(io);

const port = Number(env.PORT);

const start = async () => {
  try {
    await ensureSeedAdmin();
    server.listen(port, () => {
      logger.info(`Server ready on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

void start();

