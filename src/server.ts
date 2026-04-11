// ═══════════════════════════════════════════════════════════════
//  Server Entry Point
// ═══════════════════════════════════════════════════════════════
//
//  Bootstraps Express, Socket.io, middleware, and routes.
// ═══════════════════════════════════════════════════════════════

import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { initSocket } from "./lib/socket";
import { errorHandler } from "./middleware/errorHandler";
import tagRouter from "./routes/tag";

// ── App & HTTP Server ────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// ── Socket.io ────────────────────────────────────────────────

initSocket(server);

// ── Global Middleware ────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// ── Health Check ─────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── API Routes ───────────────────────────────────────────────

import authRouter from "./routes/auth";
import announcementsRouter from "./routes/announcements";
import eventsRouter from "./routes/events";

app.use("/api/auth", authRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/events", eventsRouter);
app.use("/api", tagRouter);

// ── Error Handler (must be last) ─────────────────────────────

app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? "4000", 10);

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🚀  PulseNode Platform                ║
  ║   Server  →  http://localhost:${PORT}          ║
  ║   Socket  →  ws://localhost:${PORT}            ║
  ║   Env     →  ${process.env.NODE_ENV ?? "development"}                  ║
  ╚══════════════════════════════════════════════╝
  `);
});

export { app, server };
