-- =============================================================================
-- Multi-Tenant Project Management Platform - PostgreSQL Data Model
-- Target Engine: PostgreSQL 14+
-- Architectural Pillars: Tenant Isolation (RLS), High-throughput Task Querying,
-- Customizable Status Workflows, and Comprehensive Activity Auditing.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE org_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE status_category AS ENUM ('BACKLOG', 'UNSTARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE activity_type AS ENUM (
    'CREATED',
    'STATUS_CHANGED',
    'PRIORITY_CHANGED',
    'ASSIGNEE_CHANGED',
    'DUE_DATE_CHANGED',
    'TITLE_CHANGED',
    'DESCRIPTION_CHANGED',
    'COMMENT_ADDED',
    'LABEL_ADDED',
    'LABEL_REMOVED'
);

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users (Global identity accounts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organization Memberships (Role-Based Access Control)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- 4. Workspace Settings (Tenant-level configurations)
CREATE TABLE workspace_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    enforce_2fa BOOLEAN NOT NULL DEFAULT FALSE,
    allowed_email_domains TEXT[] DEFAULT '{}',
    default_role org_role NOT NULL DEFAULT 'MEMBER',
    theme VARCHAR(50) DEFAULT 'system',
    features JSONB NOT NULL DEFAULT '{"kanban": true, "timeline": true, "ai_assistant": true}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(10) NOT NULL, -- e.g., "ENG", "SEC", "DEV"
    description TEXT,
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    task_sequence_counter INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_project_key UNIQUE (organization_id, key)
);

-- 6. Project Statuses (Customizable per project)
CREATE TABLE project_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT '#64748b',
    category status_category NOT NULL DEFAULT 'UNSTARTED',
    position INT NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_status_name UNIQUE (project_id, name)
);

-- 7. Labels
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_label_name UNIQUE (organization_id, name)
);

-- 8. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    task_key VARCHAR(30) NOT NULL, -- e.g. "SEC-104"
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    status_id UUID NOT NULL REFERENCES project_statuses(id) ON DELETE RESTRICT,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    due_date TIMESTAMPTZ,
    order_in_status DOUBLE PRECISION NOT NULL DEFAULT 1000.0, -- Lexicographic or fractional ordering
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_sequence UNIQUE (project_id, sequence_number)
);

-- 9. Task Labels (Many-to-Many)
CREATE TABLE task_labels (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

-- 10. Task Comments
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Task Activity History (Audit Trail)
CREATE TABLE task_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    type activity_type NOT NULL,
    field VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- Tenant isolation lookup index
CREATE INDEX idx_org_members_user ON organization_members (user_id, organization_id);

-- Project task list query composite indexes
CREATE INDEX idx_tasks_project_status ON tasks (project_id, status_id, order_in_status);
CREATE INDEX idx_tasks_org_project ON tasks (organization_id, project_id);

-- Filter indexes for task queries
CREATE INDEX idx_tasks_assignee_due ON tasks (assignee_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_priority ON tasks (project_id, priority);
CREATE INDEX idx_tasks_created_at ON tasks (project_id, created_at DESC);

-- Cursor pagination index for deterministic sorting (created_at DESC, id DESC)
CREATE INDEX idx_tasks_cursor_sort ON tasks (project_id, created_at DESC, id DESC);

-- Comments & Activities retrieval
CREATE INDEX idx_comments_task ON task_comments (task_id, created_at ASC);
CREATE INDEX idx_activities_task ON task_activities (task_id, created_at DESC);

-- Full-text search on task title and description using GIN
CREATE INDEX idx_tasks_fts ON tasks USING gin (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- =============================================================================
-- AUTOMATED TRIGGERS FOR TIMESTAMPS & TASK SEQUENCING
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_task_comments_updated BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atomic Task Sequence Increment and task_key Generation
CREATE OR REPLACE FUNCTION generate_task_sequence()
RETURNS TRIGGER AS $$
DECLARE
    proj_key VARCHAR(10);
    new_seq INT;
BEGIN
    UPDATE projects
    SET task_sequence_counter = task_sequence_counter + 1
    WHERE id = NEW.project_id
    RETURNING key, task_sequence_counter INTO proj_key, new_seq;

    NEW.sequence_number = new_seq;
    NEW.task_key = proj_key || '-' || new_seq;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_sequence_before_insert
BEFORE INSERT ON tasks
FOR EACH ROW
WHEN (NEW.sequence_number IS NULL OR NEW.sequence_number = 0)
EXECUTE FUNCTION generate_task_sequence();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - MULTI-TENANT ISOLATION
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities ENABLE ROW LEVEL SECURITY;

-- Session-level context configuration:
-- SET LOCAL app.current_tenant_id = 'uuid';
-- SET LOCAL app.current_user_id = 'uuid';

CREATE POLICY tenant_isolation_projects ON projects
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_project_statuses ON project_statuses
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_tasks ON tasks
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_comments ON task_comments
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_activities ON task_activities
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_settings ON workspace_settings
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
