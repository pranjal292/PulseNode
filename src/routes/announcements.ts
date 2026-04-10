// ═══════════════════════════════════════════════════════════════
//  Announcements Router — /api/announcements
// ═══════════════════════════════════════════════════════════════

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { UserTag } from "../types/models";

const router = Router();

// ── Validation ───────────────────────────────────────────────

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  clubId: z.string().uuid().nullable().optional(),
  pinned: z.boolean().optional().default(false),
  targetYear: z.number().int().min(1).max(4).nullable().optional(),
});

// ═════════════════════════════════════════════════════════════
//  GET /api/announcements
// ═════════════════════════════════════════════════════════════

router.get("/", authenticate, async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { id: true, name: true } },
        club: { select: { id: true, name: true } },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    const formatted = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      pinned: a.pinned,
      clubId: a.clubId,
      clubName: a.club?.name ?? null,
      targetYear: a.targetYear ?? null,
      authorName: a.author.name,
      authorId: a.authorId,
      createdAt: a.createdAt.toISOString(),
    }));

    res.status(200).json({ success: true, announcements: formatted });
  } catch (err) {
    next(err);
  }
});

// ═════════════════════════════════════════════════════════════
//  POST /api/announcements
// ═════════════════════════════════════════════════════════════

router.post(
  "/",
  authenticate,
  authorize(UserTag.FACULTY, UserTag.PRESIDENT, UserTag.COORDINATOR),
  async (req, res, next) => {
    try {
      const parseResult = CreateAnnouncementSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const { title, body, clubId, pinned, targetYear } = parseResult.data;
      const user = req.user!;

      const announcement = await prisma.announcement.create({
        data: {
          title,
          body,
          pinned,
          authorId: user.id,
          clubId: clubId || null,
          targetYear: targetYear ?? null,
        },
        include: {
          author: { select: { id: true, name: true } },
          club: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({
        success: true,
        announcement: {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          pinned: announcement.pinned,
          clubId: announcement.clubId,
          clubName: announcement.club?.name ?? null,
          targetYear: announcement.targetYear ?? null,
          authorName: announcement.author.name,
          authorId: announcement.authorId,
          createdAt: announcement.createdAt.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
