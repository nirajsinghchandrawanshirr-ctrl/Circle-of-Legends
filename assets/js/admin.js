// admin.js - local-first admin panel logic

const modal = document.getElementById('admin-modal');
const openBtn = document.getElementById('open-admin');
const closeBtn = document.getElementById('close-admin');

openBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'false');
});
closeBtn.addEventListener('click', () => {
  modal.setAttribute('aria-hidden', 'true');
});

// populate admin fields from settings
function populateAdmin() {
  const s = CircleSettings.loadSettings();
  document.getElementById('admin-github').value = s.githubUsername || '';
  document.getElementById('data-saver').checked = !!s.dataSaver;
  document.getElementById('private-site').checked = !!s.privateSite;
  document.getElementById('admin-password').value = s.adminPassword || '';
  document.getElementById('bg-mode').value = s.background?.mode || 'static';
  document.getElementById('bg-url').value = s.background?.url || '';

  // playlists
  renderPlaylistList();
}

function renderPlaylistList() {
  const list = document.getElementById('playlist-list');
  const pls = CircleSettings.loadPlaylists();
  list.innerHTML = '';
  pls.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'playlist-item';
    div.innerHTML = `<div><strong>${escapeHtml(p.name)}</strong><div style="font-size:0.85rem;color:#bbb">${p.id}</div></div>`;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', () => { if(confirm('Delete playlist?')) { pls.splice(i,1); CircleSettings.savePlaylists(pls); renderPlaylistList(); CircleSettings.applySiteSettings(); } });
    div.appendChild(del);
    list.appendChild(div);
  });
}

function escapeHtml(s) { return (s+'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

// save profile (github username or uploaded avatar)
document.getElementById('save-profile').addEventListener('click', async () => {
  const username = document.getElementById('admin-github').value.trim();
  const fileInput = document.getElementById('admin-avatar-upload');
  const s = CircleSettings.loadSettings();
  s.githubUsername = username || s.githubUsername;
  // if file chosen, read data URL
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const dataUrl = await readFileAsDataURL(file);
    s.avatarDataUrl = dataUrl;
  }
  CircleSettings.saveSettings(s);
  CircleSettings.applySiteSettings();
  alert('Profile saved (local)');
});

function readFileAsDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

// playlists add
document.getElementById('add-playlist').addEventListener('click', ()=>{
  const name = document.getElementById('pl-name').value.trim();
  const id = document.getElementById('pl-id').value.trim();
  const bg = document.getElementById('pl-bg').value.trim();
  if(!name || !id){ alert('Please provide name and playlist id'); return; }
  const pls = CircleSettings.loadPlaylists();
  pls.push({ name, id, bg, bgLow: bg });
  CircleSettings.savePlaylists(pls);
  renderPlaylistList();
  CircleSettings.applySiteSettings();
  document.getElementById('pl-name').value=''; document.getElementById('pl-id').value=''; document.getElementById('pl-bg').value='';
});

// save background
document.getElementById('save-bg').addEventListener('click', ()=>{
  const mode = document.getElementById('bg-mode').value;
  const url = document.getElementById('bg-url').value.trim();
  const s = CircleSettings.loadSettings();
  s.background = { mode, url };
  CircleSettings.saveSettings(s);
  CircleSettings.applySiteSettings();
  alert('Background saved (local)');
});

// save settings
document.getElementById('save-settings').addEventListener('click', ()=>{
  const s = CircleSettings.loadSettings();
  s.dataSaver = document.getElementById('data-saver').checked;
  s.privateSite = document.getElementById('private-site').checked;
  s.adminPassword = document.getElementById('admin-password').value || '';
  CircleSettings.saveSettings(s);
  CircleSettings.applySiteSettings();
  alert('Settings saved (local)');
});

// private site gating (local) - apply on page load
function applyLocalGate(){
  const s = CircleSettings.loadSettings();
  if(!s.privateSite) return; // public
  // simple gate: ask for password unless session unlocked
  if(sessionStorage.getItem('circle_admin_unlocked')==='true') return;
  const attempt = prompt('Site is private. Enter admin password to continue:');
  if(attempt === s.adminPassword && attempt !== ''){
    sessionStorage.setItem('circle_admin_unlocked','true');
    return;
  }
  document.body.innerHTML = '<main style="padding:40px; color:#fff; text-align:center;"><h2>Private site</h2><p>Access restricted.</p></main>';
}

// initialize
document.addEventListener('DOMContentLoaded', ()=>{
  populateAdmin();
  applyLocalGate();
});
