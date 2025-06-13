/*
  # Project Management System

  1. New Tables
    - `projects` - Main project records linking jobs to hired professionals
    - `project_milestones` - Project milestones with deadlines and completion tracking
    - `time_entries` - Time tracking for professionals
    - `project_updates` - Status updates and communication
    - `project_files` - File attachments for projects
    - `milestone_payments` - Payment tracking tied to milestones

  2. Security
    - Enable RLS on all tables
    - Add policies for project participants
    - Ensure data privacy and access control

  3. Features
    - Milestone-based project tracking
    - Time tracking with detailed logs
    - Status updates and communication
    - File sharing and document management
    - Payment milestone tracking
*/

-- Create project status enum
CREATE TYPE project_status AS ENUM (
  'planning',
  'in_progress', 
  'on_hold',
  'completed',
  'cancelled'
);

-- Create milestone status enum
CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'overdue'
);

-- Create time entry type enum
CREATE TYPE time_entry_type AS ENUM (
  'work',
  'meeting',
  'research',
  'planning',
  'review',
  'other'
);

-- Create update type enum
CREATE TYPE update_type AS ENUM (
  'status',
  'milestone',
  'issue',
  'general',
  'system'
);

-- Projects table - main project records
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  hirer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Project details
  title text NOT NULL,
  description text,
  status project_status DEFAULT 'planning',
  
  -- Timeline
  start_date date,
  end_date date,
  estimated_hours numeric(8,2),
  
  -- Budget and payment
  total_budget numeric(12,2),
  hourly_rate numeric(10,2),
  payment_schedule text, -- 'milestone', 'hourly', 'fixed'
  
  -- Progress tracking
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  total_hours_logged numeric(8,2) DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(job_id, professional_id)
);

-- Project milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Milestone details
  title text NOT NULL,
  description text,
  status milestone_status DEFAULT 'pending',
  
  -- Timeline
  due_date date,
  completed_date date,
  
  -- Progress and payment
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  payment_amount numeric(12,2),
  is_paid boolean DEFAULT false,
  
  -- Ordering
  display_order integer DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Time entries table for time tracking
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES project_milestones(id) ON DELETE SET NULL,
  
  -- Time details
  entry_type time_entry_type DEFAULT 'work',
  description text NOT NULL,
  
  -- Time tracking
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer, -- Calculated or manually entered
  
  -- Billing
  hourly_rate numeric(10,2),
  is_billable boolean DEFAULT true,
  is_approved boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project updates table for communication and status updates
CREATE TABLE IF NOT EXISTS project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES project_milestones(id) ON DELETE SET NULL,
  
  -- Update details
  update_type update_type DEFAULT 'general',
  title text,
  content text NOT NULL,
  
  -- Visibility
  is_public boolean DEFAULT true, -- Visible to both parties
  is_important boolean DEFAULT false,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project files table for document management
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES project_milestones(id) ON DELETE SET NULL,
  
  -- File details
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  storage_path text NOT NULL,
  
  -- Categorization
  category text, -- 'contract', 'deliverable', 'reference', 'invoice', etc.
  description text,
  
  -- Access control
  is_public boolean DEFAULT true, -- Visible to both parties
  
  -- Metadata
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Milestone payments table for payment tracking
CREATE TABLE IF NOT EXISTS milestone_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES project_milestones(id) ON DELETE CASCADE,
  
  -- Payment details
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  
  -- Status tracking
  is_requested boolean DEFAULT false,
  requested_at timestamptz,
  is_approved boolean DEFAULT false,
  approved_at timestamptz,
  is_paid boolean DEFAULT false,
  paid_at timestamptz,
  
  -- Payment method and reference
  payment_method text,
  payment_reference text,
  
  -- Notes
  notes text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_payments ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Project participants can view projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (hirer_id = auth.uid() OR professional_id = auth.uid());

CREATE POLICY "Hirers can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (hirer_id = auth.uid());

CREATE POLICY "Project participants can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (hirer_id = auth.uid() OR professional_id = auth.uid());

-- Project milestones policies
CREATE POLICY "Project participants can view milestones"
  ON project_milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

CREATE POLICY "Project participants can manage milestones"
  ON project_milestones
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

-- Time entries policies
CREATE POLICY "Professionals can manage own time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Hirers can view time entries for their projects"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND p.hirer_id = auth.uid()
    )
  );

-- Project updates policies
CREATE POLICY "Project participants can view updates"
  ON project_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

CREATE POLICY "Project participants can create updates"
  ON project_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

CREATE POLICY "Authors can update own updates"
  ON project_updates
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Project files policies
CREATE POLICY "Project participants can view files"
  ON project_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

CREATE POLICY "Project participants can upload files"
  ON project_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploader_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

-- Milestone payments policies
CREATE POLICY "Project participants can view payments"
  ON milestone_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND (p.hirer_id = auth.uid() OR p.professional_id = auth.uid())
    )
  );

CREATE POLICY "Professionals can request payments"
  ON milestone_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND p.professional_id = auth.uid()
    )
  );

CREATE POLICY "Hirers can approve payments"
  ON milestone_payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id 
      AND p.hirer_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_hirer_id ON projects(hirer_id);
CREATE INDEX IF NOT EXISTS idx_projects_professional_id ON projects(professional_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_due_date ON project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_project_milestones_display_order ON project_milestones(display_order);

CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_professional_id ON time_entries(professional_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_is_billable ON time_entries(is_billable);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_author_id ON project_updates(author_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_updates_type ON project_updates(update_type);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploader_id ON project_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON project_files(category);

CREATE INDEX IF NOT EXISTS idx_milestone_payments_project_id ON milestone_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_milestone_id ON milestone_payments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_status ON milestone_payments(is_paid, is_approved);

-- Functions for project management

-- Function to calculate project completion percentage based on milestones
CREATE OR REPLACE FUNCTION calculate_project_completion(p_project_id uuid)
RETURNS integer AS $$
DECLARE
  total_milestones integer;
  completed_milestones integer;
  completion_pct integer;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_milestones, completed_milestones
  FROM project_milestones
  WHERE project_id = p_project_id;
  
  IF total_milestones = 0 THEN
    RETURN 0;
  END IF;
  
  completion_pct := ROUND((completed_milestones::numeric / total_milestones) * 100);
  
  -- Update the project completion percentage
  UPDATE projects 
  SET 
    completion_percentage = completion_pct,
    updated_at = now()
  WHERE id = p_project_id;
  
  RETURN completion_pct;
END;
$$ LANGUAGE plpgsql;

-- Function to update milestone status based on due dates
CREATE OR REPLACE FUNCTION update_milestone_statuses()
RETURNS void AS $$
BEGIN
  -- Mark overdue milestones
  UPDATE project_milestones
  SET status = 'overdue'
  WHERE status IN ('pending', 'in_progress')
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total hours logged for a project
CREATE OR REPLACE FUNCTION calculate_project_hours(p_project_id uuid)
RETURNS numeric AS $$
DECLARE
  total_hours numeric;
BEGIN
  SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
  INTO total_hours
  FROM time_entries
  WHERE project_id = p_project_id;
  
  -- Update the project total hours
  UPDATE projects 
  SET 
    total_hours_logged = total_hours,
    updated_at = now()
  WHERE id = p_project_id;
  
  RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- Function to get project dashboard data
CREATE OR REPLACE FUNCTION get_project_dashboard(p_user_id uuid)
RETURNS TABLE (
  project_id uuid,
  project_title text,
  project_status project_status,
  completion_percentage integer,
  total_hours_logged numeric,
  overdue_milestones integer,
  pending_payments numeric,
  other_party_name text,
  other_party_avatar text,
  last_update timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.title as project_title,
    p.status as project_status,
    p.completion_percentage,
    p.total_hours_logged,
    (
      SELECT COUNT(*)::integer 
      FROM project_milestones pm 
      WHERE pm.project_id = p.id AND pm.status = 'overdue'
    ) as overdue_milestones,
    (
      SELECT COALESCE(SUM(mp.amount), 0)
      FROM milestone_payments mp 
      WHERE mp.project_id = p.id AND mp.is_requested = true AND mp.is_paid = false
    ) as pending_payments,
    CASE 
      WHEN p.hirer_id = p_user_id THEN 
        COALESCE(prof.first_name || ' ' || prof.last_name, prof.company_name)
      ELSE 
        COALESCE(hirer.first_name || ' ' || hirer.last_name, hirer.company_name)
    END as other_party_name,
    CASE 
      WHEN p.hirer_id = p_user_id THEN prof.avatar_url
      ELSE hirer.avatar_url
    END as other_party_avatar,
    p.updated_at as last_update
  FROM projects p
  LEFT JOIN profiles prof ON prof.id = p.professional_id
  LEFT JOIN profiles hirer ON hirer.id = p.hirer_id
  WHERE p.hirer_id = p_user_id OR p.professional_id = p_user_id
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_time_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_project_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_milestone_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project completion when milestones change
CREATE OR REPLACE FUNCTION trigger_update_project_completion()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_project_completion(COALESCE(NEW.project_id, OLD.project_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project hours when time entries change
CREATE OR REPLACE FUNCTION trigger_update_project_hours()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_project_hours(COALESCE(NEW.project_id, OLD.project_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_project_milestones_updated_at();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_time_entries_updated_at();

CREATE TRIGGER update_project_updates_updated_at
  BEFORE UPDATE ON project_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_project_updates_updated_at();

CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_project_files_updated_at();

CREATE TRIGGER update_milestone_payments_updated_at
  BEFORE UPDATE ON milestone_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_payments_updated_at();

-- Trigger to update project completion when milestones change
CREATE TRIGGER trigger_update_project_completion
  AFTER INSERT OR UPDATE OR DELETE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_project_completion();

-- Trigger to update project hours when time entries change
CREATE TRIGGER trigger_update_project_hours
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_project_hours();