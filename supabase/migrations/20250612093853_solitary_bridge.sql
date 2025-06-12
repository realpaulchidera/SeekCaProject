/*
  # Create job views table for tracking

  1. New Tables
    - `job_views`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs.id)
      - `viewer_id` (uuid, references profiles.id, nullable for anonymous)
      - `ip_address` (text)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `job_views` table
    - Add policies for view tracking
*/

-- Create job_views table
CREATE TABLE IF NOT EXISTS job_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Job owners can view their job views"
  ON job_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_views.job_id 
      AND jobs.hirer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create job views"
  ON job_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to increment job view count
CREATE OR REPLACE FUNCTION increment_job_view_count()
RETURNS trigger AS $$
BEGIN
  UPDATE jobs 
  SET view_count = view_count + 1 
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increment view count
CREATE TRIGGER increment_job_view_count_trigger
  AFTER INSERT ON job_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_view_count();