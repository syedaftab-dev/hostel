/*
  # Daily Attendance System

  1. New Tables
    - `attendance_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `date` (date)
      - `status` (enum: present, absent, late, excused)
      - `check_in_time` (timestamptz)
      - `check_out_time` (timestamptz)
      - `notes` (text)
      - `marked_by` (uuid, foreign key to profiles - who marked the attendance)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `attendance_settings`
      - `id` (uuid, primary key)
      - `check_in_start` (time)
      - `check_in_end` (time)
      - `check_out_start` (time)
      - `check_out_end` (time)
      - `late_threshold_minutes` (integer)
      - `auto_mark_absent_after` (time)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Students can view their own attendance
    - Wardens and admins can view and manage all attendance
    - Only admins can modify attendance settings

  3. Functions
    - Auto-mark absent students function
    - Attendance statistics functions
</sql>

-- Create attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'absent',
  check_in_time timestamptz,
  check_out_time timestamptz,
  notes text,
  marked_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create attendance_settings table
CREATE TABLE IF NOT EXISTS attendance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_start time DEFAULT '06:00:00',
  check_in_end time DEFAULT '10:00:00',
  check_out_start time DEFAULT '18:00:00',
  check_out_end time DEFAULT '23:59:59',
  late_threshold_minutes integer DEFAULT 30,
  auto_mark_absent_after time DEFAULT '10:30:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default attendance settings
INSERT INTO attendance_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance_records
CREATE POLICY "Students can view own attendance"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'warden')
    )
  );

CREATE POLICY "Students can insert own attendance"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wardens and admins can manage all attendance"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'warden')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'warden')
    )
  );

-- RLS Policies for attendance_settings
CREATE POLICY "Everyone can view attendance settings"
  ON attendance_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify attendance settings"
  ON attendance_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Function to get attendance statistics
CREATE OR REPLACE FUNCTION get_attendance_stats(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE,
  target_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  total_days bigint,
  present_days bigint,
  absent_days bigint,
  late_days bigint,
  excused_days bigint,
  attendance_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_days,
    COUNT(*) FILTER (WHERE status = 'present') as present_days,
    COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
    COUNT(*) FILTER (WHERE status = 'late') as late_days,
    COUNT(*) FILTER (WHERE status = 'excused') as excused_days,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('present', 'late'))::numeric / 
       NULLIF(COUNT(*), 0) * 100), 2
    ) as attendance_percentage
  FROM attendance_records
  WHERE 
    date BETWEEN start_date AND end_date
    AND (target_user_id IS NULL OR user_id = target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark attendance
CREATE OR REPLACE FUNCTION mark_attendance(
  target_user_id uuid,
  attendance_date date DEFAULT CURRENT_DATE,
  attendance_status attendance_status DEFAULT 'present',
  check_time timestamptz DEFAULT now(),
  attendance_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  record_id uuid;
  current_user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  -- Check permissions
  IF current_user_role NOT IN ('admin', 'warden') AND auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Insufficient permissions to mark attendance';
  END IF;

  -- Insert or update attendance record
  INSERT INTO attendance_records (
    user_id, 
    date, 
    status, 
    check_in_time, 
    notes, 
    marked_by
  )
  VALUES (
    target_user_id,
    attendance_date,
    attendance_status,
    CASE WHEN attendance_status IN ('present', 'late') THEN check_time ELSE NULL END,
    attendance_notes,
    auth.uid()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    status = EXCLUDED.status,
    check_in_time = CASE 
      WHEN EXCLUDED.status IN ('present', 'late') AND attendance_records.check_in_time IS NULL 
      THEN EXCLUDED.check_in_time 
      ELSE attendance_records.check_in_time 
    END,
    check_out_time = CASE 
      WHEN EXCLUDED.status = 'present' AND attendance_records.status IN ('present', 'late')
      THEN check_time
      ELSE attendance_records.check_out_time
    END,
    notes = COALESCE(EXCLUDED.notes, attendance_records.notes),
    marked_by = EXCLUDED.marked_by,
    updated_at = now()
  RETURNING id INTO record_id;

  RETURN record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;