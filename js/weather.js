/**
 * TrekIntel — Open-Meteo Weather Integration
 * Fetches and renders live Himalayan alpine weather forecasts and conditions
 */

// WMO Weather Interpretation Codes (WW)
const WMO_WEATHER_MAP = {
  0: { label: "Clear Alpine Sky", icon: "sun" },
  1: { label: "Mainly Sunny", icon: "sun-dim" },
  2: { label: "Partly Cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Mountain Fog", icon: "cloud-fog" },
  48: { label: "Depositing Rime Fog", icon: "cloud-fog" },
  51: { label: "Light Drizzle", icon: "cloud-drizzle" },
  53: { label: "Moderate Drizzle", icon: "cloud-drizzle" },
  55: { label: "Dense Drizzle", icon: "cloud-drizzle" },
  61: { label: "Slight Rain", icon: "cloud-rain" },
  63: { label: "Moderate Rain", icon: "cloud-rain" },
  65: { label: "Heavy Rain", icon: "cloud-rain" },
  71: { label: "Slight Snowfall", icon: "snowflake" },
  73: { label: "Moderate Snowfall", icon: "snowflake" },
  75: { label: "Heavy Snowfall", icon: "snowflake" },
  77: { label: "Snow Grains", icon: "snowflake" },
  80: { label: "Slight Rain Showers", icon: "cloud-rain" },
  81: { label: "Moderate Showers", icon: "cloud-rain" },
  82: { label: "Violent Showers", icon: "cloud-lightning" },
  85: { label: "Slight Snow Showers", icon: "cloud-snow" },
  86: { label: "Heavy Snow Showers", icon: "cloud-snow" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "Thunderstorm with Hail", icon: "cloud-lightning" },
  99: { label: "Severe Hail Thunderstorm", icon: "cloud-lightning" }
};

export function getWeatherInfo(code) {
  return WMO_WEATHER_MAP[code] || { label: "Variable Mountain Conditions", icon: "cloud" };
}

/**
 * Fetch weather from Open-Meteo API
 */
export async function fetchTrekWeather(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    throw new Error("Coordinates not provided for this trek.");
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    throw new Error("Invalid geographic coordinates format.");
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Weather service returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("Weather request timed out. High-altitude network latency.");
    }
    throw err;
  }
}

/**
 * Render weather widget into container
 */
export async function renderWeatherWidget(containerEl, latitude, longitude, locationName = "Trailhead") {
  if (!containerEl) return;

  // Loading skeleton
  containerEl.innerHTML = `
    <div class="weather-container">
      <div class="weather-header">
        <div>
          <h3 class="weather-title">Fetching Real-time Himalayan Weather...</h3>
          <p style="color: #9EAF9F; font-size: 0.85rem;">Querying Open-Meteo Atmospheric Stations</p>
        </div>
      </div>
      <div style="height: 120px;" class="skeleton"></div>
    </div>
  `;

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    containerEl.innerHTML = `
      <div class="weather-container" style="background: #172D24;">
        <div class="weather-header">
          <div>
            <h3 class="weather-title">Live Weather Forecast</h3>
            <p style="color: #A0B2A3; font-size: 0.9rem;">Geographic coordinates are not yet recorded for this trek route.</p>
          </div>
        </div>
        <div class="mountain-safety-note" style="margin-top: var(--space-4);">
          <i data-lucide="info" style="color: #FFD4A3; flex-shrink: 0;"></i>
          <span>Check local IMD (India Meteorological Department) bulletins for Uttarakhand state before embarking.</span>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: containerEl });
    return;
  }

  try {
    const weatherData = await fetchTrekWeather(latitude, longitude);
    const current = weatherData.current;
    const daily = weatherData.daily;

    const condition = getWeatherInfo(current.weather_code);
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const windSpeed = Math.round(current.wind_speed_10m);
    const humidity = current.relative_humidity_2m;
    const precip = current.precipitation;

    // Build 5-day daily forecast strip
    let dailyHtml = '';
    const daysCount = Math.min(daily.time.length, 5);

    for (let i = 0; i < daysCount; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr + "T00:00:00");
      const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
      const dayCode = daily.weather_code[i];
      const dayInfo = getWeatherInfo(dayCode);
      const maxT = Math.round(daily.temperature_2m_max[i]);
      const minT = Math.round(daily.temperature_2m_min[i]);

      dailyHtml += `
        <div class="forecast-day-card">
          <div class="forecast-day-name">${dayName}</div>
          <div class="forecast-icon">
            <i data-lucide="${dayInfo.icon}" style="width: 24px; height: 24px;"></i>
          </div>
          <div class="forecast-temps">
            <span class="forecast-max">${maxT}°</span>
            <span class="forecast-min">${minT}°</span>
          </div>
        </div>
      `;
    }

    containerEl.innerHTML = `
      <div class="weather-container">
        <div class="weather-header">
          <div>
            <h3 class="weather-title">Live Weather & Mountain Forecast</h3>
            <p style="color: #9EAF9F; font-size: 0.85rem;">Live Open-Meteo atmospheric telemetry</p>
          </div>
          <div class="weather-location-badge">
            <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
            <span>${Number(latitude).toFixed(3)}°N, ${Number(longitude).toFixed(3)}°E</span>
          </div>
        </div>

        <div class="weather-current">
          <div class="current-temp-block">
            <div class="weather-main-icon">
              <i data-lucide="${condition.icon}" style="width: 56px; height: 56px;"></i>
            </div>
            <div>
              <div class="current-degrees">${temp}°C</div>
              <div class="current-condition-text">${condition.label}</div>
            </div>
          </div>

          <div class="weather-stats-grid">
            <div class="weather-stat-box">
              <div class="weather-stat-label">Feels Like</div>
              <div class="weather-stat-value">${feelsLike}°C</div>
            </div>
            <div class="weather-stat-box">
              <div class="weather-stat-label">Wind Speed</div>
              <div class="weather-stat-value">${windSpeed} km/h</div>
            </div>
            <div class="weather-stat-box">
              <div class="weather-stat-label">Humidity</div>
              <div class="weather-stat-value">${humidity}%</div>
            </div>
          </div>
        </div>

        <h4 style="font-size: 0.95rem; color: #D7E3DC; margin-bottom: var(--space-3); font-weight: 600;">Upcoming 5-Day Trend</h4>
        <div class="weather-forecast-strip">
          ${dailyHtml}
        </div>

        <div class="mountain-safety-note">
          <i data-lucide="alert-triangle" style="color: #FFD4A3; width: 20px; height: 20px; flex-shrink: 0; margin-top: 1px;"></i>
          <div>
            <strong>Alpine Safety Advisory:</strong> Weather in the Himalayas changes rapidly within minutes. This forecast is an atmospheric prediction and never a guarantee of trail safety. Always carry adequate thermals, waterproofs, and consult local guides and forest rangers before crossing high passes.
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons({ root: containerEl });
    }

  } catch (err) {
    containerEl.innerHTML = `
      <div class="weather-container" style="background: #172D24;">
        <div class="weather-header">
          <div>
            <h3 class="weather-title">Weather Service Unavailable</h3>
            <p style="color: #A0B2A3; font-size: 0.85rem;">${err.message}</p>
          </div>
        </div>
        <div class="mountain-safety-note" style="margin-top: var(--space-4);">
          <i data-lucide="info" style="color: #FFD4A3; flex-shrink: 0;"></i>
          <span>Check local IMD weather reports and speak with village forest posts at the base camp.</span>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons({ root: containerEl });
  }
}
