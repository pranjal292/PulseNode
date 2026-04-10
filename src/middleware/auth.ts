// ═══════════════════════════════════════════════════════════════
//  Middleware — JWT Authentication
// ═══════════════════════════════════════════════════════════════
//
//  Extracts & verifies the Bearer token, then hydrates
//  `req.user` with the full User record from the database.
// ═══════════════════════════════════════════════════════════════

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { User } from "../types/models";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware */
      user?: User;
    }
  }
}

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Middleware: verifies the `Authorization: Bearer <token>` header,
 * looks up the user in PostgreSQL, and attaches it to `req.user`.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ── 1. Extract token ───────────────────────────────────
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Missing or malformed Authorization header",
      });
      return;
    }

    const token = header.slice(7); // strip "Bearer "

    // ── 2. Verify JWT ──────────────────────────────────────
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;

    // ── 3. Hydrate user from DB ────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { clubs: { select: { clubId: true } } },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User no longer exists",
      });
      return;
    }

    // ── 4. Attach to request ───────────────────────────────
    req.user = {
      id:        user.id,
      email:     user.email,
      name:      user.name,
      avatarUrl: user.avatarUrl,
      tag:       user.tag as User["tag"],
      clubIds:   user.clubs.map(cm => cm.clubId),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: "Token expired" });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: "Invalid token" });
      return;
    }
    next(err);
  }
}
