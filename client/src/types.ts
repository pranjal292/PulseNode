// ═══════════════════════════════════════════════════════════════
//  Shared Types — College Community Platform
// ═══════════════════════════════════════════════════════════════

export const UserTag = {
  FACULTY: "FACULTY",
  PRESIDENT: "PRESIDENT",
  COORDINATOR: "COORDINATOR",
  CLUB_MEMBER: "CLUB_MEMBER",
  STUDENT: "STUDENT",
} as const;

export type UserTag = (typeof UserTag)[keyof typeof UserTag];

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  tag: UserTag;
  clubIds: string[];
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logoEmoji: string;
  memberCount: number;
  color: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorTag: UserTag;
  clubId: string | null;
  clubName: string | null;
  pinned: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string | null;
  location: string;
  organizerName: string;
  clubId: string | null;
  clubName: string | null;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string | null;
  clubId: string;
  clubName: string;
  ownerName: string;
  createdAt: string;
}
