const STORAGE_KEY = 'launchpad_bd_cse_v1';

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || structuredClone(defaults);
state.lang = state.lang || 'en';
state.tab = state.tab || 'command';
state.taskFilter = state.taskFilter || 'all';
state.taskQuery = state.taskQuery || '';
state.activeTimerId = state.activeTimerId || null;
state.elapsedSeconds = Number(state.elapsedSeconds) || 0;
state.taskError = state.taskError || '';
state.tasks = (state.tasks || []).map(t => ({
  ...t,
  minutes: Number(t.minutes) > 0 ? Number(t.minutes) : 30
}));

function persistOnly() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function save() {
  persistOnly();
  if (typeof render === 'function') render();
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function formatMins(mins) {
  const m = Math.max(0, Number(mins) || 0);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

function formatClock(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
                        }
