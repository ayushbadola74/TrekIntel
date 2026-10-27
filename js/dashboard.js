/**
 * TrekIntel — Dashboard Controller
 * Displays personalized user metrics, stats, recent expeditions, and quick actions
 */

import { requireAuth } from './auth.js';
import { getUserTreks, getUserFavourites } from './supabase.js';
import { escapeHtml, formatAltitude, formatDuration, getDifficultyBadgeClass } from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth();
  if (!user) return;

  renderUserGreeting(user);
  await loadDashboardMetrics(user);
});

function renderUserGreeting(user) {
  const greetingEl = document.getElementById("dashboard-user-name");
  const avatarEl = document.getElementById("dashboard-user-avatar");

  const displayName = user.fullName || user.email.split('@')[0];

  if (greetingEl) {
    greetingEl.textContent = displayName;
  }

  if (avatarEl) {
    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    avatarEl.textContent = initials;
  }
}

async function loadDashboardMetrics(user) {
  const myTreksCountEl = document.getElementById("stat-treks-count");
  const favsCountEl = document.getElementById("stat-favs-count");
  const maxAltEl = document.getElementById("stat-max-alt");
  const recentGridEl = document.getElementById("dashboard-recent-treks");

  try {
    const [userTreks, userFavs] = await Promise.all([
      getUserTreks(user.id),
      getUserFavourites(user.id)
    ]);

    if (myTreksCountEl) myTreksCountEl.textContent = userTreks.length;
    if (favsCountEl) favsCountEl.textContent = userFavs.length;

    // Calculate maximum elevation explored
    let maxAltitude = 0;
    [...userTreks, ...userFavs].forEach(t => {
      const alt = Number(t.altitude_m) || 0;
      if (alt > maxAltitude) maxAltitude = alt;
    });

    if (maxAltEl) {
      maxAltEl.textContent = maxAltitude > 0 ? `${maxAltitude.toLocaleString()} m` : "3,810 m";
    }

    // Render recent expeditions
    if (recentGridEl) {
      if (userTreks.length === 0) {
        recentGridEl.innerHTML = `
          <div class="empty-state" style="padding: var(--space-8); max-width: 100%;">
            <div class="empty-state-icon" style="width: 48px; height: 48px;"><i data-lucide="map"></i></div>
            <h4 style="font-size: 1.15rem; margin-bottom: var(--space-2);">No Trekking Records Yet</h4>
            <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: var(--space-4);">
              Document your Himalayan expedition, log trail coordinates, or create private itineraries.
            </p>
            <a href="manage-trek.html" class="btn btn-primary btn-sm">Add Your First Trek</a>
          </div>
        `;
      } else {
        const recent = userTreks.slice(0, 3);
        recentGridEl.innerHTML = recent.map(trek => {
          const badgeClass = getDifficultyBadgeClass(trek.difficulty);
          const img = trek.image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";

          return `
            <div class="trek-card" style="box-shadow: none;">
              <div class="trek-card-media" style="aspect-ratio: 16/9;">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(trek.name)}" class="trek-card-img" />
                <div class="trek-card-overlay"></div>
                <div class="trek-card-top-badges">
                  <span class="badge ${badgeClass}">${escapeHtml(trek.difficulty)}</span>
                  <span class="badge badge-neutral" style="background: rgba(255,255,255,0.85);">${trek.is_public ? 'Public' : 'Private'}</span>
                </div>
              </div>
              <div class="trek-card-body" style="padding: var(--space-4);">
                <div class="trek-card-location">
                  <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i>
                  <span>${escapeHtml(trek.location)}</span>
                </div>
                <h4 style="font-size: 1.1rem; margin-bottom: var(--space-2);">
                  <a href="trek-details.html?id=${encodeURIComponent(trek.id)}">${escapeHtml(trek.name)}</a>
                </h4>
                <div style="font-size: 0.8rem; color: var(--color-text-muted); display: flex; gap: var(--space-4); margin-top: auto; padding-top: var(--space-2); border-top: 1px solid var(--color-border);">
                  <span><strong>Alt:</strong> ${formatAltitude(trek.altitude_m)}</span>
                  <span><strong>Duration:</strong> ${formatDuration(trek.duration_days)}</span>
                </div>
              </div>
            </div>
          `;
        }).join("");
      }

      if (window.lucide) window.lucide.createIcons({ root: recentGridEl });
    }

  } catch (err) {
    console.error("Dashboard metrics load error:", err);
  }
}
