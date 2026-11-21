const STORAGE_KEY = 'launchpad_bd_cse_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    const merged = {
      ...structuredClone(defaults),
      ...parsed,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(defaults.tasks),
      opps: Array.isArray(parsed.opps) ? parsed.opps : structuredClone(defaults.opps),
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : structuredClone(defaults.contacts),
      exps: Array.isArray(parsed.exps) ? parsed.exps : structuredClone(defaults.exps)
    };
    merged.elapsedSeconds = Number(merged.elapsedSeconds) || 0;
    merged.taskError = '';
    merged.tasks = merged.tasks.map(t => ({
      ...t,
      minutes: Number(t.minutes) > 0 ? Number(t.minutes) : 30
    }));
    return merged;
  } catch {
    return structuredClone(defaults);
  }
}

let state = loadState();

function persistOnly() {
  try {
    const { taskError, copiedBulletId, ...persistentState } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
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
