/*
  # Fix search functions with proper return types

  1. Functions
    - Drop existing search_jobs and search_professionals functions with all possible signatures
    - Recreate search_jobs function with correct numeric types
    - Recreate search_professionals function with correct return structure
    - Create log_search_analytics function for tracking searches

  2. Changes
    - Ensures all salary and rate fields return as numeric type
    - Matches the exact database schema structure
    - Provides proper search functionality for jobs and professionals
*/

-- Drop all possible variations of search_jobs function
DROP FUNCTION IF EXISTS search_jobs(text, text, text, text, boolean, numeric, numeric, text, text[], text[], boolean, integer, integer, integer);
DROP FUNCTION IF EXISTS search_jobs(text, text, text, text, boolean, numeric, numeric, text, text[], text[], boolean, integer, integer, integer, text);
DROP FUNCTION IF EXISTS search_jobs();

-- Drop all possible variations of search_professionals function
DROP FUNCTION IF EXISTS search_professionals(text, text[], text, numeric, numeric, text, integer, numeric, text[], integer, integer);
DROP FUNCTION IF EXISTS search_professionals();

-- Drop log_search_analytics if it exists
DROP FUNCTION IF EXISTS log_search_analytics(uuid, text, text, jsonb, integer, text);
DROP FUNCTION IF EXISTS log_search_analytics();

-- Create the corrected search_jobs function
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
  hirer_id uuid,
  title text,
  description text,
  category job_category,
  job_type job_type,
  location text,
  remote_allowed boolean,
  salary_type salary_type,
  salary_min numeric,
  salary_max numeric,
  currency text,
  required_skills text[],
  required_licenses text[],
  requirements text[],
  is_urgent boolean,
  status job_status,
  expires_at timestamptz,
  view_count integer,
  application_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  search_text text,
  company_name text,
  is_verified boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.hirer_id,
    j.title,
    j.description,
    j.category,
    j.job_type,
    j.location,
    j.remote_allowed,
    j.salary_type,
    j.salary_min,
    j.salary_max,
    j.currency,
    j.required_skills,
    j.required_licenses,
    j.requirements,
    j.is_urgent,
    j.status,
    j.expires_at,
    j.view_count,
    j.application_count,
    j.created_at,
    j.updated_at,
    j.search_text,
    p.company_name,
    p.is_verified
  FROM jobs j
  LEFT JOIN profiles p ON p.id = j.hirer_id
  WHERE 
    j.status = 'active'
    AND (p_query IS NULL OR j.search_text ILIKE '%' || p_query || '%')
    AND (p_category IS NULL OR j.category::text = p_category)
    AND (p_job_type IS NULL OR j.job_type::text = p_job_type)
    AND (p_location IS NULL OR j.location ILIKE '%' || p_location || '%')
    AND (p_remote_allowed IS NULL OR j.remote_allowed = p_remote_allowed)
    AND (p_salary_min IS NULL OR j.salary_max IS NULL OR j.salary_max >= p_salary_min)
    AND (p_salary_max IS NULL OR j.salary_min IS NULL OR j.salary_min <= p_salary_max)
    AND (p_salary_type IS NULL OR j.salary_type::text = p_salary_type)
    AND (p_required_skills IS NULL OR j.required_skills && p_required_skills)
    AND (p_required_licenses IS NULL OR j.required_licenses && p_required_licenses)
    AND (p_is_urgent IS NULL OR j.is_urgent = p_is_urgent)
    AND (p_posted_within_days IS NULL OR j.created_at >= NOW() - INTERVAL '1 day' * p_posted_within_days)
    AND j.expires_at > NOW()
  ORDER BY 
    CASE WHEN j.is_urgent THEN 0 ELSE 1 END,
    j.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create search_professionals function
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
  certifications text[],
  licenses text[],
  education jsonb,
  portfolio_url text,
  availability_status availability_status,
  response_time_hours integer,
  rating numeric,
  total_reviews integer,
  completed_projects integer,
  total_earnings numeric,
  created_at timestamptz,
  updated_at timestamptz,
  search_text text,
  first_name text,
  last_name text,
  location text,
  avatar_url text,
  bio text,
  is_verified boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.user_id,
    pp.title,
    pp.hourly_rate,
    pp.experience_years,
    pp.skills,
    pp.certifications,
    pp.licenses,
    pp.education,
    pp.portfolio_url,
    pp.availability_status,
    pp.response_time_hours,
    pp.rating,
    pp.total_reviews,
    pp.completed_projects,
    pp.total_earnings,
    pp.created_at,
    pp.updated_at,
    pp.search_text,
    p.first_name,
    p.last_name,
    p.location,
    p.avatar_url,
    p.bio,
    p.is_verified
  FROM professional_profiles pp
  LEFT JOIN profiles p ON p.id = pp.user_id
  WHERE 
    (p_query IS NULL OR pp.search_text ILIKE '%' || p_query || '%')
    AND (p_skills IS NULL OR pp.skills && p_skills)
    AND (p_location IS NULL OR p.location ILIKE '%' || p_location || '%')
    AND (p_hourly_rate_min IS NULL OR pp.hourly_rate >= p_hourly_rate_min)
    AND (p_hourly_rate_max IS NULL OR pp.hourly_rate <= p_hourly_rate_max)
    AND (p_availability_status IS NULL OR pp.availability_status::text = p_availability_status)
    AND (p_experience_min IS NULL OR pp.experience_years >= p_experience_min)
    AND (p_rating_min IS NULL OR pp.rating >= p_rating_min)
    AND (p_licenses IS NULL OR pp.licenses && p_licenses)
  ORDER BY 
    pp.rating DESC,
    pp.total_reviews DESC,
    pp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create log_search_analytics function
CREATE OR REPLACE FUNCTION log_search_analytics(
  p_user_id uuid DEFAULT NULL,
  p_search_type text,
  p_query text DEFAULT NULL,
  p_filters jsonb DEFAULT '{}',
  p_results_count integer DEFAULT 0,
  p_session_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO search_analytics (
    user_id,
    search_type,
    query,
    filters,
    results_count,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_search_type,
    p_query,
    p_filters,
    p_results_count,
    p_session_id,
    NULL, -- IP address would need to be passed from client
    NULL  -- User agent would need to be passed from client
  );
END;
$$;