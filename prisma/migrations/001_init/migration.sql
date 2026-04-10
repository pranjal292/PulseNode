-- ═══════════════════════════════════════════════════════════════
--  001_init  —  Community Platform Schema + Row Level Security
--  Engine  : PostgreSQL 15+
--  Author  : auto-generated from Prisma schema
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";          -- gen_random_uuid()

-- ── Custom Enums ─────────────────────────────────────────────

CREATE TYPE user_tag AS ENUM (
  'FACULTY',
  'PRESIDENT',
  'COORDINATOR',
  'CLUB_MEMBER',
  'STUDENT'
);

CREATE TYPE availability_state AS ENUM (
  'AVAILABLE',
  'CHECKED_OUT',
  'RESERVED',
  'ARCHIVED'
);

-- ═════════════════════════════════════════════════════════════
--  TABLES
-- ═════════════════════════════════════════════════════════════

-- ── users ────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  tag         user_tag NOT NULL DEFAULT 'STUDENT',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tag ON users (tag);

-- ── clubs ────────────────────────────────────────────────────
CREATE TABLE clubs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── club_memberships  (User ↔ Club many-to-many) ────────────
CREATE TABLE club_memberships (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id   UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, club_id)
);

CREATE INDEX idx_cm_user  ON club_memberships (user_id);
CREATE INDEX idx_cm_club  ON club_memberships (club_id);

-- ── announcements ────────────────────────────────────────────
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  pinned      BOOLEAN NOT NULL DEFAULT false,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id     UUID REFERENCES clubs(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ann_club   ON announcements (club_id);
CREATE INDEX idx_ann_author ON announcements (author_id);

-- ── events ───────────────────────────────────────────────────
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME,
  location      TEXT NOT NULL,
  organizer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id       UUID REFERENCES clubs(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evt_date ON events (date);
CREATE INDEX idx_evt_club ON events (club_id);

-- ── resources ────────────────────────────────────────────────
CREATE TABLE resources (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,
  file_url            TEXT,
  availability_state  availability_state NOT NULL DEFAULT 'AVAILABLE',
  owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id             UUID REFERENCES clubs(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_res_club  ON resources (club_id);
CREATE INDEX idx_res_owner ON resources (owner_id);

-- ── audit_logs ───────────────────────────────────────────────
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_tag    user_tag NOT NULL,
  new_tag    user_tag NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_target ON audit_logs (target_id);
CREATE INDEX idx_audit_admin  ON audit_logs (admin_id);


-- ═════════════════════════════════════════════════════════════
--  TRIGGERS  —  auto-update `updated_at`
-- ═════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clubs_updated_at
  BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ═════════════════════════════════════════════════════════════
--  AUDIT LOG TRIGGER  —  auto-log tag changes on `users`
-- ═════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_tag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tag IS DISTINCT FROM NEW.tag THEN
    INSERT INTO audit_logs (admin_id, target_id, old_tag, new_tag)
    VALUES (
      -- current_setting is set by the app layer before UPDATE
      COALESCE(
        NULLIF(current_setting('app.current_user_id', true), ''),
        NEW.id::text              -- fallback: self-change
      )::uuid,
      NEW.id,
      OLD.tag,
      NEW.tag
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_tag_audit
  AFTER UPDATE OF tag ON users
  FOR EACH ROW EXECUTE FUNCTION log_tag_change();


-- ═════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS) POLICIES
-- ═════════════════════════════════════════════════════════════
--
--  Convention: the application sets a session variable before
--  every query:
--
--    SET LOCAL app.current_user_id = '<uuid>';
--
--  The helper below resolves the caller's tag.
-- ═════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION current_user_tag()
RETURNS user_tag AS $$
  SELECT tag FROM users
  WHERE id = current_setting('app.current_user_id', true)::uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS UUID AS $$
  SELECT current_setting('app.current_user_id', true)::uuid;
$$ LANGUAGE sql STABLE;

-- ── Enable RLS ───────────────────────────────────────────────

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources     ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (important for Supabase-style setups)
ALTER TABLE announcements FORCE ROW LEVEL SECURITY;
ALTER TABLE events        FORCE ROW LEVEL SECURITY;
ALTER TABLE resources     FORCE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
--  ANNOUNCEMENTS policies
-- ─────────────────────────────────────────────────────────────

-- 1) Faculty & Presidents can INSERT announcements
CREATE POLICY announcements_insert_policy
  ON announcements FOR INSERT
  WITH CHECK (
    current_user_tag() IN ('FACULTY', 'PRESIDENT')
  );

-- 2) Everyone (including Students) can SELECT announcements
--    Global announcements (club_id IS NULL) → visible to all
--    Club-scoped announcements → visible to club members + FACULTY/PRESIDENT
CREATE POLICY announcements_select_policy
  ON announcements FOR SELECT
  USING (
    club_id IS NULL                                -- global announcement
    OR current_user_tag() IN ('FACULTY', 'PRESIDENT')  -- admins see all
    OR EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = announcements.club_id
        AND cm.user_id = current_app_user_id()
    )
  );

-- 3) Authors (Faculty/President) can UPDATE their own announcements
CREATE POLICY announcements_update_policy
  ON announcements FOR UPDATE
  USING (
    author_id = current_app_user_id()
    AND current_user_tag() IN ('FACULTY', 'PRESIDENT')
  )
  WITH CHECK (
    author_id = current_app_user_id()
  );

-- 4) Authors can DELETE their own announcements
CREATE POLICY announcements_delete_policy
  ON announcements FOR DELETE
  USING (
    author_id = current_app_user_id()
    AND current_user_tag() IN ('FACULTY', 'PRESIDENT')
  );


-- ─────────────────────────────────────────────────────────────
--  EVENTS policies  (mirror announcements logic)
-- ─────────────────────────────────────────────────────────────

CREATE POLICY events_insert_policy
  ON events FOR INSERT
  WITH CHECK (
    current_user_tag() IN ('FACULTY', 'PRESIDENT', 'COORDINATOR')
  );

CREATE POLICY events_select_policy
  ON events FOR SELECT
  USING (
    club_id IS NULL
    OR current_user_tag() IN ('FACULTY', 'PRESIDENT')
    OR EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = events.club_id
        AND cm.user_id = current_app_user_id()
    )
  );

CREATE POLICY events_update_policy
  ON events FOR UPDATE
  USING (
    organizer_id = current_app_user_id()
    AND current_user_tag() IN ('FACULTY', 'PRESIDENT', 'COORDINATOR')
  );

CREATE POLICY events_delete_policy
  ON events FOR DELETE
  USING (
    organizer_id = current_app_user_id()
    AND current_user_tag() IN ('FACULTY', 'PRESIDENT', 'COORDINATOR')
  );


-- ─────────────────────────────────────────────────────────────
--  RESOURCES policies
-- ─────────────────────────────────────────────────────────────

-- Club members can SELECT resources linked to their club
CREATE POLICY resources_select_policy
  ON resources FOR SELECT
  USING (
    club_id IS NULL                                     -- public resource
    OR current_user_tag() IN ('FACULTY', 'PRESIDENT')   -- admins see all
    OR owner_id = current_app_user_id()                 -- owner sees own
    OR EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = resources.club_id
        AND cm.user_id = current_app_user_id()
    )
  );

-- Faculty, Presidents, Coordinators can INSERT resources
CREATE POLICY resources_insert_policy
  ON resources FOR INSERT
  WITH CHECK (
    current_user_tag() IN ('FACULTY', 'PRESIDENT', 'COORDINATOR')
  );

-- Owners can UPDATE their own resources
CREATE POLICY resources_update_policy
  ON resources FOR UPDATE
  USING (
    owner_id = current_app_user_id()
  );

-- Owners + admins can DELETE resources
CREATE POLICY resources_delete_policy
  ON resources FOR DELETE
  USING (
    owner_id = current_app_user_id()
    OR current_user_tag() IN ('FACULTY', 'PRESIDENT')
  );


-- ═════════════════════════════════════════════════════════════
--  SEED DATA  (optional — remove in production)
-- ═════════════════════════════════════════════════════════════

-- INSERT INTO clubs (name, description) VALUES
--   ('Robotics Club',   'Build and compete with robots'),
--   ('Debate Society',  'Sharpen your argumentation skills'),
--   ('Photography Club','Capture the world through your lens');
