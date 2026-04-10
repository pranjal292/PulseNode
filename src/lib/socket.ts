// ═══════════════════════════════════════════════════════════════
//  Socket.io — Singleton + User-Room Helpers
// ═══════════════════════════════════════════════════════════════

import { Server as IOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

let io: IOServer | null = null;

/**
 * Initialize Socket.io on the given HTTP server.
 * Called once during server bootstrap.
 */
export function initSocket(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    },
  });

  // ── Auth handshake — join the user to a private room ─────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      // Attach userId to socket data for downstream use
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    // Every user auto-joins a private room keyed by their ID
    socket.join(`user:${userId}`);

    console.log(`[socket] connected: ${userId}  (sid: ${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${userId}`);
    });
  });

  return io;
}

/**
 * Retrieve the initialized Socket.io instance.
 * Throws if called before `initSocket()`.
 */
export function getIO(): IOServer {
  if (!io) throw new Error("Socket.io has not been initialized");
  return io;
}

/**
 * Emit a typed event to a specific user's private room.
 */
export function emitToUser(
  userId: string,
  event: string,
  payload: Record<string, unknown>
): void {
  getIO().to(`user:${userId}`).emit(event, payload);
}
