/*
  # Create professional profiles table

  1. New Tables
    - `professional_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `title` (text, professional title)
      - `hourly_rate` (decimal)
      - `experience_years` (integer)
      - `skills` (text array)
      - `certifications` (text array)
      - `licenses` (text array)
      - `education` (jsonb)
      - `portfolio_url` (text)
      - `availability_status` (enum: available, busy, unavailable)
      - `response_time_hours` (integer)
      - `rating` (decimal, 0-5)
      - `total_reviews` (integer)
      - `completed_projects` (integer)
      - `total_earnings` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `professional_profiles` table
    - Add policies for professionals to manage their profiles
    - Add policy for public viewing
*/

-- Create enum for availability status
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');

-- Create professional_profiles table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  title text,
  hourly_rate decimal(10,2),
  experience_years integer DEFAULT 0,
  skills text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  licenses text[] DEFAULT '{}',
  education jsonb DEFAULT '[]',
  portfolio_url text,
  availability_status availability_status DEFAULT 'available',
  response_time_hours integer DEFAULT 24,
  rating decimal(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 0,
  completed_projects integer DEFAULT 0,
  total_earnings decimal(12,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view professional profiles"
  ON professional_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can manage own profile"
  ON professional_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = professional_profiles.user_id 
      AND profiles.id = auth.uid()
      AND profiles.role = 'professional'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_professional_profiles_updated_at
  BEFORE UPDATE ON professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();