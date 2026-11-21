setInterval(() => {
  if (state.activeTimerId) {
    state.elapsedSeconds += 1;
    persistOnly();
    const el = document.getElementById('live-timer-clock');
    if (el) el.textContent = formatClock(state.elapsedSeconds);
  }
}, 1000);

window.toggleLang = () => {
  state.lang = state.lang === 'en' ? 'bn' : 'en';
  save();
};

window.exportBackup = () => {
  const { taskError, copiedBulletId, ...persistentState } = state;
  const blob = new Blob([JSON.stringify(persistentState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `launchpad-cse-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importBackup = file => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.tasks)) {
        alert('Invalid backup file.');
        return;
      }
      state = {
        ...structuredClone(defaults),
        ...data,
        taskError: '',
        copiedBulletId: null
      };
      save();
      alert('Backup restored successfully!');
    } catch {
      alert('Could not read JSON backup file.');
    }
  };
  reader.readAsText(file);
};

window.setTab = t => {
  state.tab = t;
  state.copiedBulletId = null;
  state.taskError = '';
  save();
};

window.setTaskFilter = f => {
  state.taskFilter = f;
  save();
};

window.setTaskQuery = q => {
  state.taskQuery = q;
  render();
};

window.clearCompletedTasks = () => {
  state.tasks = state.tasks.filter(t => !t.done);
  save();
};

window.startTimer = id => {
  if (state.activeTimerId && state.activeTimerId !== id) {
    window.stopTimer();
  }
  state.activeTimerId = id;
  state.elapsedSeconds = 0;
  save();
};

window.stopTimer = () => {
  if (!state.activeTimerId) return;
  const t = state.tasks.find(x => x.id === state.activeTimerId);
  const loggedMins = Math.max(1, Math.round(state.elapsedSeconds / 60));
  if (t && state.elapsedSeconds >= 10) {
    t.minutes = (Number(t.minutes) || 0) + loggedMins;
  }
  state.activeTimerId = null;
  state.elapsedSeconds = 0;
  save();
};

window.resetAll = () => {
  if (confirm('Reset all tasks, applications, contacts, and projects back to sample CSE data?')) {
    state = structuredClone(defaults);
    save();
  }
};

window.cycleStage = id => {
  const o = state.opps.find(x => x.id === id);
  if (o) {
    o.status = STAGES[(STAGES.indexOf(o.status) + 1) % STAGES.length];
    save();
  }
};

window.deleteOpp = id => {
  state.opps = state.opps.filter(x => x.id !== id);
  save();
};

window.addOpp = e => {
  e.preventDefault();
  const org = document.getElementById('oppOrg').value.trim();
  const title = document.getElementById('oppTitle').value.trim();
  const type = document.getElementById('oppType').value;
  const deadline = document.getElementById('oppDeadline').value.trim() || 'Dec 25';
  const skill = document.getElementById('oppSkill').value;
  if (!org || !title) return;

  state.opps.unshift({
    id: Date.now(),
    org,
    title,
    type,
    status: 'Wishlist',
    deadline,
    skills: [skill, 'DSA / CP'],
    desc: `${title} at ${org}. Key skills: ${skill}, problem solving, teamwork.`
  });
  save();
};

window.toggleTask = id => {
  const t = state.tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    if (t.done && state.activeTimerId === id) {
      state.activeTimerId = null;
      state.elapsedSeconds = 0;
    }
    save();
  }
};

window.editTaskTime = id => {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  const input = prompt(`Set time in minutes for "${t.title}":`, String(t.minutes || 30));
  if (input === null) return;
  const parsed = parseInt(input, 10);
  if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 1440) {
    t.minutes = parsed;
    save();
  } else {
    alert('Please enter a valid number of minutes (1 to 1440).');
  }
};

window.deleteTask = id => {
  if (state.activeTimerId === id) {
    state.activeTimerId = null;
    state.elapsedSeconds = 0;
  }
  state.tasks = state.tasks.filter(x => x.id !== id);
  save();
};

window.addTask = e => {
  e.preventDefault();
  const titleInput = document.getElementById('taskTitle');
  const tagInput = document.getElementById('taskTag');
  const energySelect = document.getElementById('taskEnergy');
  const minutesInput = document.getElementById('taskMinutes');

  const title = titleInput ? titleInput.value.trim() : '';
  const energy = energySelect ? energySelect.value : 'High';
  const tag = (tagInput && tagInput.value.trim()) || (energy === 'High' ? 'Study/CP' : 'Quick');
  const rawMins = minutesInput ? parseInt(minutesInput.value, 10) : (energy === 'High' ? 60 : 15);
  const minutes = !Number.isNaN(rawMins) && rawMins > 0 && rawMins <= 1440 ? rawMins : (energy === 'High' ? 60 : 15);

  if (!title) {
    state.taskError = 'Please type a task before clicking Add Task.';
    render();
    document.getElementById('taskTitle')?.focus();
    return;
  }

  state.taskError = '';
  state.tasks.unshift({
    id: Date.now(),
    title,
    tag,
    energy,
    minutes,
    done: false
  });
  save();
  document.getElementById('taskTitle')?.focus();
};

window.pingContact = id => {
  const c = state.contacts.find(x => x.id === id);
  if (c) {
    c.days = 0;
    save();
  }
};

window.deleteContact = id => {
  state.contacts = state.contacts.filter(x => x.id !== id);
  save();
};

window.addContact = e => {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const role = document.getElementById('contactRole').value.trim() || 'Senior / Alumni';
  const org = document.getElementById('contactOrg').value.trim() || 'Tech / Campus';
  const note = document.getElementById('contactNote').value.trim() || 'Connected for internship / thesis guidance.';
  if (!name) return;

  state.contacts.unshift({
    id: Date.now(),
    name,
    role,
    org,
    days: 0,
    note
  });
  save();
};

window.deleteExp = id => {
  state.exps = state.exps.filter(x => x.id !== id);
  save();
};

window.addExp = e => {
  e.preventDefault();
  const title = document.getElementById('expTitle').value.trim();
  const metric = document.getElementById('expMetric').value.trim() || 'Course / Side Project';
  const skill = document.getElementById('expSkill').value;
  const bullet = document.getElementById('expBullet').value.trim();
  if (!title || !bullet) return;

  state.exps.unshift({
    id: Date.now(),
    title,
    metric,
    skills: [skill],
    bullet
  });
  save();
};

window.copyBullet = (id, text) => {
  navigator.clipboard?.writeText(text).catch(() => {});
  state.copiedBulletId = id;
  save();
};

window.openTailor = id => {
  const o = state.opps.find(x => x.id === id);
  state.modalOppId = id;
  state.customDesc = o ? o.desc : '';
  state.copiedBulletId = null;
  save();
};

window.closeTailor = () => {
  state.modalOppId = null;
  state.copiedBulletId = null;
  save();
};

window.updateDesc = val => {
  state.customDesc = val;
  render();
};

function getFilteredTasks(energy) {
  const q = (state.taskQuery || '').trim().toLowerCase();
  return state.tasks.filter(t => {
    if (t.energy !== energy) return false;
    if (state.taskFilter === 'pending' && t.done) return false;
    if (state.taskFilter === 'done' && !t.done) return false;
    if (q && !t.title.toLowerCase().includes(q) && !String(t.tag).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderTaskRow(t) {
  const isTiming = state.activeTimerId === t.id;
  return `
    <div class="flex items-center justify-between gap-2 rounded p-1.5 text-xs hover:bg-stone-50">
      <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})" />
        <span class="truncate ${t.done ? 'line-through text-stone-400' : ''}">${esc(t.title)}</span>
        <span class="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">${esc(t.tag)}</span>
      </label>
      <div class="flex shrink-0 items-center gap-1">
        <button type="button" onclick="editTaskTime(${t.id})" title="Click to edit time in minutes" class="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 hover:bg-stone-100">
          ⏱️ ${formatMins(t.minutes)}
        </button>
        ${!t.done ? `
          <button type="button" onclick="${isTiming ? 'stopTimer()' : `startTimer(${t.id})`}" title="${isTiming ? 'Stop & add time' : 'Start focus timer'}" class="rounded border px-1.5 py-0.5 text-[10px] font-medium ${isTiming ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'}">
            ${isTiming ? '⏹ Stop' : '▶'}
          </button>
        ` : ''}
        <button type="button" onclick="deleteTask(${t.id})" title="Delete" class="px-1 text-stone-400 hover:text-red-600">✕</button>
      </div>
    </div>
  `;
}

function render() {
  const t = I18N[state.lang] || I18N.en;
  const cold = state.contacts.filter(c => c.days > 14);
  const activeCount = state.opps.filter(o => o.status !== 'Wishlist').length;
  const offersCount = state.opps.filter(o => o.status === 'Offer').length;
  const doneCount = state.tasks.filter(x => x.done).length;
  const totalMins = state.tasks.reduce((sum, x) => sum + (Number(x.minutes) || 0), 0);
  const remainingMins = state.tasks.filter(x => !x.done).reduce((sum, x) => sum + (Number(x.minutes) || 0), 0);
  const activeTimerTask = state.tasks.find(x => x.id === state.activeTimerId);

  let modalHtml = '';
  if (state.modalOppId) {
    const opp = state.opps.find(x => x.id === state.modalOppId);
    const text = (state.customDesc || '').toLowerCase();
    const matched = state.exps
      .map(exp => ({
        ...exp,
        hits: exp.skills.filter(s => text.includes(s.toLowerCase()))
      }))
      .sort((a, b) => b.hits.length - a.hits.length);
    const chosen = matched.some(m => m.hits.length > 0)
      ? matched.filter(m => m.hits.length > 0)
      : matched.slice(0, 2);

    modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#e3e2de] bg-white p-5 shadow-xl">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <div class="text-sm font-bold">CV & Interview Bullet Matcher — ${esc(opp?.org || '')}</div>
              <div class="text-xs text-[#787774]">${esc(opp?.title || '')}</div>
            </div>
            <button onclick="closeTailor()" class="rounded border px-2.5 py-1 text-xs hover:bg-stone-50">Close</button>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs font-semibold text-[#787774]">Job / Lab / Club Requirements (try C++, Python, React, SQL, ML)</label>
              <textarea oninput="updateDesc(this.value)" rows="6" class="mt-1.5 w-full rounded-lg border p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300">${esc(state.customDesc)}</textarea>
            </div>
            <div class="space-y-2">
              <div class="text-xs font-semibold text-purple-700">Best Matching Projects & Activities</div>
              ${chosen.map(m => `
                <div class="rounded-lg border p-2.5 text-xs">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-semibold">${esc(m.title)} <span class="text-emerald-700">(${esc(m.metric)})</span></span>
                    <button onclick="copyBullet(${m.id}, '${esc(m.bullet)}')" class="rounded border px-2 py-0.5 text-[11px] hover:bg-stone-50">
                      ${state.copiedBulletId === m.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p class="mt-1 text-[#55534e]">• ${esc(m.bullet)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById('app').innerHTML = `
    <div class="h-24 w-full bg-gradient-to-r from-[#064e3b] via-[#0f172a] to-[#1e293b]"></div>
    <div class="mx-auto max-w-5xl px-4 pb-16">
      <div class="-mt-8 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div class="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl border bg-white text-2xl shadow-sm">💻</div>
          <h1 class="text-2xl font-bold">${esc(t.title)}</h1>
          <p class="text-xs text-[#787774]">${esc(t.subtitle)}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="exportBackup()" class="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50">⬇ Backup JSON</button>
          <label class="cursor-pointer rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
            ⬆ Restore JSON
            <input type="file" accept="application/json" class="hidden" onchange="importBackup(this.files[0]); this.value='';" />
          </label>
          <button type="button" onclick="toggleLang()" class="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50">
            ${state.lang === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button type="button" onclick="resetAll()" class="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-stone-50">${esc(t.reset)}</button>
        </div>
      </div>

      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Active Applications</div>
          <div class="mt-1 text-xl font-bold">${activeCount} / ${state.opps.length}</div>
        </div>
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Offers / Selections</div>
          <div class="mt-1 text-xl font-bold text-emerald-700">${offersCount}</div>
        </div>
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Follow-Up Due (&gt;14d)</div>
          <div class="mt-1 text-xl font-bold text-amber-600">${cold.length}</div>
        </div>
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Tasks & Time Left</div>
          <div class="mt-1 text-xl font-bold">${doneCount}/${state.tasks.length} <span class="text-xs font-semibold text-indigo-700">(${formatMins(remainingMins)} left)</span></div>
        </div>
      </div>

      <div class="mb-6 flex gap-2 overflow-x-auto border-b pb-2">
        <button type="button" onclick="setTab('command')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'command' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">${esc(t.tabCommand)}</button>
        <button type="button" onclick="setTab('pipeline')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'pipeline' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">${esc(t.tabPipeline)}</button>
        <button type="button" onclick="setTab('network')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'network' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">${esc(t.tabNetwork)}</button>
        <button type="button" onclick="setTab('experience')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'experience' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">${esc(t.tabExp)}</button>
      </div>

      ${state.tab === 'command' ? `
        ${activeTimerTask ? `
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs text-indigo-950">
            <div>
              <strong>⏱️ Focusing on:</strong> ${esc(activeTimerTask.title)}
              <span id="live-timer-clock" class="ml-2 rounded bg-white px-2 py-0.5 font-mono font-bold text-indigo-700">${formatClock(state.elapsedSeconds)}</span>
            </div>
            <button type="button" onclick="stopTimer()" class="rounded bg-indigo-700 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-800">Finish & Log Time</button>
          </div>
        ` : ''}

        ${cold.length ? `
          <div class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
            <strong>⏰ Follow-Up Reminder:</strong> It has been over 2 weeks since you checked in with ${cold.map(c => `<strong>${esc(c.name)}</strong> (${c.days}d)`).join(', ')}.
          </div>
        ` : ''}

        <form onsubmit="addTask(event)" class="mb-2 flex flex-wrap gap-2">
          <input id="taskTitle" placeholder="e.g., Practice 2 graph problems or finish CSE lab..." class="min-w-[200px] flex-1 rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300" />
          <input id="taskTag" placeholder="Course / Tag (e.g. CSE-311)" class="w-32 rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300" />
          <input id="taskMinutes" type="number" min="1" max="1440" list="presetMinutes" value="45" title="Estimated time in minutes" class="w-24 rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300" />
          <datalist id="presetMinutes">
            <option value="15"></option>
            <option value="30"></option>
            <option value="45"></option>
            <option value="60"></option>
            <option value="90"></option>
            <option value="120"></option>
          </datalist>
          <select id="taskEnergy" class="rounded-lg border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-300">
            <option value="High">🧠 Deep Focus (Lab / CP / Thesis)</option>
            <option value="Low">⚡ Quick Task (5–15m)</option>
          </select>
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 active:scale-[0.99]">${esc(t.addTask)}</button>
        </form>

        <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#787774]">
          <div class="flex flex-wrap items-center gap-1.5">
            <input value="${esc(state.taskQuery)}" oninput="setTaskQuery(this.value)" placeholder="Search task or tag..." class="rounded-md border bg-white px-2.5 py-1 text-xs text-[#37352f]" />
            <button type="button" onclick="setTaskFilter('all')" class="rounded-md border px-2 py-1 ${state.taskFilter === 'all' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white'}">All</button>
            <button type="button" onclick="setTaskFilter('pending')" class="rounded-md border px-2 py-1 ${state.taskFilter === 'pending' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white'}">Pending</button>
            <button type="button" onclick="setTaskFilter('done')" class="rounded-md border px-2 py-1 ${state.taskFilter === 'done' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white'}">Done</button>
            ${doneCount > 0 ? `<button type="button" onclick="clearCompletedTasks()" class="rounded-md border bg-white px-2 py-1 text-red-700 hover:bg-red-50">Clear Done (${doneCount})</button>` : ''}
          </div>
          <span>Saved in browser • Planned: <strong>${formatMins(totalMins)}</strong> • Remaining: <strong>${formatMins(remainingMins)}</strong></span>
        </div>

        ${state.taskError ? `<p class="mb-4 text-xs font-medium text-red-600">${esc(state.taskError)}</p>` : ''}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-xl border bg-white p-4">
            <div class="mb-2 flex items-center justify-between text-xs font-bold text-indigo-900">
              <span>🧠 Deep Focus (Labs, CP, Thesis & Prep)</span>
              <span class="text-[11px] font-semibold text-indigo-700">${formatMins(state.tasks.filter(x => x.energy === 'High' && !x.done).reduce((s, x) => s + x.minutes, 0))} left</span>
            </div>
            ${getFilteredTasks('High').map(renderTaskRow).join('') || '<p class="text-xs text-stone-400">No matching deep focus tasks.</p>'}
          </div>
          <div class="rounded-xl border bg-white p-4">
            <div class="mb-2 flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>⚡ Quick Wins (Messages, Forms, Small Fixes)</span>
              <span class="text-[11px] font-semibold text-emerald-700">${formatMins(state.tasks.filter(x => x.energy === 'Low' && !x.done).reduce((s, x) => s + x.minutes, 0))} left</span>
            </div>
            ${getFilteredTasks('Low').map(renderTaskRow).join('') || '<p class="text-xs text-stone-400">No matching quick tasks.</p>'}
          </div>
        </div>
      ` : ''}

      ${state.tab === 'pipeline' ? `
        <form onsubmit="addOpp(event)" class="mb-4 flex flex-wrap gap-2">
          <input id="oppOrg" placeholder="Company / Club / Lab (e.g. BJIT, ACM)" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="oppTitle" placeholder="Role / Opportunity" class="min-w-[180px] flex-1 rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="oppDeadline" placeholder="Deadline (e.g. Dec 25)" class="w-28 rounded-lg border bg-white px-3 py-2 text-xs" />
          <select id="oppSkill" class="rounded-lg border bg-white px-2.5 py-2 text-xs">
            ${SKILL_OPTIONS.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
          </select>
          <select id="oppType" class="rounded-lg border bg-white px-2.5 py-2 text-xs">
            <option>Internship</option><option>Club Role</option><option>Research</option>
          </select>
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white">+ Add</button>
        </form>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
          ${STAGES.map(st => `
            <div class="rounded-xl border bg-stone-100/70 p-3">
              <div class="mb-2 flex items-center justify-between text-xs font-bold">
                <span>${st}</span>
                <span class="text-stone-500">${state.opps.filter(o => o.status === st).length}</span>
              </div>
              <div class="space-y-2">
                ${state.opps.filter(o => o.status === st).map(o => `
                  <div class="rounded-lg border bg-white p-3 text-xs">
                    <div class="flex items-center justify-between text-[10px] font-semibold text-[#787774]">
                      <span>${esc(o.org)}</span>
                      <span>Due: ${esc(o.deadline)}</span>
                    </div>
                    <div class="mt-0.5 font-semibold">${esc(o.title)}</div>
                    <div class="mt-2 flex items-center justify-between gap-1">
                      <div class="flex gap-1">
                        <button type="button" onclick="openTailor(${o.id})" class="rounded bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100">Match CV</button>
                        <button type="button" onclick="cycleStage(${o.id})" class="rounded border px-2 py-1 text-[11px] hover:bg-stone-50">Next →</button>
                      </div>
                      <button type="button" onclick="deleteOpp(${o.id})" title="Remove" class="px-1 text-stone-400 hover:text-red-600">✕</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${state.tab === 'network' ? `
        <form onsubmit="addContact(event)" class="mb-4 flex flex-wrap gap-2">
          <input id="contactName" placeholder="Name (Senior / Alumni / Teacher)" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="contactRole" placeholder="Role (e.g. SWE, Lecturer)" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="contactOrg" placeholder="Org / Dept" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="contactNote" placeholder="Short note" class="min-w-[160px] flex-1 rounded-lg border bg-white px-3 py-2 text-xs" />
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white">+ Add Contact</button>
        </form>
        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b bg-stone-50 text-[#787774]">
              <tr><th class="p-3">Name</th><th class="p-3">Org / Dept</th><th class="p-3">Last Ping</th><th class="p-3">Status</th><th class="p-3">Action</th></tr>
            </thead>
            <tbody class="divide-y">
              ${state.contacts.map(c => `
                <tr>
                  <td class="p-3">
                    <div class="font-medium">${esc(c.name)} <span class="text-[#787774]">(${esc(c.role)})</span></div>
                    <div class="text-[11px] text-[#787774]">${esc(c.note)}</div>
                  </td>
                  <td class="p-3">${esc(c.org)}</td>
                  <td class="p-3">${c.days === 0 ? 'Today' : c.days + 'd ago'}</td>
                  <td class="p-3">${c.days > 14 ? '<span class="rounded bg-amber-100 px-2 py-0.5 text-amber-900">⏰ Follow Up</span>' : '<span class="rounded bg-emerald-100 px-2 py-0.5 text-emerald-900">✅ Active</span>'}</td>
                  <td class="p-3">
                    <div class="flex items-center gap-1.5">
                      <button type="button" onclick="pingContact(${c.id})" class="rounded border px-2 py-1 hover:bg-stone-50">Mark Pinged</button>
                      <button type="button" onclick="deleteContact(${c.id})" title="Delete contact" class="px-1 text-stone-400 hover:text-red-600">✕</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${state.tab === 'experience' ? `
        <form onsubmit="addExp(event)" class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input id="expTitle" placeholder="Project / Contest / Club Title" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="expMetric" placeholder="Impact / Metric (e.g. 90% acc, 2nd place)" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <select id="expSkill" class="rounded-lg border bg-white px-2.5 py-2 text-xs">
            ${SKILL_OPTIONS.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
          </select>
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white">+ Add Project Bullet</button>
          <input id="expBullet" placeholder="Write 1 strong CV bullet point (what you built, tech stack, and result)..." class="rounded-lg border bg-white px-3 py-2 text-xs sm:col-span-4" />
        </form>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          ${state.exps.map(e => `
            <div class="rounded-xl border bg-white p-4 text-xs">
              <div class="flex items-start justify-between gap-2 font-bold">
                <span>${esc(e.title)}</span>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="text-emerald-700">${esc(e.metric)}</span>
                  <button type="button" onclick="deleteExp(${e.id})" title="Delete project" class="text-stone-400 hover:text-red-600">✕</button>
                </div>
              </div>
              <p class="mt-1.5 text-[#55534e]">• ${esc(e.bullet)}</p>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-[11px] text-[#787774]">Tags: ${esc(e.skills.join(', '))}</span>
                <button type="button" onclick="copyBullet(${e.id}, '${esc(e.bullet)}')" class="rounded border px-2 py-0.5 text-[11px] hover:bg-stone-50">
                  ${state.copiedBulletId === e.id ? 'Copied!' : 'Copy Bullet'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    ${modalHtml}
  `;
}

render();
