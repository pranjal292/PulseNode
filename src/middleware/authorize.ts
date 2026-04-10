// ═══════════════════════════════════════════════════════════════
//  Middleware — Role-Based Access Control (RBAC)
// ═══════════════════════════════════════════════════════════════
//
//  Usage:
//    router.post("/updates", authorize("FACULTY", "PRESIDENT"), handler);
//
//  The `authorize` function is a higher-order middleware factory.
//  It closes over the list of allowed UserTags and returns an
//  Express middleware that checks `req.user.tag`.
// ═══════════════════════════════════════════════════════════════

import type { Request, Response, NextFunction } from "express";
import { UserTag } from "../types/models";

/**
 * Creates an Express middleware that permits only users whose
 * `tag` is included in `allowedTags`.
 *
 * Must be placed AFTER the `authenticate` middleware so that
 * `req.user` is guaranteed to exist.
 *
 * @param allowedTags - One or more UserTag values that are
 *                      permitted to access the route.
 *
 * @example
 *   // Only PRESIDENT and COORDINATOR may hit this route
 *   router.post(
 *     "/update-tag",
 *     authenticate,
 *     authorize(UserTag.PRESIDENT, UserTag.COORDINATOR),
 *     updateTagHandler,
 *   );
 */
export function authorize(...allowedTags: UserTag[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // ── Guard: authenticate must run first ──────────────────
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required before authorization",
      });
      return;
    }

    // ── Check tag ───────────────────────────────────────────
    if (!allowedTags.includes(req.user.tag)) {
      res.status(403).json({
        success: false,
        error: `Forbidden — requires one of: ${allowedTags.join(", ")}`,
        yourTag: req.user.tag,
      });
      return;
    }

    next();
  };
}
