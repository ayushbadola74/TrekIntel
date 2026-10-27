/**
 * TrekIntel — My Treks Controller
 * Displays, filters, and manages CRUD operations for treks created by the authenticated user
 */

import { requireAuth } from './auth.js';
import { getUserTreks, deleteTrek } from './supabase.js';
import { showToast, showConfirmModal, escapeHtml, formatAltitude, formatDuration, getDifficultyBadgeClass } from './utils.js';

let myTreksList = [];
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await loadUserTreks();
  setupSearch();
});

async function loadUserTreks() {
  const container = document.getElementById("my-treks-container");
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; padding: var(--space-8); text-align: center;">
      <div class="skeleton" style="height: 120px; max-width: 600px; margin: 0 auto; border-radius: var(--radius-lg);"></div>
    </div>
  `;

  try {
    myTreksList = await getUserTreks(currentUser.id);
    renderTreks(myTreksList);
  } catch (err) {
    console.error("Error loading user treks:", err);
    container.innerHTML = `
      <div class="alert alert-danger" style="grid-column: 1 / -1;">
        <div class="alert-icon"><i data-lucide="alert-circle"></i></div>
        <div class="alert-content">
          <div class="alert-title">Unable to load your treks</div>
          <div>${escapeHtml(err.message)}</div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: container });
  }
}

function setupSearch() {
  const searchInput = document.getElementById("my-treks-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      renderTreks(myTreksList);
      return;
    }

    const filtered = myTreksList.filter(t =>
      (t.name || "").toLowerCase().includes(query) ||
      (t.location || "").toLowerCase().includes(query) ||
      (t.description || "").toLowerCase().includes(query)
    );
    renderTreks(filtered);
  });
}

function renderTreks(treks) {
  const container = document.getElementById("my-treks-container");
  const countEl = document.getElementById("my-treks-count");
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${treks.length} ${treks.length === 1 ? 'Record' : 'Records'}`;
  }

  if (treks.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i data-lucide="map-pin"></i></div>
        <h3 class="empty-state-title">No Treks Logged Yet</h3>
        <p class="empty-state-text">You haven't added any Himalayan treks or expeditions to your account.</p>
        <a href="manage-trek.html" class="btn btn-primary btn-sm">Add New Trek</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: container });
    return;
  }

  container.innerHTML = treks.map(trek => {
    const badgeClass = getDifficultyBadgeClass(trek.difficulty);
    const imageUrl = trek.image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";

    return `
      <div class="trek-card" id="trek-card-${escapeHtml(trek.id)}">
        <div class="trek-card-media" style="aspect-ratio: 16/10;">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(trek.name)}" class="trek-card-img" />
          <div class="trek-card-overlay"></div>
          <div class="trek-card-top-badges">
            <span class="badge ${badgeClass}">${escapeHtml(trek.difficulty || "Moderate")}</span>
            <span class="badge ${trek.is_public ? 'badge-easy' : 'badge-neutral'}">
              ${trek.is_public ? 'Public Trail' : 'Private Record'}
            </span>
          </div>
        </div>

        <div class="trek-card-body">
          <div class="trek-card-location">
            <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
            <span>${escapeHtml(trek.location || "Uttarakhand, Himalayas")}</span>
          </div>

          <h3 class="trek-card-title">
            <a href="trek-details.html?id=${encodeURIComponent(trek.id)}">${escapeHtml(trek.name)}</a>
          </h3>

          <p class="trek-card-desc">${escapeHtml(trek.description || "No description provided.")}</p>

          <div class="trek-card-stats">
            <div class="card-stat-item">
              <div class="card-stat-icon"><i data-lucide="mountain" style="width: 16px; height: 16px;"></i></div>
              <div class="card-stat-info">
                <span class="card-stat-label">Elevation</span>
                <span class="card-stat-val">${formatAltitude(trek.altitude_m)}</span>
              </div>
            </div>

            <div class="card-stat-item">
              <div class="card-stat-icon"><i data-lucide="clock" style="width: 16px; height: 16px;"></i></div>
              <div class="card-stat-info">
                <span class="card-stat-label">Duration</span>
                <span class="card-stat-val">${formatDuration(trek.duration_days)}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: var(--space-2); margin-top: auto; padding-top: var(--space-3); border-top: 1px solid var(--color-border);">
            <a href="manage-trek.html?id=${encodeURIComponent(trek.id)}" class="btn btn-secondary btn-sm" style="flex: 1;" title="Edit this trek">
              <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
              <span>Edit</span>
            </a>
            <button class="btn btn-outline-danger btn-sm delete-trek-btn" data-id="${escapeHtml(trek.id)}" data-name="${escapeHtml(trek.name)}" title="Delete this trek">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
            <a href="trek-details.html?id=${encodeURIComponent(trek.id)}" class="btn btn-ghost btn-sm" title="View details">
              <i data-lucide="external-link" style="width: 15px; height: 15px;"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Attach delete handlers with confirmation dialog
  container.querySelectorAll(".delete-trek-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const trekId = btn.getAttribute("data-id");
      const trekName = btn.getAttribute("data-name");

      showConfirmModal({
        title: "Delete Trekking Record",
        message: `Are you sure you want to permanently delete "${trekName}"? This action cannot be undone.`,
        confirmText: "Delete Trek",
        cancelText: "Keep Record",
        isDanger: true,
        onConfirm: async () => {
          try {
            await deleteTrek(trekId);
            showToast(`"${trekName}" was deleted.`, "info");
            myTreksList = myTreksList.filter(t => String(t.id) !== String(trekId));
            renderTreks(myTreksList);
          } catch (err) {
            showToast("Failed to delete trek: " + err.message, "error");
          }
        }
      });
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
