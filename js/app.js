window.setTab = t => {
  state.tab = t;
  state.taskError = '';
  state.copiedId = null;
  save();
};

window.setFilter = f => {
  state.filter = f;
  save();
};

window.resetAll = () => {
  if (confirm('Reset all data back to sample CSE defaults?')) {
    state = structuredClone(defaults);
    save();
  }
};

window.addTask = e => {
  e.preventDefault();
  const titleEl = document.getElementById('taskTitle');
  const tagEl = document.getElementById('taskTag');
  const minsEl = document.getElementById('taskMins');
  const energyEl = document.getElementById('taskEnergy');

  const title = titleEl ? titleEl.value.trim() : '';
  const energy = energyEl ? energyEl.value : 'High';
  const tag = (tagEl && tagEl.value.trim()) || (energy === 'High' ? 'CSE' : 'Quick');
  const rawMins = minsEl ? parseInt(minsEl.value, 10) : 30;
  const minutes = !Number.isNaN(rawMins) && rawMins > 0 && rawMins <= 1440 ? rawMins : 30;

  if (!title) {
    state.taskError = 'Please enter a task first.';
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

window.toggleTask = id => {
  const t = state.tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    save();
  }
};

window.editTaskTime = id => {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  const val = prompt(`Minutes for "${t.title}":`, String(t.minutes || 30));
  if (val === null) return;
  const mins = parseInt(val, 10);
  if (!Number.isNaN(mins) && mins > 0 && mins <= 1440) {
    t.minutes = mins;
    save();
  }
};

window.deleteTask = id => {
  state.tasks = state.tasks.filter(x => x.id !== id);
  save();
};

window.addOpp = e => {
  e.preventDefault();
  const org = document.getElementById('oppOrg').value.trim();
  const title = document.getElementById('oppTitle').value.trim();
  const deadline = document.getElementById('oppDeadline').value.trim() || 'Dec 25';
  const type = document.getElementById('oppType').value;
  if (!org || !title) return;

  state.opps.unshift({
    id: Date.now(),
    org,
    title,
    type,
    status: 'Wishlist',
    deadline
  });
  save();
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

window.addContact = e => {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const role = document.getElementById('contactRole').value.trim() || 'Alumni / Senior';
  const org = document.getElementById('contactOrg').value.trim() || 'CSE';
  const note = document.getElementById('contactNote').value.trim() || 'Follow up soon.';
  if (!name) return;

  state.contacts.unshift({ id: Date.now(), name, role, org, days: 0, note });
  save();
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

window.addExp = e => {
  e.preventDefault();
  const title = document.getElementById('expTitle').value.trim();
  const metric = document.getElementById('expMetric').value.trim() || 'Project';
  const skill = document.getElementById('expSkill').value;
  const bullet = document.getElementById('expBullet').value.trim();
  if (!title || !bullet) return;

  state.exps.unshift({ id: Date.now(), title, metric, skill, bullet });
  save();
};

window.deleteExp = id => {
  state.exps = state.exps.filter(x => x.id !== id);
  save();
};

window.copyBullet = (id, text) => {
  navigator.clipboard?.writeText(text).catch(() => {});
  state.copiedId = id;
  save();
};

function filteredTasks(energy) {
  return state.tasks.filter(t => {
    if (t.energy !== energy) return false;
    if (state.filter === 'pending' && t.done) return false;
    if (state.filter === 'done' && !t.done) return false;
    return true;
  });
}

function renderTaskRow(t) {
  return `
    <div class="flex items-center justify-between gap-2 rounded p-1.5 text-xs hover:bg-stone-50">
      <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})" />
        <span class="truncate ${t.done ? 'line-through text-stone-400' : ''}">${esc(t.title)}</span>
        <span class="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600">${esc(t.tag)}</span>
      </label>
      <div class="flex shrink-0 items-center gap-1.5">
        <button type="button" onclick="editTaskTime(${t.id})" title="Edit minutes" class="rounded border bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 hover:bg-stone-100">
          ⏱️ ${formatMins(t.minutes)}
        </button>
        <button type="button" onclick="deleteTask(${t.id})" title="Delete" class="text-stone-400 hover:text-red-600">✕</button>
      </div>
    </div>
  `;
}

function render() {
  const cold = state.contacts.filter(c => c.days > 14);
  const activeApps = state.opps.filter(o => o.status !== 'Wishlist').length;
  const offers = state.opps.filter(o => o.status === 'Offer').length;
  const doneTasks = state.tasks.filter(t => t.done).length;
  const leftMins = state.tasks.filter(t => !t.done).reduce((sum, t) => sum + (Number(t.minutes) || 0), 0);

  document.getElementById('app').innerHTML = `
    <div class="h-20 w-full bg-gradient-to-r from-[#064e3b] to-[#0f172a]"></div>
    <div class="mx-auto max-w-5xl px-4 pb-14">
      <div class="-mt-7 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div class="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-2xl shadow-sm">💻</div>
          <h1 class="text-xl font-bold">Launchpad OS — BD CSE</h1>
          <p class="text-xs text-[#787774]">Daily Labs & CP • Internships & Clubs • Alumni/Faculty • CV Bullets</p>
        </div>
        <button type="button" onclick="resetAll()" class="rounded-lg border bg-white px-3 py-1.5 text-xs hover:bg-stone-50">↺ Reset</button>
      </div>

      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Active Apps</div>
          <div class="mt-1 text-lg font-bold">${activeApps} / ${state.opps.length}</div>
        </div>
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Offers</div>
          <div class="mt-1 text-lg font-bold text-emerald-700">${offers}</div>
        </div>
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Follow-Ups (&gt;14d)</div>
          <div class="mt-1 text-lg font-bold text-amber-600">${cold.length}</div>
        </div>
        <div class="rounded-xl border bg-white p-3">
          <div class="text-xs text-[#787774]">Tasks & Time Left</div>
          <div class="mt-1 text-lg font-bold">${doneTasks}/${state.tasks.length} <span class="text-xs font-semibold text-indigo-700">(${formatMins(leftMins)})</span></div>
        </div>
      </div>

      <div class="mb-6 flex gap-2 overflow-x-auto border-b pb-2">
        <button type="button" onclick="setTab('command')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'command' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">📌 Tasks</button>
        <button type="button" onclick="setTab('pipeline')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'pipeline' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">💼 Internships & Clubs</button>
        <button type="button" onclick="setTab('network')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'network' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">🤝 Network</button>
        <button type="button" onclick="setTab('experience')" class="rounded-lg px-3 py-1.5 text-xs font-semibold ${state.tab === 'experience' ? 'bg-[#37352f] text-white' : 'bg-white border hover:bg-stone-50'}">🏆 CV Bullets</button>
      </div>

      ${state.tab === 'command' ? `
        ${cold.length ? `
          <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
            <strong>⏰ Follow Up:</strong> ${cold.map(c => `${esc(c.name)} (${c.days}d)`).join(', ')}
          </div>
        ` : ''}

        <form onsubmit="addTask(event)" class="mb-2 flex flex-wrap gap-2">
          <input id="taskTitle" placeholder="Task (e.g., CSE lab report or Codeforces set)..." class="min-w-[200px] flex-1 rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="taskTag" placeholder="Tag (e.g. CSE-305)" class="w-28 rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="taskMins" type="number" min="1" max="1440" value="30" title="Minutes" class="w-20 rounded-lg border bg-white px-3 py-2 text-xs" />
          <select id="taskEnergy" class="rounded-lg border bg-white px-2.5 py-2 text-xs">
            <option value="High">🧠 Deep Focus</option>
            <option value="Low">⚡ Quick Task</option>
          </select>
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white hover:bg-stone-800">+ Add Task</button>
        </form>

        <div class="mb-3 flex items-center gap-1.5 text-[11px]">
          <button type="button" onclick="setFilter('all')" class="rounded border px-2 py-1 ${state.filter === 'all' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white'}">All</button>
          <button type="button" onclick="setFilter('pending')" class="rounded border px-2 py-1 ${state.filter === 'pending' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white'}">Pending</button>
          <button type="button" onclick="setFilter('done')" class="rounded border px-2 py-1 ${state.filter === 'done' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white'}">Done</button>
        </div>

        ${state.taskError ? `<p class="mb-3 text-xs text-red-600">${esc(state.taskError)}</p>` : ''}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-xl border bg-white p-4">
            <div class="mb-2 text-xs font-bold text-indigo-900">🧠 Deep Focus (Labs, CP & Thesis)</div>
            ${filteredTasks('High').map(renderTaskRow).join('') || '<p class="text-xs text-stone-400">No tasks here.</p>'}
          </div>
          <div class="rounded-xl border bg-white p-4">
            <div class="mb-2 text-xs font-bold text-emerald-900">⚡ Quick Tasks</div>
            ${filteredTasks('Low').map(renderTaskRow).join('') || '<p class="text-xs text-stone-400">No tasks here.</p>'}
          </div>
        </div>
      ` : ''}

      ${state.tab === 'pipeline' ? `
        <form onsubmit="addOpp(event)" class="mb-4 flex flex-wrap gap-2">
          <input id="oppOrg" placeholder="Company / Club" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="oppTitle" placeholder="Role / Opportunity" class="min-w-[180px] flex-1 rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="oppDeadline" placeholder="Deadline" class="w-24 rounded-lg border bg-white px-3 py-2 text-xs" />
          <select id="oppType" class="rounded-lg border bg-white px-2.5 py-2 text-xs">
            <option>Internship</option><option>Club Role</option><option>Research</option>
          </select>
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white">+ Add</button>
        </form>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
          ${STAGES.map(st => `
            <div class="rounded-xl border bg-stone-100/70 p-3">
              <div class="mb-2 text-xs font-bold">${st}</div>
              <div class="space-y-2">
                ${state.opps.filter(o => o.status === st).map(o => `
                  <div class="rounded-lg border bg-white p-3 text-xs">
                    <div class="flex justify-between text-[10px] font-semibold text-[#787774]">
                      <span>${esc(o.org)}</span>
                      <span>${esc(o.deadline)}</span>
                    </div>
                    <div class="mt-0.5 font-semibold">${esc(o.title)}</div>
                    <div class="mt-2 flex items-center justify-between">
                      <button type="button" onclick="cycleStage(${o.id})" class="rounded border px-2 py-1 text-[11px] hover:bg-stone-50">Next →</button>
                      <button type="button" onclick="deleteOpp(${o.id})" class="text-stone-400 hover:text-red-600">✕</button>
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
          <input id="contactName" placeholder="Name" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="contactRole" placeholder="Role (e.g. SWE)" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="contactOrg" placeholder="Company / Dept" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="contactNote" placeholder="Note" class="min-w-[150px] flex-1 rounded-lg border bg-white px-3 py-2 text-xs" />
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white">+ Add</button>
        </form>
        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b bg-stone-50 text-[#787774]">
              <tr><th class="p-3">Name</th><th class="p-3">Org</th><th class="p-3">Last Ping</th><th class="p-3">Action</th></tr>
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
                  <td class="p-3">
                    <div class="flex items-center gap-2">
                      <button type="button" onclick="pingContact(${c.id})" class="rounded border px-2 py-1 hover:bg-stone-50">Pinged</button>
                      <button type="button" onclick="deleteContact(${c.id})" class="text-stone-400 hover:text-red-600">✕</button>
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
          <input id="expTitle" placeholder="Project / Contest Title" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <input id="expMetric" placeholder="Result (e.g. 2k users)" class="rounded-lg border bg-white px-3 py-2 text-xs" />
          <select id="expSkill" class="rounded-lg border bg-white px-2.5 py-2 text-xs">
            ${SKILL_OPTIONS.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
          </select>
          <button type="submit" class="rounded-lg bg-[#37352f] px-4 py-2 text-xs font-medium text-white">+ Add Bullet</button>
          <input id="expBullet" placeholder="CV bullet point..." class="rounded-lg border bg-white px-3 py-2 text-xs sm:col-span-4" />
        </form>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          ${state.exps.map(e => `
            <div class="rounded-xl border bg-white p-4 text-xs">
              <div class="flex items-start justify-between gap-2 font-bold">
                <span>${esc(e.title)}</span>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-700">${esc(e.metric)}</span>
                  <button type="button" onclick="deleteExp(${e.id})" class="text-stone-400 hover:text-red-600">✕</button>
                </div>
              </div>
              <p class="mt-1.5 text-[#55534e]">• ${esc(e.bullet)}</p>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-[11px] text-[#787774]">${esc(e.skill)}</span>
                <button type="button" onclick="copyBullet(${e.id}, '${esc(e.bullet)}')" class="rounded border px-2 py-0.5 text-[11px] hover:bg-stone-50">
                  ${state.copiedId === e.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

render();
