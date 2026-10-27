-- ==========================================================================
-- TrekIntel — Himalayan Trekking Intelligence Platform
-- Supabase Database Schema, Row Level Security (RLS) & Seed Script
-- ==========================================================================
--
-- HOW TO RUN THIS SCRIPT:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/
-- 2. Select your Project -> Click "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- 4. Your tables, indexes, triggers, RLS policies, and sample data will be created!
-- ==========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- Table 1: profiles
-- Stores user identity and display details linked to auth.users
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- Table 2: treks
-- Stores Himalayan trekking routes, elevations, coordinates, and visibility
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.treks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Difficult', 'Expert')),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  altitude_m INTEGER CHECK (altitude_m >= 0 AND altitude_m <= 8848),
  latitude DOUBLE PRECISION CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION CHECK (longitude >= -180 AND longitude <= 180),
  description TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- Table 3: favourites
-- Tracks saved expeditions per user, preventing duplicates
-- ==========================================================================
CREATE TABLE IF NOT EXISTS public.favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trek_id UUID NOT NULL REFERENCES public.treks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_trek_favourite UNIQUE (user_id, trek_id)
);

-- ==========================================================================
-- Performance Indexes
-- ==========================================================================
CREATE INDEX IF NOT EXISTS idx_treks_is_public ON public.treks(is_public);
CREATE INDEX IF NOT EXISTS idx_treks_user_id ON public.treks(user_id);
CREATE INDEX IF NOT EXISTS idx_treks_altitude ON public.treks(altitude_m);
CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON public.favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_favourites_trek_id ON public.favourites(trek_id);

-- ==========================================================================
-- Row Level Security (RLS)
-- ==========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- Policies: profiles
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------------------------
-- Policies: treks
-- --------------------------------------------------------------------------
-- Public users can read all public treks. Authenticated users can also see their own private treks.
DROP POLICY IF EXISTS "Public users can view public treks" ON public.treks;
CREATE POLICY "Public users can view public treks"
  ON public.treks FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Authenticated users can insert their own treks
DROP POLICY IF EXISTS "Authenticated users can create treks" ON public.treks;
CREATE POLICY "Authenticated users can create treks"
  ON public.treks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update their own treks
DROP POLICY IF EXISTS "Owners can update their own treks" ON public.treks;
CREATE POLICY "Owners can update their own treks"
  ON public.treks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners can delete their own treks
DROP POLICY IF EXISTS "Owners can delete their own treks" ON public.treks;
CREATE POLICY "Owners can delete their own treks"
  ON public.treks FOR DELETE
  USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- Policies: favourites
-- --------------------------------------------------------------------------
-- Users can view only their own favourites
DROP POLICY IF EXISTS "Users can view their own favourites" ON public.favourites;
CREATE POLICY "Users can view their own favourites"
  ON public.favourites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert only their own favourites
DROP POLICY IF EXISTS "Users can add favourites" ON public.favourites;
CREATE POLICY "Users can add favourites"
  ON public.favourites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove only their own favourites
DROP POLICY IF EXISTS "Users can remove their favourites" ON public.favourites;
CREATE POLICY "Users can remove their favourites"
  ON public.favourites FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================================================
-- Trigger: Automated Profile Creation on User Signup
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================================
-- Sample Seed Data (Iconic Uttarakhand Himalayan Treks)
-- Notice: user_id is NULL for public system presets
-- ==========================================================================
INSERT INTO public.treks (id, user_id, name, location, difficulty, duration_days, altitude_m, latitude, longitude, description, image_url, is_public)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Kedarkantha Summit Trek',
    'Sankri, Uttarkashi, Uttarakhand',
    'Moderate',
    6,
    3810,
    31.0234,
    78.1725,
    'Kedarkantha is the crown jewel of winter treks in Uttarakhand. Starting from the charming apple orchard village of Sankri, the trail winds through dense pine forests, frozen Juda Ka Talab lake, and culminates in a dramatic 360-degree Himalayan summit sunrise view of Swargarohini, Bandarpoonch, and Black Peak.',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Dayara Bugyal Alpine Meadow',
    'Barsu, Uttarkashi, Uttarakhand',
    'Easy',
    4,
    3750,
    30.8242,
    78.5312,
    'Regarded as one of the most breathtaking high-altitude alpine meadows in Asia. In spring and summer, Dayara transforms into a lush green carpet filled with wild alpine blossoms, while winter blankets the rolling expanse in pristine powder snow framed by the magnificent Bhagirathi peaks.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Har Ki Dun Valley of Gods',
    'Sankri, Uttarkashi, Uttarakhand',
    'Moderate',
    7,
    3566,
    31.1458,
    78.3842,
    'A legendary cradle-shaped river valley steeped in Mahabharata folklore. Following the sparkling Supin river, this trek traverses centuries-old wooden villages like Osla and Gangad, offering intimate glimpses into remote Himalayan culture and views of the colossal Swargarohini massif.',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    NULL,
    'Valley of Flowers & Hemkund Sahib',
    'Govindghat, Chamoli, Uttarakhand',
    'Moderate',
    6,
    4300,
    30.7280,
    79.5847,
    'A UNESCO World Heritage Site renowned for its endemic alpine flower species. Discovered by mountaineer Frank Smythe, the valley blossoms into a vivid mosaic of over 500 species of flowers including the elusive Blue Poppy, coupled with a pilgrimage climb to the glacial lake of Hemkund Sahib.',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    NULL,
    'Chopta Chandrashila & Tungnath',
    'Chopta, Rudraprayag, Uttarakhand',
    'Easy',
    3,
    4000,
    30.4878,
    79.2172,
    'Often called the "Mini Switzerland of Uttarakhand", Chopta offers a short yet exhilarating trek to Tungnath—the highest Shiva temple in the world (3,680m)—and the summit rock of Chandrashila, granting jaw-dropping 360-degree vistas of Nanda Devi, Trishul, and Chaukhamba.',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    NULL,
    'Kuari Pass (Lord Curzon Trail)',
    'Joshimath, Chamoli, Uttarakhand',
    'Moderate',
    5,
    3876,
    30.4988,
    79.6247,
    'Pioneered by British Viceroy Lord Curzon in 1905, Kuari Pass delivers front-row amphitheater seats to the giants of the Garhwal Himalaya: Nanda Devi, Kamet, Dronagiri, and Hathi-Ghodi Parvat. Trek through ancient forests of conifer and oak into open meadows.',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    NULL,
    'Nag Tibba Weekend Summit',
    'Pantwari, Tehri Garhwal, Uttarakhand',
    'Easy',
    2,
    3022,
    30.5847,
    78.1517,
    'The "Serpent''s Peak" is the highest peak in the lower Garhwal Himalayas. Highly popular as an approachable weekend escape from Dehradun and Delhi, it features rewarding views of the Bandarpoonch range, Gangotri group, and Kedarnath peaks with minimal technical commitment.',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    NULL,
    'Roopkund Mystery Lake',
    'Wan, Chamoli, Uttarakhand',
    'Difficult',
    8,
    4800,
    30.2644,
    79.7322,
    'A demanding high-altitude expedition leading to the enigmatic glacial lake situated in the lap of Mount Trishul. Celebrated for its expansive twin alpine meadows of Ali and Bedni Bugyal and sweeping views of Mt. Trishul (7,120m) and Nanda Ghunti.',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  difficulty = EXCLUDED.difficulty,
  duration_days = EXCLUDED.duration_days,
  altitude_m = EXCLUDED.altitude_m,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_public = EXCLUDED.is_public;
