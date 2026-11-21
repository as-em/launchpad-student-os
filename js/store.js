const STORAGE_KEY = 'launchpad_bd_cse_simple_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaults),
      ...parsed,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(defaults.tasks),
      opps: Array.isArray(parsed.opps) ? parsed.opps : structuredClone(defaults.opps),
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : structuredClone(defaults.contacts),
      exps: Array.isArray(parsed.exps) ? parsed.exps : structuredClone(defaults.exps),
      taskError: '',
      copiedId: null
    };
  } catch {
    return structuredClone(defaults);
  }
}

let state = loadState();

function save() {
  try {
    const { taskError, copiedId, ...toStore } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
  render();
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
