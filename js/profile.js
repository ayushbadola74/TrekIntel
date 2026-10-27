/**
 * TrekIntel — User Profile Controller
 * Displays user identity, updates display name, sends password reset, and manages session
 */

import { requireAuth, signOutUser, requestPasswordReset } from './auth.js';
import { getUserProfile, updateUserProfile } from './supabase.js';
import { showToast, escapeHtml } from './utils.js';

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await loadUserProfile();
  setupProfileForm();
  setupPasswordReset();
  setupSignOut();
});

async function loadUserProfile() {
  const avatarEl = document.getElementById("profile-large-avatar");
  const nameEl = document.getElementById("profile-display-name");
  const emailEl = document.getElementById("profile-email-address");
  const createdEl = document.getElementById("profile-created-date");
  const nameInput = document.getElementById("profile-name-input");
  const emailInput = document.getElementById("profile-email-input");

  let profileData = null;
  try {
    profileData = await getUserProfile(currentUser.id);
  } catch (e) {
    console.warn("Could not fetch profile record:", e);
  }

  const fullName = profileData?.full_name || currentUser.fullName || currentUser.email.split('@')[0];
  const email = currentUser.email;
  const createdAt = profileData?.created_at || currentUser.createdAt || new Date().toISOString();

  if (avatarEl) {
    const initials = fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    avatarEl.textContent = initials;
  }

  if (nameEl) nameEl.textContent = fullName;
  if (emailEl) emailEl.textContent = email;
  if (nameInput) nameInput.value = fullName;
  if (emailInput) emailInput.value = email;

  if (createdEl) {
    const dateFormatted = new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    createdEl.textContent = `Member since ${dateFormatted}`;
  }
}

function setupProfileForm() {
  const form = document.getElementById("profile-update-form");
  const saveBtn = document.getElementById("profile-save-btn");
  if (!form || !saveBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("profile-name-input");
    const newName = nameInput.value.trim();

    if (!newName || newName.length < 2) {
      showToast("Please enter a valid display name (at least 2 characters).", "warning");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Saving...</span>`;

    try {
      await updateUserProfile(currentUser.id, { full_name: newName });
      currentUser.fullName = newName;

      showToast("Profile display name updated successfully!", "success");
      await loadUserProfile();
    } catch (err) {
      showToast("Failed to update profile: " + err.message, "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>Save Changes</span>`;
    }
  });
}

function setupPasswordReset() {
  const resetBtn = document.getElementById("profile-reset-password-btn");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", async () => {
    resetBtn.disabled = true;
    resetBtn.innerHTML = `<span>Sending email...</span>`;

    try {
      await requestPasswordReset(currentUser.email);
      showToast(`Password reset link sent to ${currentUser.email}`, "success");
    } catch (err) {
      showToast("Error requesting password reset: " + err.message, "error");
    } finally {
      resetBtn.disabled = false;
      resetBtn.innerHTML = `<span>Request Password Reset Email</span>`;
    }
  });
}

function setupSignOut() {
  const logoutBtn = document.getElementById("profile-signout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    await signOutUser();
  });
}
