/*
  # Fix RLS policies and JWT access

  1. Security Updates
    - Fix RLS policies for proper JWT token access
    - Add policies for anon and authenticated users
    - Ensure proper table permissions

  2. Authentication
    - Update auth trigger for better error handling
    - Add proper user metadata handling
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own data" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view own bookings" ON room_bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON room_bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON room_bookings;

DROP POLICY IF EXISTS "Anyone can view mess menu" ON mess_menus;
DROP POLICY IF EXISTS "Users can view own complaints" ON complaints;
DROP POLICY IF EXISTS "Users can create own complaints" ON complaints;
DROP POLICY IF EXISTS "Users can update own complaints" ON complaints;

DROP POLICY IF EXISTS "Anyone can view notices" ON notices;

-- Recreate profiles policies with better JWT handling
CREATE POLICY "Enable read access for users based on user_id" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Rooms policies
CREATE POLICY "Enable read access for all authenticated users" ON rooms
  FOR SELECT TO authenticated USING (true);

-- Room bookings policies
CREATE POLICY "Users can view own bookings" ON room_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON room_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON room_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Mess menu policies
CREATE POLICY "Enable read access for all authenticated users" ON mess_menus
  FOR SELECT TO authenticated USING (true);

-- Complaints policies
CREATE POLICY "Users can view own complaints" ON complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own complaints" ON complaints
  FOR UPDATE USING (auth.uid() = user_id);

-- Notices policies
CREATE POLICY "Enable read access for all authenticated users" ON notices
  FOR SELECT TO authenticated USING (true);

-- Update the auth trigger to handle JWT properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, roll_number, phone_number, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'roll_number', 'TEMP' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'phone_number',
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;