/**
 * TrekIntel — Trek Details Controller
 * Loads trek information, initializes Leaflet interactive map, and fetches Open-Meteo live weather
 */

import { getTrekById, isTrekFavourited, addFavourite, removeFavourite } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { renderWeatherWidget } from './weather.js';
import { showToast, escapeHtml, formatAltitude, formatDuration, getDifficultyBadgeClass, getQueryParam } from './utils.js';

let currentTrek = null;
let currentUser = null;
let isFavourited = false;
let leafletMap = null;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await getCurrentUser();
  const trekId = getQueryParam("id") || "kedarkantha-summit";
  await loadTrekDetails(trekId);
});

async function loadTrekDetails(id) {
  const container = document.getElementById("trek-details-container");
  if (!container) return;

  try {
    currentTrek = await getTrekById(id);

    if (!currentTrek) {
      container.innerHTML = `
        <div class="empty-state" style="margin-top: var(--space-12);">
          <div class="empty-state-icon"><i data-lucide="compass"></i></div>
          <h2 class="empty-state-title">Trek Destination Not Found</h2>
          <p class="empty-state-text">The expedition trail you are looking for may have been archived or does not exist.</p>
          <a href="explore.html" class="btn btn-primary btn-sm">Explore All Treks</a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons({ root: container });
      return;
    }

    // Check favourite status
    if (currentUser) {
      isFavourited = await isTrekFavourited(currentUser.id, currentTrek.id);
    }

    renderTrekView(currentTrek);

    // Initialize Weather
    const weatherContainer = document.getElementById("details-weather-container");
    if (weatherContainer) {
      await renderWeatherWidget(weatherContainer, currentTrek.latitude, currentTrek.longitude, currentTrek.name);
    }

    // Initialize Map
    initTrekMap(currentTrek.latitude, currentTrek.longitude, currentTrek.name, currentTrek.location);

  } catch (err) {
    console.error("Error loading trek details:", err);
    container.innerHTML = `
      <div class="alert alert-danger" style="margin: var(--space-8) auto; max-width: 600px;">
        <div class="alert-icon"><i data-lucide="alert-circle"></i></div>
        <div class="alert-content">
          <div class="alert-title">Failed to load trek details</div>
          <div>${escapeHtml(err.message)}</div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: container });
  }
}

function renderTrekView(trek) {
  const container = document.getElementById("trek-details-container");
  if (!container) return;

  const badgeClass = getDifficultyBadgeClass(trek.difficulty);
  const imageUrl = trek.image_url || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";

  const highlights = Array.isArray(trek.highlights) && trek.highlights.length > 0
    ? trek.highlights
    : [
        "Sweeping Himalayan alpine panoramas",
        "Ancient oak, pine, and rhododendron woodlands",
        "High-altitude campsites with stellar night skies",
        "Rich Garhwal mountain culture and hospitable hamlets"
      ];

  container.innerHTML = `
    <!-- Hero Details Section -->
    <div style="position: relative; border-radius: var(--radius-2xl); overflow: hidden; margin-bottom: var(--space-8); box-shadow: var(--shadow-lg);">
      <div style="position: relative; height: 460px; background-color: var(--color-primary-dark);">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(trek.name)}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(16, 32, 25, 0.2) 0%, rgba(16, 32, 25, 0.88) 100%);"></div>

        <div style="position: absolute; top: var(--space-6); left: var(--space-6); right: var(--space-6); display: flex; justify-content: space-between; align-items: center; z-index: 5;">
          <a href="explore.html" class="btn btn-secondary btn-sm" style="backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.9);">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i>
            <span>Back to Treks</span>
          </a>

          <button id="details-fav-btn" class="btn btn-sm ${isFavourited ? 'btn-accent' : 'btn-secondary'}" style="backdrop-filter: blur(8px);">
            <i data-lucide="bookmark" style="width: 16px; height: 16px;"></i>
            <span>${isFavourited ? 'Saved in Favourites' : 'Add to Favourites'}</span>
          </button>
        </div>

        <div style="position: absolute; bottom: var(--space-8); left: var(--space-8); right: var(--space-8); z-index: 5; color: #FFFFFF;">
          <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-3); flex-wrap: wrap;">
            <span class="badge ${badgeClass}" style="font-size: 0.85rem; padding: 4px 14px;">${escapeHtml(trek.difficulty || "Moderate")}</span>
            <span class="badge badge-accent" style="font-size: 0.85rem; padding: 4px 14px;">${formatDuration(trek.duration_days)}</span>
            <span class="badge badge-neutral" style="font-size: 0.85rem; padding: 4px 14px; background: rgba(255, 255, 255, 0.2); color: #FFFFFF; border-color: rgba(255, 255, 255, 0.3);">Max Alt: ${formatAltitude(trek.altitude_m)}</span>
          </div>

          <h1 style="color: #FFFFFF; font-size: clamp(1.85rem, 4vw, 2.75rem); margin-bottom: var(--space-2);">${escapeHtml(trek.name)}</h1>

          <div style="display: flex; align-items: center; gap: var(--space-2); color: #D5E2DA; font-size: 1.05rem;">
            <i data-lucide="map-pin" style="color: var(--color-accent); width: 18px; height: 18px;"></i>
            <span>${escapeHtml(trek.location || "Uttarakhand, Himalayas")}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="stats-grid" style="margin-bottom: var(--space-10);">
      <div class="stat-card">
        <div class="stat-icon-wrapper"><i data-lucide="mountain"></i></div>
        <div class="stat-content">
          <span class="stat-title">Maximum Elevation</span>
          <span class="stat-number" style="font-size: 1.35rem;">${formatAltitude(trek.altitude_m)}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper"><i data-lucide="calendar"></i></div>
        <div class="stat-content">
          <span class="stat-title">Trek Duration</span>
          <span class="stat-number" style="font-size: 1.35rem;">${formatDuration(trek.duration_days)}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper"><i data-lucide="activity"></i></div>
        <div class="stat-content">
          <span class="stat-title">Difficulty Grade</span>
          <span class="stat-number" style="font-size: 1.35rem;">${escapeHtml(trek.difficulty || "Moderate")}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper"><i data-lucide="compass"></i></div>
        <div class="stat-content">
          <span class="stat-title">Himalayan Region</span>
          <span class="stat-number" style="font-size: 1.35rem;">${escapeHtml(trek.region || "Garhwal")}</span>
        </div>
      </div>
    </div>

    <!-- Main Content & Sidebar Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: var(--space-10); margin-bottom: var(--space-12);" class="trek-details-layout">
      <!-- Left Column: Overview, Highlights, Safety -->
      <div>
        <div class="dashboard-card" style="margin-bottom: var(--space-8);">
          <h2 style="font-size: 1.5rem; margin-bottom: var(--space-4); color: var(--color-primary-dark);">Expedition Overview</h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--color-text-secondary); white-space: pre-line; margin-bottom: var(--space-6);">
            ${escapeHtml(trek.description || "Detailed description for this Himalayan route will be updated shortly.")}
          </p>

          <h3 style="font-size: 1.2rem; margin-bottom: var(--space-3); color: var(--color-primary-dark);">Trail Highlights</h3>
          <ul style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-6);">
            ${highlights.map(h => `
              <li style="display: flex; align-items: flex-start; gap: var(--space-3); font-size: 0.95rem; color: var(--color-text-secondary);">
                <div style="width: 22px; height: 22px; border-radius: 50%; background-color: var(--color-primary-subtle); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                  <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                </div>
                <span>${escapeHtml(h)}</span>
              </li>
            `).join("")}
          </ul>

          <div class="alert alert-info" style="margin-bottom: 0;">
            <div class="alert-icon"><i data-lucide="info"></i></div>
            <div class="alert-content">
              <div class="alert-title">Best Season to Visit</div>
              <div>${escapeHtml(trek.best_season || "October through June depending on seasonal snowline and weather patterns.")}</div>
            </div>
          </div>
        </div>

        <!-- Interactive Map Section -->
        <div class="map-card-wrapper" style="margin-bottom: var(--space-8);">
          <div class="map-card-header">
            <div>
              <h3 class="map-title">Trailhead & Destination Coordinates</h3>
              <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0;">Leaflet OpenStreetMap Geospatial Reference</p>
            </div>
            ${trek.latitude && trek.longitude ? `
              <div class="map-coordinates-pill">
                ${Number(trek.latitude).toFixed(4)}°N, ${Number(trek.longitude).toFixed(4)}°E
              </div>
            ` : ''}
          </div>
          <div id="interactive-map" class="interactive-map"></div>
          <div style="padding: var(--space-3) var(--space-6); background: var(--color-surface-alt); border-top: 1px solid var(--color-border); font-size: 0.775rem; color: var(--color-text-muted);">
            * Note: Marker denotes the geographic trailhead destination. It does not represent an unguided navigation track.
          </div>
        </div>
      </div>

      <!-- Right Column: Live Weather & Essential Prep -->
      <div>
        <!-- Live Weather Box -->
        <div id="details-weather-container" style="margin-bottom: var(--space-8);"></div>

        <!-- Packing List / Quick Advisory -->
        <div class="dashboard-card">
          <h3 style="font-size: 1.25rem; margin-bottom: var(--space-4); color: var(--color-primary-dark);">Trailhead Preparation</h3>
          <ul style="display: flex; flex-direction: column; gap: var(--space-3); font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: var(--space-6);">
            <li style="display: flex; gap: var(--space-2);">
              <i data-lucide="check-circle" style="color: var(--color-success); width: 16px; height: 16px; flex-shrink: 0; margin-top: 3px;"></i>
              <span>High-ankle waterproof trekking shoes with deep lug grip</span>
            </li>
            <li style="display: flex; gap: var(--space-2);">
              <i data-lucide="check-circle" style="color: var(--color-success); width: 16px; height: 16px; flex-shrink: 0; margin-top: 3px;"></i>
              <span>3-layer insulation: base thermal, fleece, and down jacket</span>
            </li>
            <li style="display: flex; gap: var(--space-2);">
              <i data-lucide="check-circle" style="color: var(--color-success); width: 16px; height: 16px; flex-shrink: 0; margin-top: 3px;"></i>
              <span>UV400 Category 3/4 sunglasses to avoid snow blindness</span>
            </li>
            <li style="display: flex; gap: var(--space-2);">
              <i data-lucide="check-circle" style="color: var(--color-success); width: 16px; height: 16px; flex-shrink: 0; margin-top: 3px;"></i>
              <span>Personal medical kit including Diamox for altitude sickness</span>
            </li>
            <li style="display: flex; gap: var(--space-2);">
              <i data-lucide="check-circle" style="color: var(--color-success); width: 16px; height: 16px; flex-shrink: 0; margin-top: 3px;"></i>
              <span>Offline GPS maps & Forest Department permits</span>
            </li>
          </ul>

          <a href="https://forest.uk.gov.in" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm btn-block">
            <span>Uttarakhand Forest Advisory</span>
            <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  // Bind favourite button
  const favBtn = document.getElementById("details-fav-btn");
  if (favBtn) {
    favBtn.addEventListener("click", async () => {
      if (!currentUser) {
        showToast("Please sign in to save this trek to your favourites.", "warning");
        setTimeout(() => {
          window.location.href = `login.html?redirect=${encodeURIComponent(window.location.search)}`;
        }, 800);
        return;
      }

      try {
        if (isFavourited) {
          await removeFavourite(currentUser.id, trek.id);
          isFavourited = false;
          favBtn.className = "btn btn-secondary btn-sm";
          favBtn.querySelector("span").textContent = "Add to Favourites";
          showToast("Trek removed from your favourites.", "info");
        } else {
          await addFavourite(currentUser.id, trek.id);
          isFavourited = true;
          favBtn.className = "btn btn-accent btn-sm";
          favBtn.querySelector("span").textContent = "Saved in Favourites";
          showToast("Trek successfully saved to your favourites!", "success");
        }
      } catch (err) {
        showToast("Could not update favourite: " + err.message, "error");
      }
    });
  }

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}

function initTrekMap(latitude, longitude, name, location) {
  const mapElement = document.getElementById("interactive-map");
  if (!mapElement) return;

  if (!window.L) {
    mapElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted);">
        Map engine loading...
      </div>
    `;
    return;
  }

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    mapElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #ECEFEA; color: var(--color-text-secondary); padding: var(--space-4); text-align: center;">
        <i data-lucide="map-pin-off" style="width: 32px; height: 32px; color: var(--color-text-muted); margin-bottom: var(--space-2);"></i>
        <h4 style="font-size: 1rem; margin-bottom: 4px;">Coordinates Not Provided</h4>
        <p style="font-size: 0.85rem; max-width: 300px; margin-bottom: 0;">Geographic coordinates have not been mapped for this trail record yet.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: mapElement });
    return;
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  try {
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }

    leafletMap = window.L.map('interactive-map').setView([lat, lon], 12);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    const marker = window.L.marker([lat, lon]).addTo(leafletMap);

    marker.bindPopup(`
      <div class="custom-map-popup">
        <h4>${escapeHtml(name)}</h4>
        <p>${escapeHtml(location)}</p>
        <p style="font-weight: 700; color: #173D2D; margin-top: 4px;">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</p>
      </div>
    `).openPopup();

    // Ensure map tiles render properly after load
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 400);

  } catch (err) {
    console.error("Leaflet map initialization error:", err);
  }
}
