/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `hirer_id` (uuid, references profiles.id)
      - `title` (text)
      - `description` (text)
      - `category` (enum)
      - `job_type` (enum: full-time, part-time, contract, freelance)
      - `location` (text)
      - `remote_allowed` (boolean)
      - `salary_type` (enum: hourly, salary, project)
      - `salary_min` (decimal)
      - `salary_max` (decimal)
      - `currency` (text, default USD)
      - `required_skills` (text array)
      - `required_licenses` (text array)
      - `requirements` (text array)
      - `is_urgent` (boolean, default false)
      - `status` (enum: draft, active, paused, closed, filled)
      - `expires_at` (timestamp)
      - `view_count` (integer, default 0)
      - `application_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for hirers to manage their jobs
    - Add policy for professionals to view active jobs
*/

-- Create enum types
CREATE TYPE job_category AS ENUM (
  'engineering', 
  'construction', 
  'real-estate', 
  'project-management', 
  'design', 
  'services',
  'consulting',
  'other'
);

CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'freelance');
CREATE TYPE salary_type AS ENUM ('hourly', 'salary', 'project');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'filled');

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hirer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category job_category NOT NULL,
  job_type job_type NOT NULL,
  location text,
  remote_allowed boolean DEFAULT false,
  salary_type salary_type NOT NULL,
  salary_min decimal(12,2),
  salary_max decimal(12,2),
  currency text DEFAULT 'USD',
  required_skills text[] DEFAULT '{}',
  required_licenses text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  is_urgent boolean DEFAULT false,
  status job_status DEFAULT 'draft',
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Hirers can view own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = jobs.hirer_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'hirer'
    )
  );

CREATE POLICY "Hirers can manage own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = jobs.hirer_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'hirer'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();