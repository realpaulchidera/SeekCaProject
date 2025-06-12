/*
  # Create reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs.id)
      - `reviewer_id` (uuid, references profiles.id)
      - `reviewee_id` (uuid, references profiles.id)
      - `rating` (integer, 1-5)
      - `title` (text)
      - `comment` (text)
      - `skills_rating` (integer, 1-5)
      - `communication_rating` (integer, 1-5)
      - `timeliness_rating` (integer, 1-5)
      - `professionalism_rating` (integer, 1-5)
      - `would_recommend` (boolean)
      - `is_public` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for review management
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  skills_rating integer CHECK (skills_rating >= 1 AND skills_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating integer CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating integer CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  would_recommend boolean DEFAULT true,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, reviewer_id, reviewee_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view public reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can view reviews about them"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (reviewee_id = auth.uid());

CREATE POLICY "Users can view reviews they wrote"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update reviews they wrote"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update professional profile ratings
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS trigger AS $$
DECLARE
  avg_rating decimal(3,2);
  review_count integer;
BEGIN
  -- Calculate new average rating and count for the reviewee
  SELECT 
    ROUND(AVG(rating), 2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM reviews 
  WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id)
  AND is_public = true;

  -- Update professional profile
  UPDATE professional_profiles 
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = review_count
  WHERE user_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update professional ratings
CREATE TRIGGER update_professional_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();