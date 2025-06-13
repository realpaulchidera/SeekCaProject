/*
  # Advanced Search & Filtering System

  1. New Tables
    - `saved_searches` - Store user's saved search criteria
    - `job_alerts` - Manage job alert subscriptions
    - `search_analytics` - Track search patterns and performance

  2. Search Functions
    - Full-text search for jobs and professionals
    - Advanced filtering with multiple criteria
    - Skill matching algorithms

  3. Indexes
    - Full-text search indexes
    - Performance indexes for filtering
*/

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  search_type text NOT NULL CHECK (search_type IN ('jobs', 'professionals')),
  criteria jsonb NOT NULL DEFAULT '{}',
  is_alert_enabled boolean DEFAULT false,
  alert_frequency text DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
  last_alert_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job alerts table
CREATE TABLE IF NOT EXISTS job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  saved_search_id uuid REFERENCES saved_searches(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Search analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  search_type text NOT NULL,
  query text,
  filters jsonb DEFAULT '{}',
  results_count integer DEFAULT 0,
  clicked_result_id uuid,
  session_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Saved searches policies
CREATE POLICY "Users can manage own saved searches"
  ON saved_searches
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Job alerts policies
CREATE POLICY "Users can view own job alerts"
  ON job_alerts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create job alerts"
  ON job_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Search analytics policies
CREATE POLICY "Users can view own search analytics"
  ON search_analytics
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create search analytics"
  ON search_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_type ON saved_searches(search_type);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts ON saved_searches(is_alert_enabled, alert_frequency);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_search_id ON job_alerts(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_sent ON job_alerts(is_sent, created_at);

CREATE INDEX IF NOT EXISTS idx_search_analytics_user_id ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at DESC);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(
  to_tsvector('english', title || ' ' || description || ' ' || coalesce(array_to_string(required_skills, ' '), ''))
);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_search ON professional_profiles USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(array_to_string(skills, ' '), ''))
);

-- Function to calculate skill match score
CREATE OR REPLACE FUNCTION calculate_skill_match_score(
  required_skills text[],
  professional_skills text[]
)
RETURNS numeric AS $$
DECLARE
  matched_skills integer := 0;
  total_required integer := array_length(required_skills, 1);
  skill text;
BEGIN
  IF total_required IS NULL OR total_required = 0 THEN
    RETURN 0;
  END IF;

  FOREACH skill IN ARRAY required_skills
  LOOP
    IF skill = ANY(professional_skills) THEN
      matched_skills := matched_skills + 1;
    END IF;
  END LOOP;

  RETURN (matched_skills::numeric / total_required::numeric) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search jobs with advanced filtering
CREATE OR REPLACE FUNCTION search_jobs(
  p_query text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_job_type text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_remote_allowed boolean DEFAULT NULL,
  p_salary_min numeric DEFAULT NULL,
  p_salary_max numeric DEFAULT NULL,
  p_salary_type text DEFAULT NULL,
  p_required_skills text[] DEFAULT NULL,
  p_required_licenses text[] DEFAULT NULL,
  p_is_urgent boolean DEFAULT NULL,
  p_posted_within_days integer DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category job_category,
  job_type job_type,
  location text,
  remote_allowed boolean,
  salary_type salary_type,
  salary_min numeric,
  salary_max numeric,
  required_skills text[],
  required_licenses text[],
  is_urgent boolean,
  status job_status,
  view_count integer,
  application_count integer,
  created_at timestamptz,
  company_name text,
  company_verified boolean,
  relevance_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.description,
    j.category,
    j.job_type,
    j.location,
    j.remote_allowed,
    j.salary_type,
    j.salary_min,
    j.salary_max,
    j.required_skills,
    j.required_licenses,
    j.is_urgent,
    j.status,
    j.view_count,
    j.application_count,
    j.created_at,
    p.company_name,
    p.is_verified as company_verified,
    CASE 
      WHEN p_query IS NOT NULL THEN
        ts_rank(
          to_tsvector('english', j.title || ' ' || j.description || ' ' || coalesce(array_to_string(j.required_skills, ' '), '')),
          plainto_tsquery('english', p_query)
        )
      ELSE 1.0
    END as relevance_score
  FROM jobs j
  JOIN profiles p ON p.id = j.hirer_id
  WHERE j.status = 'active'
    AND (p_query IS NULL OR to_tsvector('english', j.title || ' ' || j.description || ' ' || coalesce(array_to_string(j.required_skills, ' '), '')) @@ plainto_tsquery('english', p_query))
    AND (p_category IS NULL OR j.category::text = p_category)
    AND (p_job_type IS NULL OR j.job_type::text = p_job_type)
    AND (p_location IS NULL OR j.location ILIKE '%' || p_location || '%' OR j.remote_allowed = true)
    AND (p_remote_allowed IS NULL OR j.remote_allowed = p_remote_allowed)
    AND (p_salary_min IS NULL OR j.salary_max >= p_salary_min OR j.salary_max IS NULL)
    AND (p_salary_max IS NULL OR j.salary_min <= p_salary_max OR j.salary_min IS NULL)
    AND (p_salary_type IS NULL OR j.salary_type::text = p_salary_type)
    AND (p_required_skills IS NULL OR j.required_skills && p_required_skills)
    AND (p_required_licenses IS NULL OR j.required_licenses && p_required_licenses)
    AND (p_is_urgent IS NULL OR j.is_urgent = p_is_urgent)
    AND (p_posted_within_days IS NULL OR j.created_at >= now() - (p_posted_within_days || ' days')::interval)
  ORDER BY 
    CASE WHEN p_query IS NOT NULL THEN relevance_score ELSE 0 END DESC,
    j.is_urgent DESC,
    j.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to search professionals with skill matching
CREATE OR REPLACE FUNCTION search_professionals(
  p_query text DEFAULT NULL,
  p_skills text[] DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_hourly_rate_min numeric DEFAULT NULL,
  p_hourly_rate_max numeric DEFAULT NULL,
  p_availability_status text DEFAULT NULL,
  p_experience_min integer DEFAULT NULL,
  p_rating_min numeric DEFAULT NULL,
  p_licenses text[] DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  hourly_rate numeric,
  experience_years integer,
  skills text[],
  licenses text[],
  availability_status availability_status,
  rating numeric,
  total_reviews integer,
  completed_projects integer,
  first_name text,
  last_name text,
  location text,
  avatar_url text,
  is_verified boolean,
  skill_match_score numeric,
  relevance_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.user_id,
    pp.title,
    pp.hourly_rate,
    pp.experience_years,
    pp.skills,
    pp.licenses,
    pp.availability_status,
    pp.rating,
    pp.total_reviews,
    pp.completed_projects,
    p.first_name,
    p.last_name,
    p.location,
    p.avatar_url,
    p.is_verified,
    CASE 
      WHEN p_skills IS NOT NULL THEN calculate_skill_match_score(p_skills, pp.skills)
      ELSE 0
    END as skill_match_score,
    CASE 
      WHEN p_query IS NOT NULL THEN
        ts_rank(
          to_tsvector('english', coalesce(pp.title, '') || ' ' || coalesce(array_to_string(pp.skills, ' '), '')),
          plainto_tsquery('english', p_query)
        )
      ELSE 1.0
    END as relevance_score
  FROM professional_profiles pp
  JOIN profiles p ON p.id = pp.user_id
  WHERE (p_query IS NULL OR to_tsvector('english', coalesce(pp.title, '') || ' ' || coalesce(array_to_string(pp.skills, ' '), '')) @@ plainto_tsquery('english', p_query))
    AND (p_skills IS NULL OR pp.skills && p_skills)
    AND (p_location IS NULL OR p.location ILIKE '%' || p_location || '%')
    AND (p_hourly_rate_min IS NULL OR pp.hourly_rate >= p_hourly_rate_min)
    AND (p_hourly_rate_max IS NULL OR pp.hourly_rate <= p_hourly_rate_max)
    AND (p_availability_status IS NULL OR pp.availability_status::text = p_availability_status)
    AND (p_experience_min IS NULL OR pp.experience_years >= p_experience_min)
    AND (p_rating_min IS NULL OR pp.rating >= p_rating_min)
    AND (p_licenses IS NULL OR pp.licenses && p_licenses)
  ORDER BY 
    CASE WHEN p_skills IS NOT NULL THEN skill_match_score ELSE 0 END DESC,
    CASE WHEN p_query IS NOT NULL THEN relevance_score ELSE 0 END DESC,
    pp.rating DESC,
    pp.total_reviews DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to check for new jobs matching saved searches
CREATE OR REPLACE FUNCTION check_job_alerts()
RETURNS void AS $$
DECLARE
  search_record saved_searches%ROWTYPE;
  job_record jobs%ROWTYPE;
  criteria jsonb;
BEGIN
  -- Loop through active job alerts
  FOR search_record IN 
    SELECT * FROM saved_searches 
    WHERE is_alert_enabled = true 
    AND search_type = 'jobs'
    AND (last_alert_sent IS NULL OR 
         (alert_frequency = 'daily' AND last_alert_sent < now() - interval '1 day') OR
         (alert_frequency = 'weekly' AND last_alert_sent < now() - interval '1 week'))
  LOOP
    criteria := search_record.criteria;
    
    -- Find new jobs matching criteria
    FOR job_record IN
      SELECT j.* FROM jobs j
      WHERE j.status = 'active'
      AND j.created_at > COALESCE(search_record.last_alert_sent, search_record.created_at)
      AND (criteria->>'category' IS NULL OR j.category::text = criteria->>'category')
      AND (criteria->>'job_type' IS NULL OR j.job_type::text = criteria->>'job_type')
      AND (criteria->>'location' IS NULL OR j.location ILIKE '%' || (criteria->>'location') || '%')
      AND (criteria->>'salary_min' IS NULL OR j.salary_max >= (criteria->>'salary_min')::numeric)
      AND (criteria->>'salary_max' IS NULL OR j.salary_min <= (criteria->>'salary_max')::numeric)
    LOOP
      -- Create job alert record
      INSERT INTO job_alerts (user_id, saved_search_id, job_id)
      VALUES (search_record.user_id, search_record.id, job_record.id)
      ON CONFLICT DO NOTHING;
      
      -- Create notification
      PERFORM create_notification(
        search_record.user_id,
        'job_update',
        'New Job Match',
        'A new job "' || job_record.title || '" matches your saved search "' || search_record.name || '"',
        jsonb_build_object('job_id', job_record.id, 'search_id', search_record.id),
        '/jobs/' || job_record.id
      );
    END LOOP;
    
    -- Update last alert sent time
    UPDATE saved_searches 
    SET last_alert_sent = now() 
    WHERE id = search_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to log search analytics
CREATE OR REPLACE FUNCTION log_search_analytics(
  p_user_id uuid,
  p_search_type text,
  p_query text,
  p_filters jsonb,
  p_results_count integer,
  p_session_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  analytics_id uuid;
BEGIN
  INSERT INTO search_analytics (
    user_id, search_type, query, filters, results_count, 
    session_id, ip_address, user_agent
  )
  VALUES (
    p_user_id, p_search_type, p_query, p_filters, p_results_count,
    p_session_id, p_ip_address, p_user_agent
  )
  RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update saved searches timestamp
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_searches_updated_at();