/**
 * TrekIntel — Main Global Entrypoint
 * Controls navigation, mobile drawer, active states, image fallbacks, and auth header
 */

import { initAuthNav } from './auth.js';
import { isSupabaseConfigured } from './supabase.js';
import { showToast } from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize dynamic auth state in header
  await initAuthNav();

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Setup mobile navigation drawer
  setupMobileNav();

  // Highlight active navigation links
  highlightActiveNav();

  // Header scroll appearance
  setupHeaderScroll();

  // Setup image fallback handling
  setupImageFallbacks();

  // Setup Supabase configuration modal trigger
  setupConfigModalTrigger();
});

function setupMobileNav() {
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!toggleBtn || !navMenu) return;

  // Create overlay if not present
  let overlay = document.querySelector(".mobile-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-overlay";
    document.body.appendChild(overlay);
  }

  const toggle = () => {
    const isOpen = navMenu.classList.toggle("mobile-open");
    overlay.classList.toggle("active", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  toggleBtn.addEventListener("click", toggle);
  overlay.addEventListener("click", toggle);
}

function highlightActiveNav() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && (href === currentPath || (currentPath === "" && href === "index.html"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });
}

function setupImageFallbacks() {
  const fallbackImg = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";

  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", function () {
      if (this.src !== fallbackImg) {
        this.src = fallbackImg;
      }
    });
  });
}

function setupConfigModalTrigger() {
  const triggerBtns = document.querySelectorAll(".open-supabase-config-btn");

  const openModal = () => {
    let backdrop = document.getElementById("supabase-config-modal");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "supabase-config-modal";
      backdrop.className = "modal-backdrop";
      backdrop.innerHTML = `
        <div class="modal-card" style="max-width: 520px;">
          <div class="modal-header">
            <h3 class="modal-title">Supabase Cloud Settings</h3>
            <button class="modal-close-btn" id="config-close-x">&times;</button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: var(--space-4); font-size: 0.9rem;">
              Connect your own Supabase project by providing your Project URL and Publishable Anon Key. Credentials are saved locally in your browser.
            </p>
            <div class="form-group">
              <label class="form-label" for="cfg-sb-url">Supabase Project URL</label>
              <input type="url" id="cfg-sb-url" class="form-input" placeholder="https://yourproject.supabase.co">
            </div>
            <div class="form-group">
              <label class="form-label" for="cfg-sb-key">Supabase Anon Key</label>
              <input type="text" id="cfg-sb-key" class="form-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
            </div>
            <div id="cfg-status-info" style="font-size: 0.85rem; margin-top: var(--space-2);"></div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-sm" id="cfg-clear-btn">Clear Credentials</button>
            <button class="btn btn-primary btn-sm" id="cfg-save-btn">Save & Reload</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    const urlInput = backdrop.querySelector("#cfg-sb-url");
    const keyInput = backdrop.querySelector("#cfg-sb-key");
    const statusInfo = backdrop.querySelector("#cfg-status-info");
    const saveBtn = backdrop.querySelector("#cfg-save-btn");
    const clearBtn = backdrop.querySelector("#cfg-clear-btn");
    const closeX = backdrop.querySelector("#config-close-x");

    urlInput.value = localStorage.getItem("trekintel_supabase_url") || "";
    keyInput.value = localStorage.getItem("trekintel_supabase_anon_key") || "";

    if (isSupabaseConfigured()) {
      statusInfo.innerHTML = `<span style="color: var(--color-success); font-weight: 600;">Connected to Supabase</span>`;
    } else {
      statusInfo.innerHTML = `<span style="color: var(--color-text-muted);">Running in Local Preview Mode with Himalayan sample dataset.</span>`;
    }

    const closeModal = () => backdrop.classList.remove("open");

    closeX.onclick = closeModal;
    backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };

    clearBtn.onclick = () => {
      localStorage.removeItem("trekintel_supabase_url");
      localStorage.removeItem("trekintel_supabase_anon_key");
      showToast("Supabase credentials cleared. Switched to Local Preview mode.", "info");
      setTimeout(() => window.location.reload(), 400);
    };

    saveBtn.onclick = () => {
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();

      if (!url || !key) {
        showToast("Please provide both URL and Anon Key, or Clear to use Local Mode.", "warning");
        return;
      }

      localStorage.setItem("trekintel_supabase_url", url);
      localStorage.setItem("trekintel_supabase_anon_key", key);
      showToast("Supabase configuration saved! Reloading application...", "success");
      setTimeout(() => window.location.reload(), 500);
    };

    backdrop.classList.add("open");
  };

  triggerBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  }));
}
