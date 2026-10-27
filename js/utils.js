/**
 * TrekIntel — Utility Functions & Sample Dataset
 * Production-ready helpers for toasts, modals, security, and Himalayan data
 */

// ==========================================================================
// Curated Sample Himalayan Treks Dataset
// (Used when Supabase is not configured, or for instant offline exploration)
// ==========================================================================
export const SAMPLE_TREKS = [
  {
    id: "kedarkantha-summit",
    name: "Kedarkantha Summit Trek",
    location: "Sankri, Uttarkashi, Uttarakhand",
    region: "Garhwal",
    difficulty: "Moderate",
    duration_days: 6,
    altitude_m: 3810,
    latitude: 31.0234,
    longitude: 78.1725,
    description: "Kedarkantha is the crown jewel of winter treks in Uttarakhand. Starting from the charming apple orchard village of Sankri, the trail winds through dense pine forests, frozen Juda Ka Talab lake, and culminates in a dramatic 360-degree Himalayan summit sunrise view of Swargarohini, Bandarpoonch, and Black Peak.",
    highlights: ["360° summit panorama of Swargarohini & Bandarpoonch", "Picturesque campsite at frozen Juda Ka Talab", "Dense oak and rhododendron forests", "Traditional wooden architecture in Sankri village"],
    best_season: "December to April (Winter Snow) & May to June (Spring)",
    image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-01-15T10:00:00.000Z"
  },
  {
    id: "dayara-bugyal",
    name: "Dayara Bugyal Alpine Meadow",
    location: "Barsu, Uttarkashi, Uttarakhand",
    region: "Garhwal",
    difficulty: "Easy",
    duration_days: 4,
    altitude_m: 3750,
    latitude: 30.8242,
    longitude: 78.5312,
    description: "Regarded as one of the most breathtaking high-altitude alpine meadows in Asia. In spring and summer, Dayara transforms into a lush green carpet filled with wild alpine blossoms, while winter blankets the rolling expanse in pristine powder snow framed by the magnificent Bhagirathi peaks.",
    highlights: ["Vast undulating alpine meadows stretching over 28 sq km", "Close-up views of Bandarpoonch, Draupadi Ka Danda, and Gangotri peaks", "Gentle ascents ideal for beginner trekkers and families", "Stargazing under crystal clear Himalayan night skies"],
    best_season: "May to November & January to March (Snow)",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-01-20T10:00:00.000Z"
  },
  {
    id: "har-ki-dun",
    name: "Har Ki Dun Valley of Gods",
    location: "Sankri, Uttarkashi, Uttarakhand",
    region: "Garhwal",
    difficulty: "Moderate",
    duration_days: 7,
    altitude_m: 3566,
    latitude: 31.1458,
    longitude: 78.3842,
    description: "A legendary cradle-shaped river valley steeped in Mahabharata folklore. Following the sparkling Supin river, this trek traverses centuries-old wooden villages like Osla and Gangad, offering intimate glimpses into remote Himalayan culture and views of the colossal Swargarohini massif.",
    highlights: ["Ancient Someshwar Devta wooden temple in Osla", "Dramatic glacial valley amphitheater beneath Jaundhar glacier", "Rich birdlife including Himalayan Monal and Golden Eagles", "Historic trail believed to be taken by Pandavas on their ascent to heaven"],
    best_season: "April to June & September to December",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-02-01T10:00:00.000Z"
  },
  {
    id: "valley-of-flowers",
    name: "Valley of Flowers & Hemkund Sahib",
    location: "Govindghat, Chamoli, Uttarakhand",
    region: "Garhwal",
    difficulty: "Moderate",
    duration_days: 6,
    altitude_m: 4300,
    latitude: 30.7280,
    longitude: 79.5847,
    description: "A UNESCO World Heritage Site renowned for its endemic alpine flower species. Discovered by mountaineer Frank Smythe, the valley blossoms into a vivid mosaic of over 500 species of flowers including the elusive Blue Poppy, coupled with a pilgrimage climb to the glacial lake of Hemkund Sahib.",
    highlights: ["UNESCO World Heritage floral sanctuary", "Over 500 varieties of wild Himalayan wildflowers", "High-altitude pilgrimage to Hemkund Sahib (4,329m)", "Gushing Pushpawati river cascades and waterfalls"],
    best_season: "July to mid-September (Peak Monsoon Bloom)",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-02-10T10:00:00.000Z"
  },
  {
    id: "chopta-chandrashila",
    name: "Chopta Chandrashila & Tungnath",
    location: "Chopta, Rudraprayag, Uttarakhand",
    region: "Garhwal",
    difficulty: "Easy",
    duration_days: 3,
    altitude_m: 4000,
    latitude: 30.4878,
    longitude: 79.2172,
    description: "Often called the 'Mini Switzerland of Uttarakhand', Chopta offers a short yet exhilarating trek to Tungnath—the highest Shiva temple in the world (3,680m)—and the summit rock of Chandrashila, granting jaw-dropping 360-degree vistas of Nanda Devi, Trishul, and Chaukhamba.",
    highlights: ["Summit vistas of Nanda Devi (India's 2nd highest peak)", "Visit to Tungnath Temple, highest of Panch Kedar", "Dense rhododendron forests bursting into crimson blooms in spring", "Accessible year-round trail perfect for beginners"],
    best_season: "Round the year (Snow in Jan-Mar, Flowers in Apr-May)",
    image_url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-02-15T10:00:00.000Z"
  },
  {
    id: "kuari-pass",
    name: "Kuari Pass (Lord Curzon Trail)",
    location: "Joshimath, Chamoli, Uttarakhand",
    region: "Garhwal",
    difficulty: "Moderate",
    duration_days: 5,
    altitude_m: 3876,
    latitude: 30.4988,
    longitude: 79.6247,
    description: "Pioneered by British Viceroy Lord Curzon in 1905, Kuari Pass delivers front-row amphitheater seats to the giants of the Garhwal Himalaya: Nanda Devi, Kamet, Dronagiri, and Hathi-Ghodi Parvat. Trek through ancient forests of conifer and oak into open meadows.",
    highlights: ["Unobstructed views of Mount Nanda Devi sanctuary", "Spectacular camping meadows at Gulling and Khullara", "Walk through pristine golden oak and silver birch forests", "Historic mountaineering corridor"],
    best_season: "November to April (Winter) & May to June",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-03-01T10:00:00.000Z"
  },
  {
    id: "nag-tibba",
    name: "Nag Tibba Weekend Summit",
    location: "Pantwari, Tehri Garhwal, Uttarakhand",
    region: "Garhwal",
    difficulty: "Easy",
    duration_days: 2,
    altitude_m: 3022,
    latitude: 30.5847,
    longitude: 78.1517,
    description: "The 'Serpent's Peak' is the highest peak in the lower Garhwal Himalayas. Highly popular as an approachable weekend escape from Dehradun and Delhi, it features rewarding views of the Bandarpoonch range, Gangotri group, and Kedarnath peaks with minimal technical commitment.",
    highlights: ["Ideal first-time Himalayan summit trek", "Ancient Nag Devta temple shrine atop the ridge", "Picturesque camping amidst oak clearings", "Convenient overnight weekend trail from Mussoorie/Dehradun"],
    best_season: "October to April (Snow in Jan-Feb)",
    image_url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-03-05T10:00:00.000Z"
  },
  {
    id: "roopkund-lake",
    name: "Roopkund Mystery Lake",
    location: "Wan, Chamoli, Uttarakhand",
    region: "Garhwal",
    difficulty: "Difficult",
    duration_days: 8,
    altitude_m: 4800,
    latitude: 30.2644,
    longitude: 79.7322,
    description: "A demanding high-altitude expedition leading to the enigmatic glacial lake situated in the lap of Mount Trishul. Celebrated for its expansive twin alpine meadows of Ali and Bedni Bugyal and sweeping views of Mt. Trishul (7,120m) and Nanda Ghunti.",
    highlights: ["Vast twin meadows of Ali & Bedni Bugyal", "Spectacular proximity to Mt. Trishul and Nanda Ghunti", "Dramatic ridge walks through Junargali", "High-altitude challenges testing mountaineering endurance"],
    best_season: "May to June & September to October",
    image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80",
    is_public: true,
    created_at: "2024-03-10T10:00:00.000Z"
  }
];

// Coordinate presets for quick autofill in Trek Manager
export const COORDINATE_PRESETS = [
  { name: "Kedarkantha Peak", lat: 31.0234, lon: 78.1725, loc: "Sankri, Uttarkashi, Uttarakhand", alt: 3810, diff: "Moderate", dur: 6 },
  { name: "Dayara Bugyal", lat: 30.8242, lon: 78.5312, loc: "Barsu, Uttarkashi, Uttarakhand", alt: 3750, diff: "Easy", dur: 4 },
  { name: "Har Ki Dun", lat: 31.1458, lon: 78.3842, loc: "Sankri, Uttarkashi, Uttarakhand", alt: 3566, diff: "Moderate", dur: 7 },
  { name: "Valley of Flowers", lat: 30.7280, lon: 79.5847, loc: "Govindghat, Chamoli, Uttarakhand", alt: 4300, diff: "Moderate", dur: 6 },
  { name: "Chopta Chandrashila", lat: 30.4878, lon: 79.2172, loc: "Chopta, Rudraprayag, Uttarakhand", alt: 4000, diff: "Easy", dur: 3 },
  { name: "Kuari Pass", lat: 30.4988, lon: 79.6247, loc: "Joshimath, Chamoli, Uttarakhand", alt: 3876, diff: "Moderate", dur: 5 },
  { name: "Nag Tibba", lat: 30.5847, lon: 78.1517, loc: "Pantwari, Tehri Garhwal, Uttarakhand", alt: 3022, diff: "Easy", dur: 2 }
];

// Fallback image presets for Himalayan visuals
export const IMAGE_PRESETS = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"
];

// ==========================================================================
// Toast Notification Utility
// ==========================================================================
export function showToast(message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconName = type === "success" ? "check-circle" :
                   type === "error" ? "alert-circle" :
                   type === "warning" ? "alert-triangle" : "info";

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-message">${escapeHtml(message)}</div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Render icon if lucide is available
  if (window.lucide) {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ==========================================================================
// Modal Confirmation Dialog
// ==========================================================================
export function showConfirmModal({ title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false, onConfirm }) {
  let backdrop = document.getElementById("app-confirm-modal");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "app-confirm-modal";
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title-text">Confirm Action</h3>
          <button class="modal-close-btn" id="modal-close-x" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body" id="modal-body-text">Are you sure?</div>
        <div class="modal-actions">
          <button class="btn btn-secondary btn-sm" id="modal-cancel-btn">Cancel</button>
          <button class="btn btn-sm" id="modal-confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  }

  const titleEl = backdrop.querySelector("#modal-title-text");
  const bodyEl = backdrop.querySelector("#modal-body-text");
  const confirmBtn = backdrop.querySelector("#modal-confirm-btn");
  const cancelBtn = backdrop.querySelector("#modal-cancel-btn");
  const closeX = backdrop.querySelector("#modal-close-x");

  titleEl.textContent = title;
  bodyEl.textContent = message;
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;

  confirmBtn.className = `btn btn-sm ${isDanger ? "btn-danger" : "btn-primary"}`;

  const closeModal = () => {
    backdrop.classList.remove("open");
  };

  const handleConfirm = () => {
    closeModal();
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  // Bind clean one-time listeners
  confirmBtn.onclick = handleConfirm;
  cancelBtn.onclick = closeModal;
  closeX.onclick = closeModal;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeModal();
  };

  backdrop.classList.add("open");
}

// ==========================================================================
// Security & Formatting Helpers
// ==========================================================================
export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatAltitude(meters) {
  if (!meters && meters !== 0) return "N/A";
  const m = Number(meters);
  const ft = Math.round(m * 3.28084);
  return `${m.toLocaleString()} m (${ft.toLocaleString()} ft)`;
}

export function formatDuration(days) {
  if (!days) return "N/A";
  const d = Number(days);
  return d === 1 ? "1 Day" : `${d} Days`;
}

export function getDifficultyBadgeClass(difficulty) {
  const d = (difficulty || "").toLowerCase();
  if (d === "easy") return "badge-easy";
  if (d === "moderate") return "badge-moderate";
  if (d === "difficult" || d === "hard") return "badge-difficult";
  if (d === "expert") return "badge-expert";
  return "badge-neutral";
}

export function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}
