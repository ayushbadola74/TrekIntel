/**
 * TrekIntel — Saved Favourites Controller
 * Displays and manages the user's saved Himalayan treks
 */

import { requireAuth } from './auth.js';
import { getUserFavourites, removeFavourite } from './supabase.js';
import { showToast, escapeHtml, formatAltitude, formatDuration, getDifficultyBadgeClass } from './utils.js';

let currentUser = null;
let savedFavourites = [];

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await loadFavourites();
});

async function loadFavourites() {
  const container = document.getElementById("favorites-grid");
  const countEl = document.getElementById("favorites-count");
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; padding: var(--space-8); text-align: center;">
      <div class="skeleton" style="height: 140px; max-width: 600px; margin: 0 auto; border-radius: var(--radius-lg);"></div>
    </div>
  `;

  try {
    savedFavourites = await getUserFavourites(currentUser.id);

    if (countEl) {
      countEl.textContent = `${savedFavourites.length} ${savedFavourites.length === 1 ? 'Saved Trek' : 'Saved Treks'}`;
    }

    if (savedFavourites.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon"><i data-lucide="bookmark"></i></div>
          <h3 class="empty-state-title">No Saved Treks Yet</h3>
          <p class="empty-state-text">You haven't bookmarked any Himalayan expeditions. Browse destinations and click the bookmark icon to save them here.</p>
          <a href="explore.html" class="btn btn-primary btn-sm">Explore Himalayan Treks</a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: container });
      return;
    }

    container.innerHTML = savedFavourites.map(trek => {
      const badgeClass = getDifficultyBadgeClass(trek.difficulty);
      const imageUrl = trek.image_url || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80";

      return `
        <div class="trek-card" id="fav-card-${escapeHtml(trek.id)}">
          <div class="trek-card-media">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(trek.name)}" class="trek-card-img" />
            <div class="trek-card-overlay"></div>
            <div class="trek-card-top-badges">
              <span class="badge ${badgeClass}">${escapeHtml(trek.difficulty || "Moderate")}</span>
              <button class="card-fav-btn active remove-fav-btn" data-id="${escapeHtml(trek.id)}" data-name="${escapeHtml(trek.name)}" title="Remove from favourites">
                <i data-lucide="bookmark-x" style="width: 18px; height: 18px;"></i>
              </button>
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

            <p class="trek-card-desc">${escapeHtml(trek.description || "")}</p>

            <div class="trek-card-stats">
              <div class="card-stat-item">
                <div class="card-stat-icon"><i data-lucide="mountain" style="width: 16px; height: 16px;"></i></div>
                <div class="card-stat-info">
                  <span class="card-stat-label">Altitude</span>
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

            <div class="trek-card-footer">
              <a href="trek-details.html?id=${encodeURIComponent(trek.id)}" class="btn btn-secondary btn-sm" style="width: 100%;">
                <span>View Expedition Details</span>
                <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach remove handlers
    container.querySelectorAll(".remove-fav-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const trekId = btn.getAttribute("data-id");
        const trekName = btn.getAttribute("data-name");

        try {
          await removeFavourite(currentUser.id, trekId);
          showToast(`Removed "${trekName}" from favourites.`, "info");
          savedFavourites = savedFavourites.filter(t => String(t.id) !== String(trekId));
          loadFavourites();
        } catch (err) {
          showToast("Failed to remove favourite: " + err.message, "error");
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: container });
    }

  } catch (err) {
    console.error("Error loading favourites:", err);
    container.innerHTML = `
      <div class="alert alert-danger" style="grid-column: 1 / -1;">
        <div class="alert-icon"><i data-lucide="alert-circle"></i></div>
        <div class="alert-content">
          <div class="alert-title">Failed to load saved treks</div>
          <div>${escapeHtml(err.message)}</div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: container });
  }
}
