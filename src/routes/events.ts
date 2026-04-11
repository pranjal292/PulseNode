// ═══════════════════════════════════════════════════════════════
//  Events Router — /api/events
// ═══════════════════════════════════════════════════════════════

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { UserTag } from "../types/models";

const router = Router();

// ── Validation ───────────────────────────────────────────────

const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  date: z.string(), // ISO string date
  startTime: z.string(), // "HH:MM"
  endTime: z.string().optional(), // "HH:MM"
  location: z.string().min(1).max(200),
  clubId: z.string().uuid().nullable().optional(),
});

// Helper to convert "HH:MM" or similar formats into Prisma-compliant UTC Time formats
function timeToDateTime(timeString: string, baseDateStr: string): string {
  // If it's already an ISO string mapping, return it directly.
  // Otherwise, construct a valid ISO string. Keep it simplistic.
  const base = new Date(baseDateStr);
  const [hours, minutes] = timeString.split(":").map(Number);
  base.setUTCHours(hours, minutes, 0, 0); 
  return base.toISOString();
}

// ═════════════════════════════════════════════════════════════
//  GET /api/events
//  Fetch all upcoming events 
// ═════════════════════════════════════════════════════════════

router.get("/", authenticate, async (req: any, res) => {
  try {
    const userRole = req.user.tag;

    // We can fetch events from today onwards
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true, tag: true } },
        club: { select: { id: true, name: true } },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
      take: 50,
    });

    res.json({ success: true, events });
  } catch (error) {
    console.error("[GET /events]", error);
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
});

// ═════════════════════════════════════════════════════════════
//  POST /api/events
//  Create a new Event. Requires COORDINATOR, PRESIDENT, or FACULTY
// ═════════════════════════════════════════════════════════════

router.post(
  "/",
  authenticate,
  authorize(UserTag.COORDINATOR, UserTag.PRESIDENT, UserTag.FACULTY),
  async (req: any, res) => {
    try {
      const parsed = CreateEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      }

      const { title, description, date, startTime, endTime, location, clubId } = parsed.data;

      const eventDate = new Date(date);
      const startDateTime = timeToDateTime(startTime, date);
      const endDateTime = endTime && endTime.trim().length > 0 ? timeToDateTime(endTime, date) : undefined;

      const newEvent = await prisma.event.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          startTime: startDateTime,
          endTime: endDateTime,
          location,
          organizerId: req.user.id,
          clubId: clubId || null,
        },
        include: {
          organizer: { select: { id: true, name: true, avatarUrl: true, tag: true } },
          club: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({ success: true, event: newEvent });
    } catch (error) {
      console.error("[POST /events]", error);
      res.status(500).json({ success: false, error: "Failed to create event" });
    }
  }
);

export default router;
