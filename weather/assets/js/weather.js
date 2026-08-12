// Lightweight weather dashboard using Open‑Meteo (no API key).
// Geocoding: https://geocoding-api.open-meteo.com/v1/search?name=City
// Forecast:  https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto

const el = {
  form: document.getElementById('search-form'),
  input: document.getElementById('search-input'),
  status: document.getElementById('status'),
  currentSection: document.getElementById('current'),
  currentIcon: document.getElementById('current-icon'),
  currentTemp: document.getElementById('current-temp'),
  currentDesc: document.getElementById('current-desc'),
  currentLocation: document.getElementById('current-location'),
  currentWind: document.getElementById('current-wind'),
  currentTime: document.getElementById('current-time'),
  hourlySection: document.getElementById('hourly'),
  hourlyStrip: document.getElementById('hourly-strip'),
  dailySection: document.getElementById('daily'),
  dailyCards: document.getElementById('daily-cards')
};

const STORAGE_KEY = 'weather_last';
const weatherCodeMap = {
  0: ['Clear', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Depositing rime fog','🌫️'],
  51: ['Drizzle light','🌦️'],52:['Drizzle moderate','🌦️'],53:['Drizzle dense','🌦️'],
  61: ['Rain slight','🌧️'],62:['Rain moderate','🌧️'],63:['Rain heavy','🌧️'],
  71: ['Snow light','❄️'],73:['Snow moderate','❄️'],75:['Snow heavy','❄️'],
  80: ['Rain showers','🌧️'],81:['Moderate showers','🌧️'],82:['Violent showers','⛈️'],
  95: ['Thunderstorm','⛈️'],96:['Thunderstorm with hail','⛈️']
};

function showStatus(msg, isError=false) {
  el.status.textContent = msg;
  el.status.style.color = isError ? '#ffb4b4' : '';
}

async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if(!data.results || data.results.length === 0) throw new Error('No locations found');
  return data.results[0];
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

function mapWeather(code){
  return weatherCodeMap[code] || ['Unknown', '❔'];
}

function renderCurrent(locationName, data, timezone) {
  const cw = data.current_weather;
  const [desc, emoji] = mapWeather(cw.weathercode);
  el.currentTemp.textContent = `${Math.round(cw.temperature)}°C`;
  el.currentDesc.textContent = `${emoji} ${desc}`;
  el.currentLocation.textContent = locationName;
  el.currentWind.textContent = `${cw.windspeed} km/h • ${cw.winddirection}°`;
  el.currentTime.textContent = new Date(cw.time).toLocaleString([], {timeZone: data.timezone});
  el.currentIcon.src = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><text x='50%' y='55%' font-size='46' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`)}`;
  el.currentIcon.alt = desc;
  el.currentSection.hidden = false;
}

function renderHourly(data) {
  const hours = data.hourly;
  const now = new Date().toISOString().slice(0,13);
  const times = hours.time;
  let start = 0;
  for (let i=0;i<times.length;i++){
    if (times[i].startsWith(now)) { start = i; break; }
  }
  const slice = times.slice(start, start + 24);
  el.hourlyStrip.innerHTML = '';
  slice.forEach((t, idx) => {
    const temp = hours.temperature_2m[start + idx];
    const code = hours.weathercode ? hours.weathercode[start + idx] : null;
    const [desc, emoji] = mapWeather(code);
    const div = document.createElement('div');
    div.className = 'hour-item';
    div.innerHTML = `<div class="h-time">${new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                     <div class="h-icon" aria-hidden="true" style="font-size:20px;margin-top:6px">${emoji}</div>
                     <div class="h-temp">${Math.round(temp)}°C</div>
                     <div class="h-desc" style="font-size:0.8rem;color:var(--muted);margin-top:6px">${desc}</div>`;
    el.hourlyStrip.appendChild(div);
  });
  el.hourlySection.hidden = false;
}

function renderDaily(data) {
  const days = data.daily;
  el.dailyCards.innerHTML = '';
  for(let i = 0; i < days.time.length; i++){
    const date = new Date(days.time[i]);
    const label = date.toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});
    const max = Math.round(days.temperature_2m_max[i]);
    const min = Math.round(days.temperature_2m_min[i]);
    const code = days.weathercode[i];
    const [desc, emoji] = mapWeather(code);
    const card = document.createElement('div');
    card.className = 'daily-card';
    card.innerHTML = `<div class="d-day">${label}</div>
                      <div style="font-size:28px">${emoji}</div>
                      <div class="d-temp">${max}° / ${min}°</div>
                      <div style="font-size:0.85rem;color:var(--muted);margin-top:6px">${desc}</div>`;
    el.dailyCards.appendChild(card);
  }
  el.dailySection.hidden = false;
}

function cacheResult(key, value) {
  try { localStorage.setItem(key, JSON.stringify({ts:Date.now(), data:value})); } catch(e){}
}
function getCached(key, maxAgeMs=10*60*1000) {
  try {
    const raw = localStorage.getItem(key);
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(Date.now() - obj.ts > maxAgeMs) return null;
    return obj.data;
  }catch(e){return null}
}

async function loadForCity(city) {
  showStatus('Searching location…');
  try {
    const cachedGeo = getCached('geo:'+city.toLowerCase(), 24*60*60*1000);
    let geo;
    if (cachedGeo) geo = cachedGeo;
    else {
      geo = await geocode(city);
      cacheResult('geo:'+city.toLowerCase(), geo);
    }
    showStatus(`Fetching weather for ${geo.name}, ${geo.country}…`);
    const cacheKey = `weather:${geo.latitude},${geo.longitude}`;
    const cachedWeather = getCached(cacheKey, 5*60*1000);
    let weather;
    if (cachedWeather) weather = cachedWeather;
    else {
      weather = await fetchWeather(geo.latitude, geo.longitude);
      cacheResult(cacheKey, weather);
    }
    showStatus('');
    renderCurrent(`${geo.name}${geo.admin1 ? ', ' + geo.admin1 : ''}, ${geo.country}`, weather, weather.timezone);
    renderHourly(weather);
    renderDaily(weather);
    cacheResult(STORAGE_KEY, {city, geo});
  } catch (err) {
    console.error(err);
    showStatus(err.message || 'An error occurred', true);
  }
}

el.form.addEventListener('submit', e => {
  e.preventDefault();
  const q = el.input.value.trim();
  if (!q) { showStatus('Please enter a city name', true); return; }
  loadForCity(q);
});

document.addEventListener('DOMContentLoaded', () => {
  const last = getCached(STORAGE_KEY, 24*60*60*1000);
  if (last && last.city) {
    el.input.value = last.city;
    loadForCity(last.city);
  } else {
    showStatus('Type a city and press Search (e.g. "New York")');
  }
});
