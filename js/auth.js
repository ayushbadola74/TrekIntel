/**
 * TrekIntel — Authentication Management
 * Handles Supabase Auth (Sign Up, Sign In, Sign Out, Password Reset, Route Protection, Nav State)
 */

import { getSupabase, isSupabaseConfigured, updateUserProfile } from './supabase.js';
import { showToast, escapeHtml } from './utils.js';

const DEMO_USER_STORAGE_KEY = "trekintel_demo_user";

/**
 * Get current session user
 */
export async function getCurrentUser() {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { session }, error } = await sb.auth.getSession();
      if (!error && session && session.user) {
        return {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          createdAt: session.user.created_at,
          isDemo: false
        };
      }
    } catch (e) {
      console.warn("Error getting Supabase session:", e);
    }
  }

  // Fallback to local demo user
  const demoRaw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
  if (demoRaw) {
    try {
      return JSON.parse(demoRaw);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Register a new user
 */
export async function signUpUser(email, password, fullName) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim()
        }
      }
    });

    if (error) throw error;

    // Check if email confirmation is required
    const session = data?.session;
    const user = data?.user;

    if (user && !session) {
      return {
        user,
        requiresConfirmation: true,
        message: "Registration successful! Please check your email inbox to verify your account before logging in."
      };
    }

    // Attempt profile creation
    if (user) {
      try {
        await updateUserProfile(user.id, { full_name: fullName.trim() });
      } catch (err) {
        console.warn("Could not auto-create profile row:", err);
      }
    }

    return {
      user,
      requiresConfirmation: false,
      message: "Account created successfully!"
    };
  }

  // Local demo signup simulation (when Supabase credentials are not yet entered)
  const demoUser = {
    id: "demo-user-" + Date.now(),
    email: email.trim(),
    fullName: fullName.trim() || email.split('@')[0],
    createdAt: new Date().toISOString(),
    isDemo: true
  };
  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));

  return {
    user: demoUser,
    requiresConfirmation: false,
    message: "Demo account created! (Configure Supabase credentials in settings to enable live cloud authentication)."
  };
}

/**
 * Sign in an existing user
 */
export async function signInUser(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    return data.user;
  }

  // Local demo sign in simulation
  const demoUser = {
    id: "demo-user-1",
    email: email.trim(),
    fullName: email.split('@')[0],
    createdAt: new Date().toISOString(),
    isDemo: true
  };
  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
  return demoUser;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
  }

  localStorage.removeItem(DEMO_USER_STORAGE_KEY);
  showToast("You have been signed out.", "info");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 400);
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email) {
  if (!email) throw new Error("Please enter your account email address.");

  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/html/profile.html'
    });
    if (error) throw error;
    return true;
  }

  // Mock message if unconfigured
  return true;
}

/**
 * Require authentication on protected pages
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    showToast("Please sign in to access your trekking portal.", "warning");
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
    }, 500);
    return null;
  }
  return user;
}

/**
 * Dynamically updates header navigation on any page depending on auth status
 */
export async function initAuthNav() {
  const navActions = document.getElementById("nav-auth-actions");
  if (!navActions) return;

  const user = await getCurrentUser();

  if (user) {
    const initials = (user.fullName || user.email || "T")
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    navActions.innerHTML = `
      <div class="user-menu-wrapper" id="user-menu-wrapper">
        <button class="user-avatar-btn" id="user-menu-btn" aria-expanded="false" aria-label="User navigation menu">
          <div class="avatar-circle">${escapeHtml(initials)}</div>
          <span class="user-name-label">${escapeHtml(user.fullName || "Trekker")}</span>
          <i data-lucide="chevron-down" style="width: 16px; height: 16px; color: var(--color-text-muted);"></i>
        </button>
        <div class="user-dropdown" id="user-dropdown-menu">
          <a href="dashboard.html" class="dropdown-item">
            <i data-lucide="layout-dashboard" style="width: 16px; height: 16px;"></i>
            <span>Dashboard</span>
          </a>
          <a href="my-treks.html" class="dropdown-item">
            <i data-lucide="compass" style="width: 16px; height: 16px;"></i>
            <span>My Treks</span>
          </a>
          <a href="favorites.html" class="dropdown-item">
            <i data-lucide="bookmark" style="width: 16px; height: 16px;"></i>
            <span>Saved Treks</span>
          </a>
          <a href="manage-trek.html" class="dropdown-item">
            <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i>
            <span>Add New Trek</span>
          </a>
          <a href="profile.html" class="dropdown-item">
            <i data-lucide="user" style="width: 16px; height: 16px;"></i>
            <span>My Profile</span>
          </a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" id="dropdown-logout-btn" style="width: 100%; border: none; background: none; cursor: pointer;">
            <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;

    const menuBtn = document.getElementById("user-menu-btn");
    const dropdown = document.getElementById("user-dropdown-menu");
    const logoutBtn = document.getElementById("dropdown-logout-btn");

    if (menuBtn && dropdown) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", isOpen);
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest("#user-menu-wrapper")) {
          dropdown.classList.remove("open");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await signOutUser();
      });
    }
  } else {
    // Unauthenticated user
    navActions.innerHTML = `
      <a href="login.html" class="btn btn-ghost btn-sm">Login</a>
      <a href="signup.html" class="btn btn-primary btn-sm">Get Started</a>
    `;
  }

  // Refresh lucide icons
  if (window.lucide) {
    window.lucide.createIcons({ root: navActions });
  }
}
