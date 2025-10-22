/*
  # Add Role-Based Access Control System

  1. New Tables
    - Add user_roles enum type
    - Update profiles table with role column
    - Create role-based policies

  2. Security
    - Enable RLS on all tables with role-based access
    - Add policies for admin, warden, and student roles
    - Ensure proper data isolation

  3. Changes
    - Add role column to profiles table
    - Create admin management functions
    - Update existing policies for role-based access
*/

-- Create user roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'warden', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'student';
  END IF;
END $$;

-- Add department column for wardens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE profiles ADD COLUMN department text;
  END IF;
END $$;

-- Create admin management table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with role-based access
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Profiles policies with role-based access
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Wardens can read student profiles" ON profiles
  FOR SELECT USING (
    role = 'student' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'warden'
    )
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Wardens can update student profiles" ON profiles
  FOR UPDATE USING (
    role = 'student' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'warden'
    )
  );

-- Room bookings policies with role-based access
DROP POLICY IF EXISTS "Users can view own bookings" ON room_bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON room_bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON room_bookings;

CREATE POLICY "Users can view own bookings" ON room_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON room_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Wardens can view student bookings" ON room_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = auth.uid() AND p1.role = 'warden'
      AND p2.id = room_bookings.user_id AND p2.role = 'student'
    )
  );

CREATE POLICY "Students can insert own bookings" ON room_bookings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Users can update own bookings" ON room_bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings" ON room_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Wardens can update student bookings" ON room_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = auth.uid() AND p1.role = 'warden'
      AND p2.id = room_bookings.user_id AND p2.role = 'student'
    )
  );

-- Complaints policies with role-based access
DROP POLICY IF EXISTS "Users can view own complaints" ON complaints;
DROP POLICY IF EXISTS "Users can insert own complaints" ON complaints;
DROP POLICY IF EXISTS "Users can update own complaints" ON complaints;

CREATE POLICY "Users can view own complaints" ON complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints" ON complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Wardens can view student complaints" ON complaints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = auth.uid() AND p1.role = 'warden'
      AND p2.id = complaints.user_id AND p2.role = 'student'
    )
  );

CREATE POLICY "Students can insert own complaints" ON complaints
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Users can update own complaints" ON complaints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all complaints" ON complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Wardens can update student complaints" ON complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p1, profiles p2
      WHERE p1.id = auth.uid() AND p1.role = 'warden'
      AND p2.id = complaints.user_id AND p2.role = 'student'
    )
  );

-- Admin actions policies
CREATE POLICY "Admins can view all admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update the auth trigger to handle roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, roll_number, phone_number, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'roll_number', 'TEMP' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'phone_number',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'),
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to promote user to admin (only callable by existing admins)
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Update user role
  UPDATE profiles 
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (auth.uid(), 'promote_to_admin', target_user_id, '{"role": "admin"}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to promote user to warden
CREATE OR REPLACE FUNCTION promote_to_warden(target_user_id uuid, warden_department text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users to warden';
  END IF;
  
  -- Update user role
  UPDATE profiles 
  SET role = 'warden', department = warden_department, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (auth.uid(), 'promote_to_warden', target_user_id, 
    jsonb_build_object('role', 'warden', 'department', warden_department));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to demote user to student
CREATE OR REPLACE FUNCTION demote_to_student(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;
  
  -- Update user role
  UPDATE profiles 
  SET role = 'student', department = NULL, updated_at = now()
  WHERE id = target_user_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, target_user_id, details)
  VALUES (auth.uid(), 'demote_to_student', target_user_id, '{"role": "student"}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a default admin user (you should change this email to your admin email)
-- This will only work if you create a user with this email first
DO $$
BEGIN
  -- Only create if no admin exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
    -- You need to replace this with an actual user ID after creating the admin account
    -- This is just a placeholder
    INSERT INTO profiles (id, name, roll_number, role, created_at, updated_at)
    VALUES (
      gen_random_uuid(), -- Replace with actual admin user ID
      'System Admin',
      'ADMIN001',
      'admin',
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;