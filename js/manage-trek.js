/**
 * TrekIntel — Manage Trek Controller (Add / Edit Form)
 * Handles client validation, coordinate presets, image presets, and persistence
 */

import { requireAuth } from './auth.js';
import { getTrekById, createTrek, updateTrek } from './supabase.js';
import { COORDINATE_PRESETS, IMAGE_PRESETS, showToast, escapeHtml, getQueryParam } from './utils.js';

let currentUser = null;
let editingTrekId = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  editingTrekId = getQueryParam("id");

  setupPresetButtons();
  setupImagePreview();

  if (editingTrekId) {
    await loadExistingTrek(editingTrekId);
  }

  setupFormSubmission();
});

function setupPresetButtons() {
  const container = document.getElementById("coordinate-presets-container");
  if (!container) return;

  container.innerHTML = COORDINATE_PRESETS.map(preset => `
    <button type="button" class="preset-pill" data-name="${escapeHtml(preset.name)}">
      ${escapeHtml(preset.name)}
    </button>
  `).join("");

  container.querySelectorAll(".preset-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const matched = COORDINATE_PRESETS.find(p => p.name === name);
      if (matched) {
        const nameInput = document.getElementById("trek-name");
        const locInput = document.getElementById("trek-location");
        const latInput = document.getElementById("trek-latitude");
        const lonInput = document.getElementById("trek-longitude");
        const altInput = document.getElementById("trek-altitude");
        const durInput = document.getElementById("trek-duration");
        const diffSelect = document.getElementById("trek-difficulty");

        if (!nameInput.value || nameInput.value.length < 3) nameInput.value = matched.name;
        locInput.value = matched.loc;
        latInput.value = matched.lat;
        lonInput.value = matched.lon;
        altInput.value = matched.alt;
        durInput.value = matched.dur;
        if (diffSelect) diffSelect.value = matched.diff;

        showToast(`Autofilled coordinates for ${matched.name}`, "info");
      }
    });
  });
}

function setupImagePreview() {
  const imgInput = document.getElementById("trek-image-url");
  const previewImg = document.getElementById("image-preview-thumbnail");
  const presetsContainer = document.getElementById("image-presets-container");

  if (presetsContainer) {
    presetsContainer.innerHTML = IMAGE_PRESETS.map((url, idx) => `
      <img src="${url}" class="preset-pill" style="width: 48px; height: 32px; object-fit: cover; padding: 0;" data-url="${url}" alt="Preset ${idx+1}" />
    `).join("");

    presetsContainer.querySelectorAll("img").forEach(thumb => {
      thumb.addEventListener("click", () => {
        const url = thumb.getAttribute("data-url");
        if (imgInput) {
          imgInput.value = url;
          if (previewImg) {
            previewImg.src = url;
            previewImg.style.display = "block";
          }
        }
      });
    });
  }

  if (imgInput && previewImg) {
    imgInput.addEventListener("input", () => {
      const url = imgInput.value.trim();
      if (url.startsWith("http")) {
        previewImg.src = url;
        previewImg.style.display = "block";
      } else {
        previewImg.style.display = "none";
      }
    });
  }
}

async function loadExistingTrek(id) {
  const pageTitle = document.getElementById("manage-trek-page-title");
  const submitBtn = document.getElementById("submit-trek-btn");

  if (pageTitle) pageTitle.textContent = "Edit Himalayan Trek";
  if (submitBtn) submitBtn.innerHTML = `<span>Update Trekking Record</span><i data-lucide="check" style="width: 16px; height: 16px;"></i>`;

  try {
    const trek = await getTrekById(id);
    if (!trek) {
      showToast("Trek record not found.", "error");
      setTimeout(() => window.location.href = "my-treks.html", 1000);
      return;
    }

    // Populate form
    document.getElementById("trek-name").value = trek.name || "";
    document.getElementById("trek-location").value = trek.location || "";
    document.getElementById("trek-difficulty").value = trek.difficulty || "Moderate";
    document.getElementById("trek-duration").value = trek.duration_days || "";
    document.getElementById("trek-altitude").value = trek.altitude_m || "";
    document.getElementById("trek-latitude").value = trek.latitude || "";
    document.getElementById("trek-longitude").value = trek.longitude || "";
    document.getElementById("trek-description").value = trek.description || "";
    document.getElementById("trek-image-url").value = trek.image_url || "";
    document.getElementById("trek-visibility").checked = Boolean(trek.is_public);

    const previewImg = document.getElementById("image-preview-thumbnail");
    if (previewImg && trek.image_url) {
      previewImg.src = trek.image_url;
      previewImg.style.display = "block";
    }

    if (window.lucide) window.lucide.createIcons();

  } catch (err) {
    showToast("Error loading trek: " + err.message, "error");
  }
}

function setupFormSubmission() {
  const form = document.getElementById("manage-trek-form");
  const submitBtn = document.getElementById("submit-trek-btn");
  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("trek-name").value.trim();
    const location = document.getElementById("trek-location").value.trim();
    const difficulty = document.getElementById("trek-difficulty").value;
    const durationDays = parseInt(document.getElementById("trek-duration").value, 10);
    const altitudeM = document.getElementById("trek-altitude").value ? parseInt(document.getElementById("trek-altitude").value, 10) : null;
    const latitude = document.getElementById("trek-latitude").value ? parseFloat(document.getElementById("trek-latitude").value) : null;
    const longitude = document.getElementById("trek-longitude").value ? parseFloat(document.getElementById("trek-longitude").value) : null;
    const description = document.getElementById("trek-description").value.trim();
    const imageUrl = document.getElementById("trek-image-url").value.trim() || null;
    const isPublic = document.getElementById("trek-visibility").checked;

    // Client Validation
    if (!name || name.length < 3) {
      showToast("Please enter a valid trek name (at least 3 characters).", "warning");
      document.getElementById("trek-name").focus();
      return;
    }

    if (!location) {
      showToast("Please specify the trailhead location or district in Uttarakhand.", "warning");
      document.getElementById("trek-location").focus();
      return;
    }

    if (isNaN(durationDays) || durationDays < 1 || durationDays > 60) {
      showToast("Please specify duration in days between 1 and 60.", "warning");
      document.getElementById("trek-duration").focus();
      return;
    }

    if (altitudeM !== null && (altitudeM < 200 || altitudeM > 8848)) {
      showToast("Peak altitude must be between 200m and 8,848m (Everest).", "warning");
      document.getElementById("trek-altitude").focus();
      return;
    }

    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      showToast("Latitude must be between -90 and +90 degrees.", "warning");
      document.getElementById("trek-latitude").focus();
      return;
    }

    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      showToast("Longitude must be between -180 and +180 degrees.", "warning");
      document.getElementById("trek-longitude").focus();
      return;
    }

    // Submit payload
    const trekPayload = {
      user_id: currentUser.id,
      name,
      location,
      difficulty,
      duration_days: durationDays,
      altitude_m: altitudeM,
      latitude,
      longitude,
      description,
      image_url: imageUrl,
      is_public: isPublic
    };

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Saving...</span>`;

    try {
      if (editingTrekId) {
        await updateTrek(editingTrekId, trekPayload);
        showToast("Trek successfully updated!", "success");
      } else {
        await createTrek(trekPayload);
        showToast("New Himalayan trek logged successfully!", "success");
      }

      setTimeout(() => {
        window.location.href = "my-treks.html";
      }, 700);

    } catch (err) {
      console.error("Save trek error:", err);
      showToast("Failed to save trek: " + err.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}
