# TrekIntel — Himalayan Trekking Intelligence Platform

A modern, high-performance, outdoor adventure web platform focused on Uttarakhand and Himalayan trekking destinations. TrekIntel combines curated high-altitude expedition intelligence, real-time Open-Meteo atmospheric telemetry, interactive Leaflet geospatial mapping, and cloud-synced personal route management via Supabase.

---

## 🏔️ 1. Project Overview

- **Platform Name:** TrekIntel
- **Focus Region:** Uttarakhand Himalayas (Garhwal & Kumaon ranges) & higher alpine corridors.
- **Target Audience:** High-altitude trekkers, expedition planners, mountaineering enthusiasts, and nature explorers.
- **Architecture:** Pure HTML5, CSS3, and Vanilla JavaScript (ES Modules). Zero heavy frontend frameworks (no React, Next.js, or Vue), zero Node.js server dependencies. Runs statically on any web server or CDN.

---

## ✨ 2. Key Features

1. **Curated Himalayan Directory:**
   - Pre-loaded with iconic Uttarakhand trails: *Kedarkantha Summit (3,810m)*, *Dayara Bugyal (3,750m)*, *Har Ki Dun (3,566m)*, *Valley of Flowers (4,300m)*, *Chopta Chandrashila (4,000m)*, *Kuari Pass (3,876m)*, *Nag Tibba (3,022m)*, and *Roopkund Mystery Lake (4,800m)*.
2. **Instant Multi-Facet Search & Filtering:**
   - Real-time client-side keyword search across trail names, locations, and landmarks.
   - Filter by difficulty (*Easy, Moderate, Difficult*), duration (*1-3 days, 4-6 days, 7+ days*), and altitude sorting.
3. **Live Alpine Weather Telemetry:**
   - Real-time atmospheric querying via the free **Open-Meteo API** (using exact geographic latitude and longitude).
   - Live temperature, feels-like temperature, wind speed, relative humidity, and 5-day daily forecast trend.
   - Prominent high-altitude safety notices and IMD bulletin advisories.
4. **Geospatial Trailhead Mapping:**
   - Integrated **Leaflet.js** map with OpenStreetMap tiles.
   - Pinpoints verified trailhead coordinates and altitude notes without misleading synthetic routes.
5. **Supabase Cloud Authentication & PostgreSQL:**
   - Secure sign-up, sign-in, session persistence, and password reset flows.
   - User display name management with dynamic avatar initials.
   - Row Level Security (RLS) policies protecting user records and favourites.
6. **Expedition Management & CRUD:**
   - Add new custom treks or edit existing records.
   - Landmark coordinate presets for 1-click autofill.
   - Public vs. Private route visibility toggle.
   - Safe record deletion with confirmation modal dialogs.
7. **Cross-Session Wishlist / Favourites:**
   - Save dream treks with a single click.
   - Real-time synchronization to Supabase `favourites` table (with browser localStorage fallback).
8. **Zero-Config Local Preview Mode:**
   - If Supabase credentials have not yet been provided, the application gracefully activates an offline preview mode utilizing the local Himalayan dataset so reviewers can explore immediately without encountering broken interfaces.

---

## 🛠️ 3. Technology Stack

- **Markup:** Semantic HTML5
- **Styling:** Modern Vanilla CSS3 with CSS Custom Properties, flexbox, CSS grid, and responsive design
- **Scripts:** Vanilla JavaScript (ES6+ Modules)
- **Database & Auth:** Supabase PostgreSQL + Supabase Auth + Row Level Security (RLS)
- **Weather API:** Open-Meteo REST API (free, no API key required)
- **Maps:** Leaflet.js v1.9.4 & OpenStreetMap
- **Icons:** Lucide Icons CDN
- **Typography:** Manrope (Headings) & DM Sans (Body) via Google Fonts
- **Deployment:** Vercel Static Hosting

---

## 📁 4. Project Folder Structure

```text
trekintel/
├── assets/
│   └── images/
│       └── mountain-hero.svg      # High-res local vector mountain asset
├── css/
│   ├── style.css                  # Core design tokens, typography, navbar, toasts, modals
│   ├── components.css             # Trek cards, filter bars, weather widget, map styles
│   ├── auth.css                   # Split-screen auth layout, password strength indicator
│   └── dashboard.css              # Dashboard metrics, manage-trek forms, profile view
├── html/
│   ├── index.html                 # Homepage with hero, statistics, featured treks
│   ├── explore.html               # Search, multi-facet filtering, sorting, card grid
│   ├── trek-details.html          # Details page, live weather, Leaflet map
│   ├── login.html                 # Sign-in portal with password visibility toggle
│   ├── signup.html                # Registration portal with strength meter
│   ├── dashboard.html             # Authenticated dashboard with stats & quick actions
│   ├── my-treks.html              # Authenticated user's created trek records
│   ├── manage-trek.html           # Add / Edit trek form with coordinate presets
│   ├── favorites.html             # Saved wishlist treks
│   └── profile.html               # Profile management, name update, password reset
├── js/
│   ├── supabase.js                # Supabase client, queries, CRUD & offline fallback
│   ├── auth.js                    # Auth methods, session listener, nav state updater
│   ├── main.js                    # Mobile drawer, active nav, image error fallback
│   ├── utils.js                   # Himalayan dataset, toast notifications, confirm modal
│   ├── weather.js                 # Open-Meteo weather fetcher & WMO code translator
│   ├── explore.js                 # Search, filtering, and sorting logic
│   ├── trek-details.js            # Trek detail loader, Leaflet map, weather render
│   ├── dashboard.js               # Dashboard statistics & recent records
│   ├── my-treks.js                # User treks list, search, delete with modal
│   ├── manage-trek.js             # Form validation, preset autofill, create/update
│   ├── favorites.js               # Favourites manager & removal handler
│   └── profile.js                 # Profile view, name updates, sign out
├── supabase/
│   └── schema.sql                 # Complete SQL schema, RLS policies, trigger & seeds
├── vercel.json                    # Clean URLs & rewrites configuration for Vercel
└── README.md                      # Comprehensive documentation
```

---

## ⚡ 5. Local Setup Instructions

No build step or compilation is required. You can run the website locally using any standard static file server.

### Option A: Using Node.js (Quickest)

From the project root:

```bash
# Navigate to the trekintel folder
cd trekintel

# Start a local static server (using npx serve)
npx serve .
```

Then open your browser to `http://localhost:3000/html/index.html` (or `http://localhost:3000` if using a server with root rewrites).

### Option B: Using Python 3

```bash
cd trekintel
python -m http.server 8000
```

Open `http://localhost:8000/html/index.html` in your web browser.

### Option C: Using VS Code Live Server

Right-click on `html/index.html` in VS Code and select **"Open with Live Server"**.

---

## 🗄️ 6. Supabase Database & Auth Setup

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project**, choose an organization, assign a project name (e.g. `trekintel`), and set a strong database password.
3. Select your closest region (e.g., *Mumbai / ap-south-1* for Indian users).

### Step 2: Run the SQL Schema Script
1. In the Supabase Dashboard, click **SQL Editor** in the left navigation sidebar.
2. Click **New Query**.
3. Open `supabase/schema.sql` from this repository, copy its entire contents, and paste into the Supabase SQL editor.
4. Click **Run**.
5. This automatically creates:
   - `profiles` table
   - `treks` table
   - `favourites` table
   - Performance indexes
   - Row Level Security (RLS) policies
   - Automated user signup profile trigger (`handle_new_user`)
   - 8 seed records of iconic Himalayan treks.

### Step 3: Configure Credentials in TrekIntel
You have two convenient options:

#### Method 1: In-Browser Configuration (Zero Code Change)
1. Launch the website locally.
2. In the footer, click the **"Supabase Status / Config"** button.
3. Paste your **Supabase Project URL** (e.g. `https://xyz.supabase.co`) and **Supabase Publishable Anon Key** (found in *Project Settings -> API*).
4. Click **"Save & Reload"**. The credentials are saved to your browser's `localStorage` and will persist across sessions.

#### Method 2: In Code
Open `js/supabase.js` and set:
```javascript
const DEFAULT_SUPABASE_URL = "https://your-project-id.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "your-anon-publishable-key";
```

> **Security Note:** Never expose the Supabase `service_role` key in client-side code. Only use the public `anon` publishable key. All database write operations and ownership checks are strictly enforced by PostgreSQL Row Level Security (RLS).

---

## 🚀 7. Vercel Deployment Instructions

The project includes `vercel.json` configured with `cleanUrls` and route rewrites to seamlessly serve nested HTML files from the `html/` directory.

### Deploying via GitHub / Vercel CLI

1. Push the code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. If deploying from the repository root, set the **Root Directory** to `trekintel` (or leave as root if deploying the workspace root, as root rewrites are included).
5. Framework Preset: **Other** (Static).
6. Click **Deploy**.
7. Vercel will output your production URL. Direct links like `/`, `/explore`, `/dashboard`, etc. will route cleanly to their corresponding pages.

---

## ⚠️ 8. Known Limitations & Safety Advisories

1. **Weather Predictions:**
   - Weather telemetry is provided by Open-Meteo's atmospheric forecasting models based on coordinate approximations. Mountain weather changes with extreme velocity; predictions must never be substituted for local forest authority bulletins and ground guide assessments.
2. **Geospatial Paths:**
   - Map markers represent the trailhead or summit destination coordinates. TrekIntel intentionally does not generate synthetic GPS navigation trails, as attempting unguided high-altitude routes without certified mountain guides is hazardous.
3. **Email Confirmation in Supabase:**
   - If your Supabase project has "Confirm Email" enabled under *Authentication -> Providers -> Email*, users must verify their email before logging in. If you want instant signups for testing, disable "Confirm Email" in your Supabase Auth settings.

---

## 📜 License
Developed for the 7th Semester Project & Himalayan Explorer Community. Distributed under the MIT License.
