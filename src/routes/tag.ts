// ═══════════════════════════════════════════════════════════════
//  Route — POST /api/update-tag
// ═══════════════════════════════════════════════════════════════
//
//  Allows PRESIDENT or COORDINATOR to change another user's tag.
//
//  Flow:
//    1. Validate request body (Zod)
//    2. Verify the requester has authority (middleware)
//    3. Block privilege escalation
//    4. Update the target user's tag
//    5. Create an AuditLog entry
//    6. Emit a real-time Socket.io notification
// ═══════════════════════════════════════════════════════════════

import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { emitToUser } from "../lib/socket";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { UserTag } from "../types/models";

const router = Router();

// ── Request Validation Schema ────────────────────────────────

const UpdateTagSchema = z.object({
  targetUserId: z.string().uuid("targetUserId must be a valid UUID"),
  newTag: z.nativeEnum(UserTag, {
    errorMap: () => ({
      message: `newTag must be one of: ${Object.values(UserTag).join(", ")}`,
    }),
  }),
  reason: z.string().max(500).optional(),
  clubIds: z.array(z.string().uuid()).optional(),
});

// ── Tag Hierarchy (higher number = more privilege) ───────────

const TAG_RANK: Record<UserTag, number> = {
  [UserTag.STUDENT]:     0,
  [UserTag.CLUB_MEMBER]: 1,
  [UserTag.COORDINATOR]: 2,
  [UserTag.PRESIDENT]:   3,
  [UserTag.FACULTY]:     4,
};

// ═════════════════════════════════════════════════════════════
//  GET /api/clubs
// ═════════════════════════════════════════════════════════════

router.get("/clubs", authenticate, async (req, res, next) => {
  try {
    const clubs = await prisma.club.findMany({
      select: { 
        id: true, 
        name: true, 
        description: true,
        _count: {
          select: { members: true }
        },
        members: {
          select: {
            user: { select: { id: true, name: true, email: true, tag: true } },
            role: true
          }
        }
      },
      orderBy: { name: "asc" },
    });
    
    // Map _count.members to memberCount and memberships array
    const formattedClubs = clubs.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      memberCount: c._count.members,
      memberships: c.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        tag: m.user.tag,
        role: m.role
      }))
    }));

    res.status(200).json({ success: true, clubs: formattedClubs });
  } catch (err) {
    next(err);
  }
});

// ═════════════════════════════════════════════════════════════
//  GET /api/users
// ═════════════════════════════════════════════════════════════

router.get("/users", authenticate, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        tag: true,
        avatarUrl: true,
      },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// ═════════════════════════════════════════════════════════════
//  POST /api/update-tag
// ═════════════════════════════════════════════════════════════

router.post(
  "/update-tag",
  authenticate,
  authorize(UserTag.PRESIDENT, UserTag.COORDINATOR),
  async (req, res, next) => {
    try {
      // ── 1. Parse & validate body ──────────────────────────
      const parseResult = UpdateTagSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const { targetUserId, newTag, reason, clubIds } = parseResult.data;
      const admin = req.user!;

      // ── 2. Prevent self-modification ──────────────────────
      if (targetUserId === admin.id) {
        res.status(403).json({
          success: false,
          error: "You cannot modify your own tag",
        });
        return;
      }

      // ── 3. Look up target user ────────────────────────────
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: "Target user not found",
        });
        return;
      }

      // ── 4. Block privilege escalation ─────────────────────
      //   a) Cannot assign a tag equal to or above your own
      //   b) Cannot demote someone at or above your rank
      const adminRank  = TAG_RANK[admin.tag];
      const targetRank = TAG_RANK[targetUser.tag as UserTag];
      const newRank    = TAG_RANK[newTag];

      if (newRank >= adminRank) {
        res.status(403).json({
          success: false,
          error: `Cannot assign tag '${newTag}' — it is at or above your privilege level (${admin.tag})`,
        });
        return;
      }

      if (targetRank >= adminRank) {
        res.status(403).json({
          success: false,
          error: `Cannot modify a user with tag '${targetUser.tag}' — they are at or above your privilege level`,
        });
        return;
      }

      // ── 5. No-op guard ────────────────────────────────────
      if (targetUser.tag === newTag) {
        res.status(200).json({
          success: true,
          message: "No change — user already has this tag",
        });
        return;
      }

      // ── 6. Atomic transaction: update user, memberships, audit ─
      
      const transactionOperations: any[] = [
        prisma.user.update({
          where: { id: targetUserId },
          data: { tag: newTag },
        })
      ];

      // If transitioning to CLUB_MEMBER, assign specific requested clubs
      if (newTag === UserTag.CLUB_MEMBER && clubIds && clubIds.length > 0) {
        transactionOperations.push(
          prisma.clubMembership.deleteMany({ where: { userId: targetUserId } })
        );
        transactionOperations.push(
          prisma.clubMembership.createMany({
            data: clubIds.map(clubId => ({
              id: crypto.randomUUID(),
              userId: targetUserId,
              clubId: clubId,
              role: "member",
            })),
          })
        );
      } else if (newTag === UserTag.STUDENT) {
        // If demoted to student, revoke all memberships
        transactionOperations.push(
          prisma.clubMembership.deleteMany({ where: { userId: targetUserId } })
        );
      }

      transactionOperations.push(
        prisma.auditLog.create({
          data: {
            id:       crypto.randomUUID(),
            adminId:  admin.id,
            targetId: targetUserId,
            oldTag:   targetUser.tag as UserTag,
            newTag:   newTag,
            reason:   reason ?? null,
          },
        })
      );

      const txResults = await prisma.$transaction(transactionOperations);
      
      const updatedUser = txResults[0];
      const auditEntry = txResults[txResults.length - 1];

      // ── 7. Real-time notification via Socket.io ───────────
      emitToUser(targetUserId, "tag:updated", {
        message: `Your role has been changed from ${targetUser.tag} to ${newTag}`,
        oldTag:    targetUser.tag,
        newTag:    newTag,
        changedBy: {
          id:   admin.id,
          name: admin.name,
        },
        reason:    reason ?? null,
        timestamp: auditEntry.createdAt,
      });

      // ── 8. Respond ────────────────────────────────────────
      res.status(200).json({
        success: true,
        data: {
          user: {
            id:    updatedUser.id,
            name:  updatedUser.name,
            email: updatedUser.email,
            tag:   updatedUser.tag,
          },
          audit: {
            id:        auditEntry.id,
            oldTag:    auditEntry.oldTag,
            newTag:    auditEntry.newTag,
            reason:    auditEntry.reason,
            createdAt: auditEntry.createdAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
