/*
  # File Sharing and Notifications System

  1. New Tables
    - `file_attachments` - Store file metadata and URLs
    - `notifications` - User notifications system
    - `notification_preferences` - User notification settings

  2. Security
    - Enable RLS on all new tables
    - Add policies for file access and notification management

  3. Functions
    - File cleanup functions
    - Notification triggers
*/

-- File attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  storage_path text NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  application_updates boolean DEFAULT true,
  message_notifications boolean DEFAULT true,
  job_recommendations boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- File attachments policies
CREATE POLICY "Users can upload files"
  ON file_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can view files they uploaded"
  ON file_attachments
  FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Users can view public files"
  ON file_attachments
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Message participants can view message files"
  ON file_attachments
  FOR SELECT
  TO authenticated
  USING (
    message_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = file_attachments.message_id
      AND (c.hirer_id = auth.uid() OR c.professional_id = auth.uid())
    )
  );

CREATE POLICY "Job participants can view job files"
  ON file_attachments
  FOR SELECT
  TO authenticated
  USING (
    job_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = file_attachments.job_id
      AND (j.hirer_id = auth.uid() OR j.status = 'active')
    )
  );

CREATE POLICY "Application participants can view application files"
  ON file_attachments
  FOR SELECT
  TO authenticated
  USING (
    application_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE a.id = file_attachments.application_id
      AND (a.professional_id = auth.uid() OR j.hirer_id = auth.uid())
    )
  );

-- Notification preferences policies
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_attachments_uploader_id ON file_attachments(uploader_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_message_id ON file_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_job_id ON file_attachments(job_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_application_id ON file_attachments(application_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_created_at ON file_attachments(created_at DESC);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE file_attachments 
  SET download_count = download_count + 1
  WHERE id = NEW.file_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification preferences for new users
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON profiles;
CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}',
  p_action_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for application notifications
CREATE OR REPLACE FUNCTION notify_application_events()
RETURNS TRIGGER AS $$
DECLARE
  job_title text;
  professional_name text;
  hirer_name text;
BEGIN
  -- Get job and user details
  SELECT j.title, 
         COALESCE(p1.first_name || ' ' || p1.last_name, p1.company_name) as prof_name,
         COALESCE(p2.company_name, p2.first_name || ' ' || p2.last_name) as hire_name
  INTO job_title, professional_name, hirer_name
  FROM jobs j
  JOIN profiles p1 ON p1.id = NEW.professional_id
  JOIN profiles p2 ON p2.id = j.hirer_id
  WHERE j.id = NEW.job_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify hirer of new application
    PERFORM create_notification(
      (SELECT hirer_id FROM jobs WHERE id = NEW.job_id),
      'application',
      'New Job Application',
      professional_name || ' applied to your job "' || job_title || '"',
      jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id),
      '/dashboard/hirer/applications'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify professional of status change
    PERFORM create_notification(
      NEW.professional_id,
      'application',
      'Application Status Update',
      'Your application for "' || job_title || '" has been ' || NEW.status,
      jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'status', NEW.status),
      '/dashboard/professional/applications'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for application notifications
DROP TRIGGER IF EXISTS application_notification_trigger ON applications;
CREATE TRIGGER application_notification_trigger
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_events();

-- Trigger function for message notifications
CREATE OR REPLACE FUNCTION notify_message_events()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
  job_title text;
BEGIN
  -- Get conversation details
  SELECT 
    CASE 
      WHEN c.hirer_id = NEW.sender_id THEN c.professional_id
      ELSE c.hirer_id
    END,
    COALESCE(p.first_name || ' ' || p.last_name, p.company_name),
    j.title
  INTO recipient_id, sender_name, job_title
  FROM conversations c
  JOIN profiles p ON p.id = NEW.sender_id
  LEFT JOIN jobs j ON j.id = c.job_id
  WHERE c.id = NEW.conversation_id;

  -- Create notification for recipient
  PERFORM create_notification(
    recipient_id,
    'message',
    'New Message',
    sender_name || ' sent you a message' || 
    CASE WHEN job_title IS NOT NULL THEN ' about "' || job_title || '"' ELSE '' END,
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id),
    '/messages'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message notifications
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_message_events();