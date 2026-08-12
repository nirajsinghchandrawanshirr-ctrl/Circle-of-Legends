// site-settings.js
// Responsible for loading settings (localStorage prototype), applying them to the page,
// and providing a small API used by admin.js

const STORAGE_KEYS = {
  SETTINGS: 'circle_settings',
  PLAYLISTS: 'circle_playlists'
};

// Default playlists
const DEFAULT_PLAYLISTS = [
  { name: "Meditation & Yoga", id: "37i9dQZF1DWZqd5JICZI0u", bg: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1920&q=80", bgLow: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=60" },
  { name: "Nature Sound", id: "37i9dQZF1DX4PP3DA4J0N8", bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80", bgLow: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=60" },
  { name: "Old Is Gold", id: "5pXV7brN2OYdhX7BaYzR7G", bg: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80", bgLow: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60" }
];

function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (raw) return JSON.parse(raw);
  // defaults
  return {
    githubUsername: 'NirajSinghChandravanshi',
    avatarDataUrl: null,
    dataSaver: false,
    privateSite: false,
    adminPassword: '',
    background: { mode: 'static', url: '' }
  };
}

function saveSettings(s) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(s));
}

function loadPlaylists() {
  const raw = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
  if (raw) return JSON.parse(raw);
  // seed defaults
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(DEFAULT_PLAYLISTS));
  return DEFAULT_PLAYLISTS.slice();
}

function savePlaylists(pl) {
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(pl));
}

// Apply settings to page
function applySiteSettings() {
  const settings = loadSettings();
  const playlists = loadPlaylists();

  // avatar: prefer uploaded data URL, else GitHub avatar
  const profileImg = document.getElementById('profile-img');
  if (settings.avatarDataUrl) profileImg.src = settings.avatarDataUrl;
  else profileImg.src = `https://avatars.githubusercontent.com/${encodeURIComponent(settings.githubUsername)}?s=200&v=4`;

  // background
  const bg = document.getElementById('bg-container');
  if (settings.background.mode === 'static' && settings.background.url) {
    bg.style.backgroundImage = `url('${settings.background.url}')`;
  } else if (settings.background.mode === 'gradient') {
    // simple animated gradient
    bg.style.backgroundImage = `linear-gradient(120deg, rgba(0,255,204,0.08), rgba(0,40,80,0.08))`;
    bg.style.animation = 'gradientAnim 12s ease infinite';
    const style = document.createElement('style');
    style.id = 'gradientAnim';
    style.textContent = `@keyframes gradientAnim { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`;
    if (!document.getElementById('gradientAnim')) document.head.appendChild(style);
    bg.style.backgroundSize = '200% 200%';
  } else if (settings.background.mode === 'video' && settings.background.url) {
    // fallback: use url as poster image
    bg.style.backgroundImage = `url('${settings.background.url}')`;
  } else {
    // default first playlist bg
    bg.style.backgroundImage = `url('${playlists[0]?.bg || ''}')`;
  }

  // Data saver
  if (settings.dataSaver) document.body.classList.add('data-saver');
  else document.body.classList.remove('data-saver');

  // build playlist buttons
  const grid = document.getElementById('category-grid');
  grid.innerHTML = '';
  playlists.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.type = 'button';
    btn.innerText = item.name;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => selectPlaylist(index, btn));
    grid.appendChild(btn);
  });

  // initialize first
  selectPlaylist(0, grid.children[0]);
}

function selectPlaylist(index, element) {
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');

  const playlists = loadPlaylists();
  const settings = loadSettings();
  const data = playlists[index];
  const iframe = document.getElementById('spotify-player');
  const titleText = document.getElementById('current-title');
  const openLink = document.getElementById('open-in-spotify');

  titleText.innerText = data.name;

  const playlistUrl = `https://open.spotify.com/embed/playlist/${data.id}?utm_source=generator&theme=0`;
  const playlistPage = `https://open.spotify.com/playlist/${data.id}`;

  if (settings.dataSaver) {
    // don't load heavy iframe
    iframe.src = '';
    openLink.href = playlistPage;
    openLink.style.display = 'inline-block';
  } else {
    iframe.src = playlistUrl;
    openLink.style.display = 'none';
  }

  // background swap: prefer playlist bg when available
  const bg = document.getElementById('bg-container');
  if (data.bg) bg.style.backgroundImage = `url('${data.bg}')`;
}

// expose API for admin
window.CircleSettings = {
  loadSettings,
  saveSettings,
  loadPlaylists,
  savePlaylists,
  applySiteSettings
};

// initial apply
document.addEventListener('DOMContentLoaded', () => {
  applySiteSettings();
});
