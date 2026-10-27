/**
 * TrekIntel — Explore Treks Controller
 * Handles search, multi-facet filtering, sorting, favorites toggle, and results rendering
 */

import { getPublicTreks, isTrekFavourited, addFavourite, removeFavourite } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { showToast, escapeHtml, formatAltitude, formatDuration, getDifficultyBadgeClass, getQueryParam } from './utils.js';

let allTreks = [];
let userFavorites = new Set();
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await getCurrentUser();
  await loadTreks();
  setupFilterListeners();
  applyInitialParams();
});

async function loadTreks() {
  const grid = document.getElementById("explore-treks-grid");
  const countEl = document.getElementById("results-count");

  if (!grid) return;

  // Render skeleton loaders
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="trek-card skeleton-card">
      <div style="height: 180px;" class="skeleton"></div>
      <div style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3);">
        <div style="height: 16px; width: 40%;" class="skeleton"></div>
        <div style="height: 24px; width: 75%;" class="skeleton"></div>
        <div style="height: 40px;" class="skeleton"></div>
        <div style="height: 38px; margin-top: auto;" class="skeleton"></div>
      </div>
    </div>
  `).join("");

  try {
    allTreks = await getPublicTreks();

    // Check user favorites if logged in
    if (currentUser) {
      for (const trek of allTreks) {
        const isFav = await isTrekFavourited(currentUser.id, trek.id);
        if (isFav) userFavorites.add(String(trek.id));
      }
    }

    renderFilteredTreks();
  } catch (err) {
    console.error("Error loading treks:", err);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i data-lucide="alert-triangle"></i></div>
        <h3 class="empty-state-title">Unable to Load Treks</h3>
        <p class="empty-state-text">There was an issue connecting to the database. Please try again later.</p>
        <button class="btn btn-primary btn-sm" onclick="window.location.reload()">Retry</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: grid });
  }
}

function setupFilterListeners() {
  const searchInput = document.getElementById("filter-search");
  const difficultySelect = document.getElementById("filter-difficulty");
  const durationSelect = document.getElementById("filter-duration");
  const sortSelect = document.getElementById("filter-sort");
  const clearBtn = document.getElementById("filter-clear-btn");
  const chips = document.querySelectorAll(".filter-chip");

  if (searchInput) searchInput.addEventListener("input", () => renderFilteredTreks());
  if (difficultySelect) difficultySelect.addEventListener("change", () => renderFilteredTreks());
  if (durationSelect) durationSelect.addEventListener("change", () => renderFilteredTreks());
  if (sortSelect) sortSelect.addEventListener("change", () => renderFilteredTreks());

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (difficultySelect) difficultySelect.value = "all";
      if (durationSelect) durationSelect.value = "all";
      if (sortSelect) sortSelect.value = "featured";

      chips.forEach(c => c.classList.remove("active"));
      const allChip = document.querySelector('.filter-chip[data-filter="all"]');
      if (allChip) allChip.classList.add("active");

      renderFilteredTreks();
    });
  }

  // Quick chips
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filterType = chip.getAttribute("data-filter");
      if (difficultySelect) {
        if (filterType === "easy" || filterType === "moderate" || filterType === "difficult") {
          difficultySelect.value = filterType;
        } else {
          difficultySelect.value = "all";
        }
      }

      renderFilteredTreks();
    });
  });
}

function applyInitialParams() {
  const queryDifficulty = getQueryParam("difficulty");
  const querySearch = getQueryParam("search");

  if (queryDifficulty) {
    const diffSelect = document.getElementById("filter-difficulty");
    if (diffSelect) diffSelect.value = queryDifficulty.toLowerCase();

    const matchedChip = document.querySelector(`.filter-chip[data-filter="${queryDifficulty.toLowerCase()}"]`);
    if (matchedChip) {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      matchedChip.classList.add("active");
    }
  }

  if (querySearch) {
    const searchInput = document.getElementById("filter-search");
    if (searchInput) searchInput.value = querySearch;
  }

  renderFilteredTreks();
}

function renderFilteredTreks() {
  const grid = document.getElementById("explore-treks-grid");
  const countEl = document.getElementById("results-count");
  if (!grid) return;

  const searchVal = (document.getElementById("filter-search")?.value || "").toLowerCase().trim();
  const difficultyVal = document.getElementById("filter-difficulty")?.value || "all";
  const durationVal = document.getElementById("filter-duration")?.value || "all";
  const sortVal = document.getElementById("filter-sort")?.value || "featured";

  // Filter
  let filtered = allTreks.filter(trek => {
    // Search
    if (searchVal) {
      const matchName = (trek.name || "").toLowerCase().includes(searchVal);
      const matchLoc = (trek.location || "").toLowerCase().includes(searchVal);
      const matchDesc = (trek.description || "").toLowerCase().includes(searchVal);
      if (!matchName && !matchLoc && !matchDesc) return false;
    }

    // Difficulty
    if (difficultyVal !== "all") {
      if ((trek.difficulty || "").toLowerCase() !== difficultyVal.toLowerCase()) {
        return false;
      }
    }

    // Duration
    if (durationVal !== "all") {
      const days = Number(trek.duration_days) || 0;
      if (durationVal === "1-3" && (days < 1 || days > 3)) return false;
      if (durationVal === "4-6" && (days < 4 || days > 6)) return false;
      if (durationVal === "7+" && days < 7) return false;
    }

    return true;
  });

  // Sort
  if (sortVal === "alt-desc") {
    filtered.sort((a, b) => (Number(b.altitude_m) || 0) - (Number(a.altitude_m) || 0));
  } else if (sortVal === "alt-asc") {
    filtered.sort((a, b) => (Number(a.altitude_m) || 0) - (Number(b.altitude_m) || 0));
  } else if (sortVal === "dur-asc") {
    filtered.sort((a, b) => (Number(a.duration_days) || 0) - (Number(b.duration_days) || 0));
  } else if (sortVal === "dur-desc") {
    filtered.sort((a, b) => (Number(b.duration_days) || 0) - (Number(a.duration_days) || 0));
  } else if (sortVal === "name-asc") {
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  // Update count
  if (countEl) {
    countEl.textContent = `${filtered.length} Himalayan ${filtered.length === 1 ? 'Trek' : 'Treks'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon"><i data-lucide="compass"></i></div>
        <h3 class="empty-state-title">No Matching Himalayan Treks Found</h3>
        <p class="empty-state-text">Try adjusting your filters, clearing your search keywords, or selecting another difficulty level.</p>
        <button class="btn btn-secondary btn-sm" id="empty-clear-btn">Clear All Filters</button>
      </div>
    `;
    const clearBtn = document.getElementById("empty-clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        document.getElementById("filter-clear-btn")?.click();
      });
    }
    if (window.lucide) window.lucide.createIcons({ root: grid });
    return;
  }

  // Render cards
  grid.innerHTML = filtered.map(trek => {
    const isFav = userFavorites.has(String(trek.id));
    const badgeClass = getDifficultyBadgeClass(trek.difficulty);
    const imageUrl = trek.image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";

    return `
      <div class="trek-card" data-trek-id="${escapeHtml(trek.id)}">
        <div class="trek-card-media">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(trek.name)}" class="trek-card-img" loading="lazy" />
          <div class="trek-card-overlay"></div>
          <div class="trek-card-top-badges">
            <span class="badge ${badgeClass}">${escapeHtml(trek.difficulty || "Moderate")}</span>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-id="${escapeHtml(trek.id)}" aria-label="Save to favourites">
              <i data-lucide="bookmark" style="width: 18px; height: 18px;"></i>
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
              <div class="card-stat-icon">
                <i data-lucide="mountain" style="width: 16px; height: 16px;"></i>
              </div>
              <div class="card-stat-info">
                <span class="card-stat-label">Altitude</span>
                <span class="card-stat-val">${formatAltitude(trek.altitude_m)}</span>
              </div>
            </div>

            <div class="card-stat-item">
              <div class="card-stat-icon">
                <i data-lucide="clock" style="width: 16px; height: 16px;"></i>
              </div>
              <div class="card-stat-info">
                <span class="card-stat-label">Duration</span>
                <span class="card-stat-val">${formatDuration(trek.duration_days)}</span>
              </div>
            </div>
          </div>

          <div class="trek-card-footer">
            <a href="trek-details.html?id=${encodeURIComponent(trek.id)}" class="btn btn-secondary btn-sm" style="width: 100%;">
              <span>View Trail Details</span>
              <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Bind favorite buttons
  grid.querySelectorAll(".card-fav-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const trekId = btn.getAttribute("data-id");

      if (!currentUser) {
        showToast("Please log in to save this trek to your favourites.", "warning");
        setTimeout(() => {
          window.location.href = `login.html?redirect=explore.html`;
        }, 800);
        return;
      }

      const isFav = userFavorites.has(String(trekId));

      try {
        if (isFav) {
          await removeFavourite(currentUser.id, trekId);
          userFavorites.delete(String(trekId));
          btn.classList.remove("active");
          showToast("Removed from saved favourites.", "info");
        } else {
          await addFavourite(currentUser.id, trekId);
          userFavorites.add(String(trekId));
          btn.classList.add("active");
          showToast("Saved to your favourites!", "success");
        }
      } catch (err) {
        showToast("Could not update favourites: " + err.message, "error");
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: grid });
  }
}
