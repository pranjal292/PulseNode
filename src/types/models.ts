// ═══════════════════════════════════════════════════════════════
//  Community Platform — TypeScript Domain Types
// ═══════════════════════════════════════════════════════════════

// ── Enums ────────────────────────────────────────────────────

export enum UserTag {
  FACULTY     = "FACULTY",
  PRESIDENT   = "PRESIDENT",
  COORDINATOR = "COORDINATOR",
  CLUB_MEMBER = "CLUB_MEMBER",
  STUDENT     = "STUDENT",
}

export enum AvailabilityState {
  AVAILABLE   = "AVAILABLE",
  CHECKED_OUT = "CHECKED_OUT",
  RESERVED    = "RESERVED",
  ARCHIVED    = "ARCHIVED",
}

// ── Core Interfaces ──────────────────────────────────────────

export interface User {
  id:        string;
  email:     string;
  name:      string;
  avatarUrl: string | null;
  tag:       UserTag;
  clubIds:   string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Club {
  id:          string;
  name:        string;
  description: string | null;
  logoUrl:     string | null;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface ClubMembership {
  id:       string;
  userId:   string;
  clubId:   string;
  role:     string;          // "president" | "coordinator" | "member"
  joinedAt: Date;
}

export interface Announcement {
  id:        string;
  title:     string;
  body:      string;
  pinned:    boolean;
  authorId:  string;
  clubId:    string | null;  // null → global announcement
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id:          string;
  title:       string;
  description: string | null;
  date:        string;       // ISO date  (YYYY-MM-DD)
  startTime:   string;       // ISO time  (HH:mm:ss)
  endTime:     string | null;
  location:    string;
  organizerId: string;
  clubId:      string | null;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface Resource {
  id:                string;
  title:             string;
  description:       string | null;
  fileUrl:           string | null;
  availabilityState: AvailabilityState;
  ownerId:           string;
  clubId:            string | null;
  createdAt:         Date;
  updatedAt:         Date;
}

export interface AuditLog {
  id:        string;
  adminId:   string;         // who changed the tag
  targetId:  string;         // whose tag was changed
  oldTag:    UserTag;
  newTag:    UserTag;
  reason:    string | null;
  createdAt: Date;
}

// ── Populated / Join Types ───────────────────────────────────

/** User with their club memberships eagerly loaded */
export interface UserWithClubs extends User {
  memberships: (ClubMembership & { club: Club })[];
}

/** Announcement with author info resolved */
export interface AnnouncementWithAuthor extends Announcement {
  author: Pick<User, "id" | "name" | "avatarUrl">;
}

/** Event with organizer info resolved */
export interface EventWithOrganizer extends Event {
  organizer: Pick<User, "id" | "name" | "avatarUrl">;
}
