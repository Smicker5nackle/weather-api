const API_KEY = "c00e7b73e99e4072a5a82300261105";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

// DOM elements
const searchSection = document.getElementById("search-section");
const locationInput = document.getElementById("location-input");
const searchBtn = document.getElementById("search-btn");
const gpsBtn = document.getElementById("gps-btn");
const errorMsg = document.getElementById("error-msg");
const loader = document.getElementById("loader");
const weatherCard = document.getElementById("weather-card");
const backBtn = document.getElementById("back-btn");

// Weather display elements
const cityName = document.getElementById("city-name");
const regionCountry = document.getElementById("region-country");
const localTime = document.getElementById("local-time");
const weatherIcon = document.getElementById("weather-icon");
const conditionText = document.getElementById("condition-text");
const tempValue = document.getElementById("temp-value");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const uv = document.getElementById("uv");
const cloud = document.getElementById("cloud");
const aqiFill = document.getElementById("aqi-fill");
const aqiLabel = document.getElementById("aqi-label");

// Show / hide helpers
function showSearch() {
  searchSection.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  loader.classList.add("hidden");
  errorMsg.textContent = "";
  locationInput.focus();
}

function showLoader() {
  searchSection.classList.add("hidden");
  weatherCard.classList.add("hidden");
  loader.classList.remove("hidden");
}

function showWeather() {
  loader.classList.add("hidden");
  searchSection.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  setTimeout(() => { errorMsg.textContent = ""; }, 5000);
}

// AQI helpers
function getAqiInfo(index) {
  if (index <= 1) return { label: "Good", color: "#22c55e", pct: 16 };
  if (index <= 2) return { label: "Moderate", color: "#eab308", pct: 33 };
  if (index <= 3) return { label: "Unhealthy (SG)", color: "#f97316", pct: 50 };
  if (index <= 4) return { label: "Unhealthy", color: "#ef4444", pct: 66 };
  if (index <= 5) return { label: "Very Unhealthy", color: "#a855f7", pct: 83 };
  return { label: "Hazardous", color: "#991b1b", pct: 100 };
}

// Format time
function formatTime(localtime) {
  const d = new Date(localtime);
  return d.toLocaleString("en-US", {
    weekday: "long", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// Fetch weather
async function fetchWeather(query) {
  showLoader();
  try {
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Location not found");
    }
    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    showSearch();
    showError(err.message || "Something went wrong. Please try again.");
  }
}

// Render weather data
function renderWeather(data) {
  const loc = data.location;
  const cur = data.current;

  cityName.textContent = loc.name;
  regionCountry.textContent = [loc.region, loc.country].filter(Boolean).join(", ");
  localTime.textContent = formatTime(loc.localtime);

  weatherIcon.src = "https:" + cur.condition.icon.replace("64x64", "128x128");
  weatherIcon.alt = cur.condition.text;
  conditionText.textContent = cur.condition.text;

  tempValue.textContent = Math.round(cur.temp_c);
  feelsLike.textContent = `Feels like ${Math.round(cur.feelslike_c)}°C`;

  humidity.textContent = cur.humidity + "%";
  wind.textContent = cur.wind_kph + " km/h";
  pressure.textContent = cur.pressure_mb + " mb";
  visibility.textContent = cur.vis_km + " km";
  uv.textContent = cur.uv;
  cloud.textContent = cur.cloud + "%";

  // AQI
  const aqiIndex = cur.air_quality?.["us-epa-index"];
  if (aqiIndex) {
    const info = getAqiInfo(aqiIndex);
    aqiLabel.textContent = info.label;
    aqiFill.style.background = info.color;
    setTimeout(() => { aqiFill.style.width = info.pct + "%"; }, 100);
  } else {
    aqiLabel.textContent = "N/A";
    aqiFill.style.width = "0%";
  }

  showWeather();
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const q = locationInput.value.trim();
  if (!q) { showError("Please enter a location"); return; }
  fetchWeather(q);
});

locationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { searchBtn.click(); }
});

gpsBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => showError("Unable to retrieve your location. Please allow access.")
  );
});

backBtn.addEventListener("click", () => {
  locationInput.value = "";
  aqiFill.style.width = "0%";
  showSearch();
});
