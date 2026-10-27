/**
 * TrekIntel — Supabase Integration Client & Database Service
 * Implements Supabase client configuration, queries, and robust fallback for local previews
 */

import { SAMPLE_TREKS } from './utils.js';

// ==========================================================================
// Supabase Configuration
// ==========================================================================
// Users can provide their credentials directly here OR via the in-browser config modal (saved to localStorage)
const DEFAULT_SUPABASE_URL = "https://dbsliiczdyqdhawfnttt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_xZkqB_rnnhet53aeiGrDcA_BR1OexrV";

// Allow saved credentials in localStorage to override defaults
const STORED_URL = typeof localStorage !== 'undefined' ? localStorage.getItem("trekintel_supabase_url") : null;
const STORED_KEY = typeof localStorage !== 'undefined' ? localStorage.getItem("trekintel_supabase_anon_key") : null;

export const SUPABASE_URL = (STORED_URL && STORED_URL.trim()) ? STORED_URL.trim() : DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = (STORED_KEY && STORED_KEY.trim()) ? STORED_KEY.trim() : DEFAULT_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase credentials have been configured
 * Returns false when placeholder values are present, activating local demo mode.
 */
export function isSupabaseConfigured() {
  const url = (SUPABASE_URL || "").trim();
  const key = (SUPABASE_ANON_KEY || "").trim();

  const isPlaceholderUrl = !url ||
    url.includes("your-project-url") ||
    url.includes("your-project-id") ||
    url === "https://";

  const isPlaceholderKey = !key ||
    key === "YOUR_SUPABASE_PUBLISHABLE_KEY" ||
    key === "YOUR_SUPABASE_ANON_KEY" ||
    key.includes("YOUR_") ||
    key.length < 20;

  return Boolean(
    url &&
    key &&
    url.startsWith("https://") &&
    !isPlaceholderUrl &&
    !isPlaceholderKey
  );
}

// Client singleton
let supabaseClient = null;

/**
 * Ensures the Supabase SDK CDN script is loaded into the browser window
 */
export async function ensureSupabaseLoaded() {
  if (typeof window === "undefined") return false;
  if (window.supabase && typeof window.supabase.createClient === "function") return true;

  return new Promise((resolve) => {
    if (window.supabase) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="supabase-js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.supabase)));
      existing.addEventListener('error', () => resolve(false));
      setTimeout(() => resolve(Boolean(window.supabase)), 2000);
    } else {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => resolve(Boolean(window.supabase));
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    }
  });
}

/**
 * Returns the initialized Supabase client instance when configured, or null in demo mode
 */
export function getSupabase() {
  if (!supabaseClient && isSupabaseConfigured()) {
    if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
      }
    } else {
      console.warn("Supabase JS library CDN is not loaded yet or unavailable.");
    }
  }
  return supabaseClient;
}

// ==========================================================================
// Local Storage Simulation Helper (Active when Supabase is unconfigured)
// ==========================================================================
const LOCAL_STORAGE_KEY_TREKS = "trekintel_local_treks";
const LOCAL_STORAGE_KEY_FAVS = "trekintel_local_favourites";

function getLocalStoredTreks() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TREKS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_TREKS, JSON.stringify(SAMPLE_TREKS));
      return SAMPLE_TREKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return SAMPLE_TREKS;
  }
}

function saveLocalStoredTreks(treks) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TREKS, JSON.stringify(treks));
  } catch (e) {
    console.error("Failed to save local treks:", e);
  }
}

function getLocalStoredFavourites() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FAVS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalStoredFavourites(favs) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_FAVS, JSON.stringify(favs));
  } catch (e) {
    console.error("Failed to save local favourites:", e);
  }
}

// ==========================================================================
// Treks CRUD Operations
// ==========================================================================

/**
 * Fetch all public treks
 */
export async function getPublicTreks() {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('treks')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // If table is empty in Supabase, return sample dataset for an engaging experience
      return data && data.length > 0 ? data : SAMPLE_TREKS;
    } catch (err) {
      console.warn("Supabase query error, falling back to local dataset:", err.message);
      return getLocalStoredTreks().filter(t => t.is_public !== false);
    }
  }

  // Fallback to local dataset
  return getLocalStoredTreks().filter(t => t.is_public !== false);
}

/**
 * Fetch a single trek by ID
 */
export async function getTrekById(id) {
  if (!id) return null;
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb
        .from('treks')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn("Supabase fetch trek error, falling back to local:", err.message);
    }
  }

  // Fallback to local data
  const localList = getLocalStoredTreks();
  return localList.find(t => String(t.id) === String(id)) || null;
}

/**
 * Fetch treks created by a specific authenticated user
 */
export async function getUserTreks(userId) {
  if (!userId) return [];
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb
        .from('treks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn("Supabase user treks error, checking local store:", err.message);
    }
  }

  // Local fallback
  const localList = getLocalStoredTreks();
  return localList.filter(t => t.user_id === userId);
}

/**
 * Create a new trek record
 */
export async function createTrek(trekData) {
  const sb = getSupabase();

  if (sb) {
    const { data, error } = await sb
      .from('treks')
      .insert([trekData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local preview creation
  const localList = getLocalStoredTreks();
  const newTrek = {
    ...trekData,
    id: "local-" + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  localList.unshift(newTrek);
  saveLocalStoredTreks(localList);
  return newTrek;
}

/**
 * Update an existing trek record
 */
export async function updateTrek(id, updates) {
  const sb = getSupabase();

  if (sb) {
    const { data, error } = await sb
      .from('treks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local fallback
  const localList = getLocalStoredTreks();
  const idx = localList.findIndex(t => String(t.id) === String(id));
  if (idx !== -1) {
    localList[idx] = { ...localList[idx], ...updates, updated_at: new Date().toISOString() };
    saveLocalStoredTreks(localList);
    return localList[idx];
  }
  throw new Error("Trek not found");
}

/**
 * Delete a trek record
 */
export async function deleteTrek(id) {
  const sb = getSupabase();

  if (sb) {
    const { error } = await sb
      .from('treks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Local fallback
  let localList = getLocalStoredTreks();
  localList = localList.filter(t => String(t.id) !== String(id));
  saveLocalStoredTreks(localList);
  return true;
}

// ==========================================================================
// Favourites Operations
// ==========================================================================

/**
 * Fetch all saved favourites for a user
 */
export async function getUserFavourites(userId) {
  if (!userId) return [];
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb
        .from('favourites')
        .select(`
          id,
          created_at,
          trek_id,
          treks (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        favourite_id: item.id,
        ...item.treks
      })).filter(t => t && t.id);
    } catch (err) {
      console.warn("Supabase favourites error, checking local store:", err.message);
    }
  }

  // Local fallback
  const localFavs = getLocalStoredFavourites();
  const userFavIds = localFavs
    .filter(f => f.user_id === userId)
    .map(f => String(f.trek_id));

  const allTreks = getLocalStoredTreks();
  return allTreks.filter(t => userFavIds.includes(String(t.id)));
}

/**
 * Check if a trek is in user favourites
 */
export async function isTrekFavourited(userId, trekId) {
  if (!userId || !trekId) return false;
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb
        .from('favourites')
        .select('id')
        .eq('user_id', userId)
        .eq('trek_id', trekId)
        .maybeSingle();

      if (!error && data) return true;
      return false;
    } catch (err) {
      console.warn("Supabase isFavourited error:", err.message);
    }
  }

  const localFavs = getLocalStoredFavourites();
  return localFavs.some(f => f.user_id === userId && String(f.trek_id) === String(trekId));
}

/**
 * Add a trek to user favourites
 */
export async function addFavourite(userId, trekId) {
  if (!userId || !trekId) throw new Error("Missing user ID or trek ID");
  const sb = getSupabase();

  if (sb) {
    const { data, error } = await sb
      .from('favourites')
      .insert([{ user_id: userId, trek_id: trekId }])
      .select()
      .single();

    if (error && error.code !== '23505') { // ignore duplicate key constraint
      throw error;
    }
    return data;
  }

  const localFavs = getLocalStoredFavourites();
  if (!localFavs.some(f => f.user_id === userId && String(f.trek_id) === String(trekId))) {
    localFavs.push({
      id: "fav-" + Date.now(),
      user_id: userId,
      trek_id: trekId,
      created_at: new Date().toISOString()
    });
    saveLocalStoredFavourites(localFavs);
  }
  return true;
}

/**
 * Remove a trek from user favourites
 */
export async function removeFavourite(userId, trekId) {
  if (!userId || !trekId) return false;
  const sb = getSupabase();

  if (sb) {
    const { error } = await sb
      .from('favourites')
      .delete()
      .eq('user_id', userId)
      .eq('trek_id', trekId);

    if (error) throw error;
    return true;
  }

  let localFavs = getLocalStoredFavourites();
  localFavs = localFavs.filter(f => !(f.user_id === userId && String(f.trek_id) === String(trekId)));
  saveLocalStoredFavourites(localFavs);
  return true;
}

// ==========================================================================
// User Profile Helpers
// ==========================================================================

export async function getUserProfile(userId) {
  if (!userId) return null;
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn("Supabase profile fetch error:", err.message);
    }
  }

  // Fallback to localStorage session profile
  const stored = localStorage.getItem("trekintel_demo_profile");
  return stored ? JSON.parse(stored) : null;
}

export async function updateUserProfile(userId, updates) {
  if (!userId) throw new Error("User ID required");
  const sb = getSupabase();

  if (sb) {
    const { data, error } = await sb
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const profile = { id: userId, ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem("trekintel_demo_profile", JSON.stringify(profile));
  return profile;
}
