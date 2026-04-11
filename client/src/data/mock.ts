// ═══════════════════════════════════════════════════════════════
//  Mock Data — Seeded users, clubs, announcements, events
// ═══════════════════════════════════════════════════════════════

import { UserTag } from "../types";
import type { User, Club, Announcement, Event, Resource } from "../types";

// ── Users ────────────────────────────────────────────────────

export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "u1",
    name: "Dr. Ananya Sharma",
    email: "faculty@pulsenode.edu",
    password: "faculty123",
    avatarUrl: null,
    tag: UserTag.FACULTY,
    clubIds: [],
  },
  {
    id: "u2",
    name: "Rahul Verma",
    email: "president@pulsenode.edu",
    password: "president123",
    avatarUrl: null,
    tag: UserTag.PRESIDENT,
    clubIds: ["c1", "c2"],
  },
  {
    id: "u3",
    name: "Priya Patel",
    email: "coordinator@pulsenode.edu",
    password: "coordinator123",
    avatarUrl: null,
    tag: UserTag.COORDINATOR,
    clubIds: ["c1"],
  },
  {
    id: "u4",
    name: "Arjun Reddy",
    email: "member@pulsenode.edu",
    password: "member123",
    avatarUrl: null,
    tag: UserTag.CLUB_MEMBER,
    clubIds: ["c1", "c3"],
  },
  {
    id: "u5",
    name: "Sneha Gupta",
    email: "student@pulsenode.edu",
    password: "student123",
    avatarUrl: null,
    tag: UserTag.STUDENT,
    clubIds: [],
  },
];

// ── Clubs ────────────────────────────────────────────────────

export const MOCK_CLUBS: Club[] = [
  {
    id: "c1",
    name: "Robotics Club",
    description:
      "Design, build, and compete with autonomous robots. Weekly builds every Saturday.",
    logoEmoji: "🤖",
    memberCount: 42,
    color: "#818cf8",
  },
  {
    id: "c2",
    name: "Debate Society",
    description:
      "Sharpen your public speaking and critical thinking. Tournaments every month.",
    logoEmoji: "🎤",
    memberCount: 35,
    color: "#f472b6",
  },
  {
    id: "c3",
    name: "Photography Club",
    description:
      "Capture the world through your lens. Photo walks, editing workshops, and exhibitions.",
    logoEmoji: "📸",
    memberCount: 58,
    color: "#34d399",
  },
  {
    id: "c4",
    name: "Coding Club",
    description:
      "Competitive programming, hackathons, and open-source. Code together, grow together.",
    logoEmoji: "💻",
    memberCount: 67,
    color: "#fb923c",
  },
  {
    id: "c5",
    name: "Music Society",
    description:
      "From classical to contemporary — jam sessions, open mics, and live performances.",
    logoEmoji: "🎵",
    memberCount: 29,
    color: "#a78bfa",
  },
];

// ── Announcements ────────────────────────────────────────────

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Mid-Semester Exam Schedule Released",
    body: "The mid-semester examination schedule for all departments has been published. Please check the academic portal for your individual timetable. Exams begin April 21st.",
    authorName: "Dr. Ananya Sharma",
    authorTag: UserTag.FACULTY,
    clubId: null,
    clubName: null,
    pinned: true,
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "a2",
    title: "Annual Tech Fest — Registrations Open",
    body: "TechNova 2026 is here! Register your teams for hackathons, robotics challenges, and coding competitions. Early bird deadline: April 15th.",
    authorName: "Rahul Verma",
    authorTag: UserTag.PRESIDENT,
    clubId: null,
    clubName: null,
    pinned: true,
    createdAt: "2026-04-09T14:30:00Z",
  },
  {
    id: "a3",
    title: "Robotics Club — Component Restock",
    body: "New Arduino kits and servo motors have arrived in the lab. Members can collect their allocated kits from Room 204 during club hours.",
    authorName: "Priya Patel",
    authorTag: UserTag.COORDINATOR,
    clubId: "c1",
    clubName: "Robotics Club",
    pinned: false,
    createdAt: "2026-04-08T09:15:00Z",
  },
  {
    id: "a4",
    title: "Library Hours Extended",
    body: "Starting next week, the central library will remain open until 11 PM on weekdays to support exam preparation. Weekend hours remain unchanged.",
    authorName: "Dr. Ananya Sharma",
    authorTag: UserTag.FACULTY,
    clubId: null,
    clubName: null,
    pinned: false,
    createdAt: "2026-04-07T16:00:00Z",
  },
  {
    id: "a5",
    title: "Photography Exhibition — Submit Your Work",
    body: "The annual photography exhibition theme is 'Urban Solitude'. Submit your best 3 shots by April 18th to the club coordinator.",
    authorName: "Priya Patel",
    authorTag: UserTag.COORDINATOR,
    clubId: "c3",
    clubName: "Photography Club",
    pinned: false,
    createdAt: "2026-04-06T11:00:00Z",
  },
];

// ── Events ───────────────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    title: "TechNova 2026 — Hackathon",
    description:
      "36-hour hackathon open to all students. Build something amazing with your team. Prizes worth ₹2,00,000.",
    date: "2026-04-25",
    startTime: "09:00",
    endTime: "21:00",
    location: "Main Auditorium & CS Labs",
    organizerName: "Rahul Verma",
    clubId: null,
    clubName: null,
    createdAt: "2026-04-09T14:30:00Z",
  },
  {
    id: "e2",
    title: "Robotics Workshop — Line Follower",
    description:
      "Hands-on workshop to build a line-following robot from scratch. All components provided.",
    date: "2026-04-18",
    startTime: "14:00",
    endTime: "17:00",
    location: "Robotics Lab, Room 204",
    organizerName: "Priya Patel",
    clubId: "c1",
    clubName: "Robotics Club",
    createdAt: "2026-04-08T09:00:00Z",
  },
  {
    id: "e3",
    title: "Inter-College Debate Championship",
    description:
      "Annual inter-college debate tournament. Teams of 3. Topic will be revealed 1 hour before the event.",
    date: "2026-04-20",
    startTime: "10:00",
    endTime: "16:00",
    location: "Seminar Hall B",
    organizerName: "Rahul Verma",
    clubId: "c2",
    clubName: "Debate Society",
    createdAt: "2026-04-07T12:00:00Z",
  },
  {
    id: "e4",
    title: "Open Mic Night",
    description:
      "Sing, rap, or perform spoken word. Everyone is welcome. Sign up at the Music Society booth.",
    date: "2026-04-16",
    startTime: "18:00",
    endTime: "21:00",
    location: "Open Air Theatre",
    organizerName: "Rahul Verma",
    clubId: "c5",
    clubName: "Music Society",
    createdAt: "2026-04-06T15:00:00Z",
  },
];

// ── Resources ────────────────────────────────────────────────

export const MOCK_RESOURCES: Resource[] = [
  {
    id: "r1",
    title: "Arduino Starter Guide",
    description: "Complete beginner's guide to Arduino programming with circuit diagrams.",
    fileUrl: "#",
    clubId: "c1",
    clubName: "Robotics Club",
    ownerName: "Priya Patel",
    createdAt: "2026-04-05T10:00:00Z",
  },
  {
    id: "r2",
    title: "Debate Motion Bank 2026",
    description: "Collection of 200+ debate motions categorized by topic and difficulty.",
    fileUrl: "#",
    clubId: "c2",
    clubName: "Debate Society",
    ownerName: "Rahul Verma",
    createdAt: "2026-04-04T14:00:00Z",
  },
  {
    id: "r3",
    title: "Lightroom Presets — Urban Pack",
    description: "12 custom Lightroom presets for urban and street photography editing.",
    fileUrl: "#",
    clubId: "c3",
    clubName: "Photography Club",
    ownerName: "Priya Patel",
    createdAt: "2026-04-03T09:00:00Z",
  },
  {
    id: "r4",
    title: "DSA Cheat Sheet",
    description: "Quick reference for common data structures and algorithms with time complexities.",
    fileUrl: "#",
    clubId: "c4",
    clubName: "Coding Club",
    ownerName: "Rahul Verma",
    createdAt: "2026-04-02T11:00:00Z",
  },
];
