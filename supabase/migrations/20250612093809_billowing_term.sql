/*
  # Create applications table

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs.id)
      - `professional_id` (uuid, references profiles.id)
      - `cover_letter` (text)
      - `proposed_rate` (decimal)
      - `estimated_duration` (text)
      - `availability_start` (date)
      - `status` (enum: pending, reviewed, shortlisted, rejected, hired)
      - `hirer_notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `applications` table
    - Add policies for professionals to manage their applications
    - Add policies for hirers to view applications for their jobs
*/

-- Create enum for application status
CREATE TYPE application_status AS ENUM (
  'pending', 
  'reviewed', 
  'shortlisted', 
  'rejected', 
  'hired'
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text,
  proposed_rate decimal(10,2),
  estimated_duration text,
  availability_start date,
  status application_status DEFAULT 'pending',
  hirer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, professional_id)
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professionals can view own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = applications.professional_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'professional'
    )
  );

CREATE POLICY "Professionals can create applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = applications.professional_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'professional'
    )
  );

CREATE POLICY "Professionals can update own applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = applications.professional_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'professional'
    )
  );

CREATE POLICY "Hirers can view applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      JOIN profiles ON profiles.id = jobs.hirer_id
      WHERE jobs.id = applications.job_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'hirer'
    )
  );

CREATE POLICY "Hirers can update applications for their jobs"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      JOIN profiles ON profiles.id = jobs.hirer_id
      WHERE jobs.id = applications.job_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'hirer'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update job application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs 
    SET application_count = application_count + 1 
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs 
    SET application_count = application_count - 1 
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update application count
CREATE TRIGGER update_job_application_count_trigger
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_count();