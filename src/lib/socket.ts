import type { Server as SocketIOServer, Socket } from "socket.io";

// FIX 1: Path alias to relative path + .js
import { createChatMessage, getRecentMessages, isUserAssignedToProject } from "../services/chat.service.js"; 
// FIX 2: Path alias to relative path + .js
import { verifyJwt } from "../utils/jwt.js"; 
// FIX 3: Path alias to relative path + .js
import { logger } from "../utils/logger.js"; 

type SocketUser = {
  id: string;
  role: string;
  email: string;
  fullName: string;
};

const getToken = (socket: Socket): string | undefined => {
  if (typeof socket.handshake.auth?.token === "string") {
    return socket.handshake.auth.token;
  }
  if (typeof socket.handshake.query?.token === "string") {
    return socket.handshake.query.token as string;
  }
  if (Array.isArray(socket.handshake.query?.token)) {
    return socket.handshake.query.token[0] as string;
  }
  return undefined;
};

export const initializeSocket = (io: SocketIOServer) => {
  io.use((socket, next) => {
    try {
      const token = getToken(socket);
      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const payload = verifyJwt(token);
      socket.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        fullName: payload.fullName
      } satisfies SocketUser;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser | undefined;
    logger.info("Socket connected", { socketId: socket.id, userId: user?.id });

    socket.on("joinProject", async ({ projectId }: { projectId: string }, callback) => {
      if (!user) {
        return callback?.({ error: "Unauthenticated" });
      }

      const allowed = await isUserAssignedToProject(projectId, user.id);
      if (!allowed) {
        return callback?.({ error: "Access denied" });
      }

      await socket.join(`project:${projectId}`);
      const history = await getRecentMessages(projectId, 50);
      callback?.({ ok: true, history });
    });

    socket.on("chat:message", async ({ projectId, content }: { projectId: string; content: string }, callback) => {
      if (!user) {
        return callback?.({ error: "Unauthenticated" });
      }

      if (!content?.trim()) {
        return callback?.({ error: "Message cannot be empty" });
      }

      const allowed = await isUserAssignedToProject(projectId, user.id);
      if (!allowed) {
        return callback?.({ error: "Access denied" });
      }

      const message = await createChatMessage(projectId, user.id, content.trim());
      io.to(`project:${projectId}`).emit("chat:message", {
        id: message.id,
        projectId,
        content: message.content,
        createdAt: message.createdAt,
        sender: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });

      callback?.({ ok: true });
    });

    socket.on("chat:typing", ({ projectId, isTyping }: { projectId: string; isTyping: boolean }) => {
      if (!user) return;
      socket.to(`project:${projectId}`).emit("chat:typing", {
        projectId,
        userId: user.id,
        fullName: user.fullName,
        isTyping
      });
    });

    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", { socketId: socket.id, reason });
    });
  });
};