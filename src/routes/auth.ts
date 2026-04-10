// ═══════════════════════════════════════════════════════════════
//  Auth Router — /api/auth
// ═══════════════════════════════════════════════════════════════

import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { UserTag } from "@prisma/client";
import { authenticate } from "../middleware/auth";

const router = Router();

// ── Validation Schemas ───────────────────────────────────────

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// ── Helpers ──────────────────────────────────────────────────

function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

function parseEmailToTag(email: string): UserTag | null {
  const normalized = email.toLowerCase().trim();

  if (/^20\d{2}ku(cp|ec|ad)\d{4}@iiitkota\.ac\.in$/.test(normalized)) {
    return UserTag.STUDENT;
  }
  if (/^[a-z0-9_.-]+\.(cse|ece|aide|hmas)@iiitkota\.ac\.in$/.test(normalized)) {
    return UserTag.FACULTY;
  }
  if (/^(cacs|techknow|sports)@iiitkota\.ac\.in$/.test(normalized)) {
    return UserTag.PRESIDENT;
  }
  if (/^[a-z0-9_.-]+\.iiitkota@g(a?)mail\.com$/.test(normalized)) {
    return UserTag.COORDINATOR;
  }

  return null;
}

// ── Routes ───────────────────────────────────────────────────

// POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const data = SignupSchema.parse(req.body);

    // 1. Verify email format strictly
    const assignedTag = parseEmailToTag(data.email);
    if (!assignedTag) {
      res.status(400).json({
        success: false,
        error: "Invalid email format. Please use your official IIIT Kota email or club coordinator email.",
      });
      return;
    }

    // 2. Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      res.status(409).json({ success: false, error: "Email already exists" });
      return;
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        tag: assignedTag,
      },
      select: {
        id: true,
        name: true,
        email: true,
        tag: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ success: true, user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { clubs: { select: { clubId: true } } },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    // Strip password from response and map memberships
    const { password, clubs, ...rest } = user;
    const safeUser = { ...rest, clubIds: clubs.map(cm => cm.clubId) };

    const token = generateToken(user.id);
    res.status(200).json({ success: true, user: safeUser, token });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  // authenticate middleware populated req.user
  res.status(200).json({ success: true, user: req.user });
});

export default router;
