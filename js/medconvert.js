/* ==========================================
   MEDCONVERT — Ghibli-Inspired Medical Toolkit
   Complete JavaScript — Fully Functional
   ========================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => { initializeApp(); });

function initializeApp() {
    checkOnboarding();
    initializeClock();
    initializeTabs();
    initializeConverters();
    initializeTheme();
    loadNotes();
    setGreeting();
    setDailyFooterMessage();
    initializePinnedTools();
    renderCalcHistory();
    initShiftCountdown();
    initBackToTop();
    initScrollReveal();
    initDrugPanel();
    registerServiceWorker();
}

/* ==================== PROFILE STORE ==================== */
function getProfile() {
    try { const r = localStorage.getItem('medconvert_profile'); return r ? JSON.parse(r) : null; }
    catch { return null; }
}

function saveProfile(p) {
    try { localStorage.setItem('medconvert_profile', JSON.stringify(p)); } catch {}
}

function getName() {
    const p = getProfile();
    return p ? p.name : 'there';
}

/* ==================== THEME ==================== */
function initializeTheme() {
    const saved = localStorage.getItem('medconvert_theme') || 'light';
    applyTheme(saved);
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('medconvert_theme', next);
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.innerHTML = theme === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

/* ==================== ONBOARDING ==================== */
function checkOnboarding() {
    if (!getProfile()) showOnboarding();
    else applyProfileData();
}

function buildOnboardingHTML(profile) {
    const p = profile || {};
    const isEdit = !!profile;
    const iconSVG = isEdit
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M9 22V12h6v10"/><path d="M12 8v4M10 10h4"/></svg>';
    return `
        <div class="onboarding-card">
            <div class="onboarding-logo">${iconSVG}</div>
            <h2 class="onboarding-title">${isEdit ? 'Your Settings' : 'Welcome to MedConvert'}</h2>
            <p class="onboarding-subtitle">${isEdit ? 'Update your profile anytime.' : "Let's personalise your experience — it only takes a moment."}</p>
            <div class="onboarding-field">
                <label>Your Name</label>
                <input type="text" id="ob-name" value="${p.name || ''}" placeholder="e.g. Abigail" autocomplete="off">
            </div>
            <div class="onboarding-field">
                <label>Unit / Specialty</label>
                <select id="ob-specialty">
                    <option value="">Select your unit...</option>
                    ${['ICU','ED','Peds','Med-Surg','OR','Oncology','Cardiology','OB','Other'].map(s => `<option value="${s}"${p.specialty === s ? ' selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="onboarding-field">
                <label>Shift Type</label>
                <div class="shift-picker">
                    <button class="shift-opt${p.shift === 'Day' ? ' selected' : ''}" data-shift="Day" type="button" onclick="selectShift(this)">Days</button>
                    <button class="shift-opt${p.shift === 'Night' ? ' selected' : ''}" data-shift="Night" type="button" onclick="selectShift(this)">Nights</button>
                    <button class="shift-opt${p.shift === 'Rotating' ? ' selected' : ''}" data-shift="Rotating" type="button" onclick="selectShift(this)">Rotating</button>
                </div>
                <input type="hidden" id="ob-shift" value="${p.shift || ''}">
            </div>
            <div class="onboarding-field">
                <label>Shift Hours (for countdown)</label>
                <div class="shift-time-row">
                    <div><span class="time-lbl">Start</span><input type="time" id="ob-shift-start" value="${p.shiftStart || '07:00'}"></div>
                    <span class="time-sep">&#8594;</span>
                    <div><span class="time-lbl">End</span><input type="time" id="ob-shift-end" value="${p.shiftEnd || '19:00'}"></div>
                </div>
            </div>
            ${isEdit
                ? `<div style="display:flex;gap:1rem;margin-top:1.5rem;">
                    <button class="onboarding-submit" style="flex:1" type="button" onclick="submitOnboarding()">Save Changes</button>
                    <button class="onboarding-submit" type="button" style="flex:0 0 auto;background:var(--bg-input);color:var(--text-primary);border-color:var(--border);" onclick="document.getElementById('onboarding-overlay').remove()">Cancel</button>
                   </div>`
                : `<button class="onboarding-submit" type="button" onclick="submitOnboarding()">Get Started</button>`
            }
        </div>`;
}

function showOnboarding() {
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = buildOnboardingHTML(null);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { requestAnimationFrame(() => overlay.classList.add('visible')); });
}

window.openSettings = function () {
    const existing = document.getElementById('onboarding-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = buildOnboardingHTML(getProfile());
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { requestAnimationFrame(() => overlay.classList.add('visible')); });
};

window.selectShift = function (btn) {
    document.querySelectorAll('.shift-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('ob-shift').value = btn.dataset.shift;
};

window.submitOnboarding = function () {
    const name = (document.getElementById('ob-name').value.trim()) || 'there';
    const specialty = document.getElementById('ob-specialty').value || 'General';
    const shift = document.getElementById('ob-shift').value || 'Day';
    const shiftStart = document.getElementById('ob-shift-start').value || '07:00';
    const shiftEnd = document.getElementById('ob-shift-end').value || '19:00';
    saveProfile({ name, specialty, shift, shiftStart, shiftEnd });
    const overlay = document.getElementById('onboarding-overlay');
    overlay.classList.remove('visible');
    overlay.classList.add('hiding');
    setTimeout(() => {
        overlay.remove();
        applyProfileData();
        setGreeting();
        initShiftCountdown();
        setDailyFooterMessage();
    }, 400);
};

function applyProfileData() {
    const p = getProfile();
    if (!p) return;
    const el = document.getElementById('subtitle-text');
    if (el) el.innerHTML = `For ${p.name} &middot; <span class="specialty-badge">${p.specialty}</span>`;
}

/* ==================== SHIFT COUNTDOWN ==================== */
function initShiftCountdown() {
    const p = getProfile();
    const el = document.getElementById('shift-countdown');
    if (!el) return;
    if (!p?.shiftStart || !p?.shiftEnd) { el.style.display = 'none'; return; }

    function update() {
        const now = new Date();
        const [sh, sm] = p.shiftStart.split(':').map(Number);
        const [eh, em] = p.shiftEnd.split(':').map(Number);
        let end = new Date(now); end.setHours(eh, em, 0, 0);
        let start = new Date(now); start.setHours(sh, sm, 0, 0);
        if (end <= start) end.setDate(end.getDate() + 1);

        const inShift = now >= start && now < end;
        if (!inShift) {
            if (now >= end) start.setDate(start.getDate() + 1);
            const diff = start - now;
            const hrs = Math.floor(diff / 3600000), mins = Math.floor((diff % 3600000) / 60000);
            el.innerHTML = `<span class="cd-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6M12 5v-3"/></svg></span><span class="cd-text">Shift starts in <strong>${hrs}h ${mins}m</strong></span>`;
            el.className = 'shift-countdown cd-pre';
        } else {
            const diff = end - now;
            const hrs = Math.floor(diff / 3600000), mins = Math.floor((diff % 3600000) / 60000);
            const pct = Math.round(((end - start - diff) / (end - start)) * 100);
            const ending = hrs < 2;
            const iconPath = ending
                ? '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'
                : '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>';
            el.innerHTML = `
                <span class="cd-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg></span>
                <span class="cd-text"><strong>${hrs}h ${mins}m</strong> remaining in shift</span>
                <div class="cd-bar"><div class="cd-fill" style="width:${pct}%"></div></div>`;
            el.className = `shift-countdown ${ending ? 'cd-ending' : 'cd-active'}`;
        }
        el.style.display = 'flex';
    }
    update();
    setInterval(update, 60000);
}

/* ==================== PINNED TOOLS ==================== */
const ALL_TABS = [
    { id: 'timer', label: 'Timer', icon: 'icon-timer' },
    { id: 'dosage', label: 'Dosage', icon: 'icon-pill' },
    { id: 'iv', label: 'IV & Drip', icon: 'icon-drip' },
    { id: 'vitals', label: 'Vitals', icon: 'icon-heart' },
    { id: 'assessment', label: 'Assessment', icon: 'icon-chart' },
    { id: 'pediatric', label: 'Pediatric', icon: 'icon-baby' },
    { id: 'lab', label: 'Lab Values', icon: 'icon-flask' },
    { id: 'convert', label: 'Converters', icon: 'icon-swap' },
    { id: 'reference', label: 'Reference', icon: 'icon-book' },
    { id: 'notes', label: 'Notes', icon: 'icon-notes' },
    { id: 'drugs', label: 'Drug Ref', icon: 'icon-syringe' },
];

function getPinned() { try { const r = localStorage.getItem('medconvert_pinned'); return r ? JSON.parse(r) : []; } catch { return []; } }
function savePinned(p) { try { localStorage.setItem('medconvert_pinned', JSON.stringify(p)); } catch {} }
function initializePinnedTools() { renderPinnedSection(); }

function renderPinnedSection() {
    const pinned = getPinned();
    const container = document.getElementById('pinned-tools');
    if (!container) return;
    if (pinned.length === 0) {
        container.innerHTML = `<div class="pinned-empty"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>Pin your most-used tools for quick access</span></div>`;
        return;
    }
    container.innerHTML = `<div class="pinned-grid">
        ${pinned.map(id => {
            const t = ALL_TABS.find(x => x.id === id);
            return t ? `<button class="pinned-btn" onclick="switchToTab('${id}')"><svg><use href="#${t.icon}"/></svg>${t.label}</button>` : '';
        }).join('')}
    </div>`;
}

window.openPinManager = function () {
    const pinned = getPinned();
    const overlay = document.createElement('div');
    overlay.id = 'pin-overlay';
    overlay.innerHTML = `
        <div class="onboarding-card">
            <div class="onboarding-logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h2 class="onboarding-title">Manage Pinned Tools</h2>
            <p class="onboarding-subtitle">Select up to 4 tools to pin for quick access.</p>
            <div class="pin-grid">
                ${ALL_TABS.map(t => `
                    <label class="pin-option${pinned.includes(t.id) ? ' pinned' : ''}">
                        <input type="checkbox" value="${t.id}"${pinned.includes(t.id) ? ' checked' : ''} onchange="togglePin(this)">
                        ${t.label}
                    </label>`).join('')}
            </div>
            <button class="onboarding-submit" type="button" onclick="closePinManager()">Done</button>
        </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { requestAnimationFrame(() => overlay.classList.add('visible')); });
};

window.togglePin = function (cb) {
    let pinned = getPinned();
    if (cb.checked) {
        if (pinned.length >= 4) {
            cb.checked = false;
            cb.closest('.pin-option').classList.remove('pinned');
            showToast('Maximum 4 pinned tools', 'warning');
            return;
        }
        pinned.push(cb.value);
        cb.closest('.pin-option').classList.add('pinned');
    } else {
        pinned = pinned.filter(p => p !== cb.value);
        cb.closest('.pin-option').classList.remove('pinned');
    }
    savePinned(pinned);
    renderPinnedSection();
};

window.closePinManager = function () {
    const o = document.getElementById('pin-overlay');
    if (o) { o.classList.remove('visible'); o.classList.add('hiding'); setTimeout(() => o.remove(), 400); }
};

/* ==================== CALCULATION HISTORY ==================== */
function getHistory() { try { const r = localStorage.getItem('medconvert_history'); return r ? JSON.parse(r) : []; } catch { return []; } }

function addToHistory(category, label, value) {
    let h = getHistory();
    h.unshift({ id: Date.now(), category, label, value, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) });
    h = h.slice(0, 9);
    try { localStorage.setItem('medconvert_history', JSON.stringify(h)); } catch {}
    renderCalcHistory();
}

function renderCalcHistory() {
    const container = document.getElementById('calc-history');
    if (!container) return;
    const h = getHistory();
    if (h.length === 0) {
        container.innerHTML = `<div class="history-empty">No calculations yet — results will appear here</div>`;
        return;
    }
    container.innerHTML = h.slice(0, 3).map(e => `
        <div class="history-item">
            <div class="history-meta">
                <span class="history-cat">${e.category}</span>
                <span class="history-time">${e.time}</span>
            </div>
            <div class="history-label">${e.label}</div>
            <div class="history-value">${e.value}</div>
        </div>`).join('');
}

/* ==================== TOAST ==================== */
function showToast(msg, type = 'info') {
    const ex = document.getElementById('mc-toast');
    if (ex) ex.remove();
    const t = document.createElement('div');
    t.id = 'mc-toast';
    t.className = `mc-toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('visible')); });
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 350); }, 2800);
}

/* ==================== RESULTS ==================== */
function showResult(resultElId, valueElId, displayValue, status, note, noteElId, interpElId, interpHtml) {
    const resultEl = document.getElementById(resultElId);
    const valueEl = document.getElementById(valueElId);
    if (!resultEl || !valueEl) return;
    valueEl.textContent = displayValue;
    resultEl.classList.remove('result-normal', 'result-warning', 'result-danger', 'result-neutral');
    resultEl.classList.add(`result-${status || 'neutral'}`, 'show');
    if (noteElId && note !== undefined) { const n = document.getElementById(noteElId); if (n) n.textContent = note || ''; }
    if (interpElId && interpHtml !== undefined) { const i = document.getElementById(interpElId); if (i) i.innerHTML = interpHtml || ''; }
    if (navigator.vibrate) navigator.vibrate(12);
}

/* ==================== CLOCK & GREETING ==================== */
function initializeClock() {
    const t = document.getElementById('clock-time'), d = document.getElementById('clock-date');
    function update() {
        const now = new Date();
        if (t) t.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        if (d) d.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    update();
    setInterval(update, 1000);
}

function setGreeting() {
    const h = new Date().getHours(), name = getName(), el = document.getElementById('greeting');
    if (!el) return;
    const msgs = [
        [0, 5, `Night shift? You are remarkable, ${name}.`],
        [5, 12, `Good morning, ${name}. Ready for a great shift?`],
        [12, 14, `Good afternoon — hope you can find a moment to rest, ${name}.`],
        [14, 18, `Afternoon is going well? Keep it up, ${name}.`],
        [18, 22, `Evening shift — almost there, ${name}. You are doing brilliantly.`],
        [22, 24, `Late shift — you are a superstar, ${name}.`]
    ];
    el.textContent = (msgs.find(([s, e]) => h >= s && h < e) || msgs[5])[2];
}

function setDailyFooterMessage() {
    const el = document.getElementById('daily-message');
    if (!el) return;
    const name = getName();
    const msgs = [
        `You are making a real difference in people's lives, ${name}.`,
        `Every patient you help is fortunate to have your care.`,
        `Your kindness and skill do not go unnoticed.`,
        `Take a deep breath — you are doing wonderfully.`,
        `Remember to take care of yourself too, ${name}.`,
        `Your dedication inspires everyone around you.`,
        `One step at a time — you have got this.`,
        `Your compassion makes all the difference.`,
        `You are stronger than you know, ${name}.`,
        `Thank you for everything you do — you are extraordinary.`,
        `Your patients are fortunate to have your care.`,
        `Stay hydrated and keep that wonderful smile going.`,
        `You bring hope and healing wherever you go.`,
        `Your hard work never goes unappreciated.`,
        `You are an absolute hero in scrubs, ${name}.`
    ];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    el.textContent = msgs[day % msgs.length];
}

/* ==================== NAVIGATION ==================== */
function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchToTab(btn.getAttribute('data-tab')));
    });
}

window.switchToTab = function (tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.calc-card').forEach(p => p.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const panel = document.getElementById(`panel-${tabId}`);
    if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
    if (panel) panel.classList.add('active');
    if (navigator.vibrate) navigator.vibrate(8);
};

window.showSubPanel = function (subId) {
    const clickedBtn = event.currentTarget || event.target;
    const parentCard = clickedBtn.closest('.calc-card');
    if (parentCard) {
        parentCard.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
        parentCard.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    } else {
        document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    }
    clickedBtn.classList.add('active');
    const panel = document.getElementById(`sub-${subId}`);
    if (panel) panel.classList.add('active');
    if (navigator.vibrate) navigator.vibrate(5);
};

/* ==================== TIMER ==================== */
let timerInterval = null;

window.startTimer = function (seconds) {
    const display = document.getElementById('timer-countdown');
    if (timerInterval) clearInterval(timerInterval);
    let left = seconds;
    updateTimerDisplay(left);
    timerInterval = setInterval(() => {
        left--;
        updateTimerDisplay(left);
        if (left <= 0) {
            clearInterval(timerInterval);
            display.textContent = 'Done';
            display.style.color = 'var(--dusty-rose)';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
            showToast('Timer complete', 'success');
        }
    }, 1000);
    if (navigator.vibrate) navigator.vibrate(12);
};

window.startCustomTimer = function () {
    const v = parseInt(document.getElementById('custom-timer-input').value);
    if (v && v > 0) startTimer(v);
    else showToast('Please enter a valid number of seconds', 'warning');
};

function updateTimerDisplay(s) {
    const d = document.getElementById('timer-countdown');
    d.textContent = s >= 60 ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` : s.toString().padStart(2, '0');
    d.style.color = s <= 5 && s > 0 ? 'var(--danger)' : 'var(--forest)';
}

window.resetTimer = function () {
    if (timerInterval) clearInterval(timerInterval);
    const d = document.getElementById('timer-countdown');
    d.textContent = '00';
    d.style.color = 'var(--forest)';
    if (navigator.vibrate) navigator.vibrate(5);
};

/* ==================== DOSAGE ==================== */
window.calculateDosage = function () {
    const D = parseFloat(document.getElementById('dose-desired').value);
    const H = parseFloat(document.getElementById('dose-stock').value);
    const Q = parseFloat(document.getElementById('dose-volume').value);
    if (!D || !H || !Q) { showToast('Please fill in all fields', 'warning'); return; }
    if (H === 0) { showToast('Dose on hand cannot be zero', 'warning'); return; }
    const result = (D / H) * Q;
    const display = `${result.toFixed(2)} mL`;
    showResult('dosage-result', 'dosage-result-value', display, 'neutral');
    addToHistory('Dosage', 'D/H×Q', display);
};

window.calculateWeightDose = function () {
    const w = parseFloat(document.getElementById('weight-dose-kg').value);
    const d = parseFloat(document.getElementById('weight-dose-per-kg').value);
    const f = parseInt(document.getElementById('weight-dose-freq').value) || 1;
    if (!w || !d) { showToast('Please enter weight and dose per kg', 'warning'); return; }
    const single = w * d, daily = single * f;
    const display = `${single.toFixed(1)} mg / dose`;
    showResult('weight-dose-result', 'weight-dose-value', display, 'neutral', `Total daily: ${daily.toFixed(1)} mg (${f}× per day)`, 'weight-dose-note');
    addToHistory('Dosage', 'Weight-based', display);
};

window.calculateBSA = function () {
    const h = parseFloat(document.getElementById('bsa-height').value);
    const w = parseFloat(document.getElementById('bsa-weight').value);
    if (!h || !w) { showToast('Please enter height and weight', 'warning'); return; }
    const bsa = Math.sqrt((h * w) / 3600);
    const display = `${bsa.toFixed(2)} m²`;
    showResult('bsa-result', 'bsa-value', display, 'neutral');
    window.currentBSA = bsa;
    addToHistory('Dosage', 'BSA', display);
};

window.calculateBSADose = function () {
    if (!window.currentBSA) { showToast('Calculate BSA first', 'warning'); return; }
    const d = parseFloat(document.getElementById('bsa-dose-per-m2').value);
    if (!d) { showToast('Enter dose per m²', 'warning'); return; }
    const total = window.currentBSA * d;
    const display = `${total.toFixed(1)} mg`;
    showResult('bsa-dose-result', 'bsa-dose-value', display, 'neutral');
    addToHistory('Dosage', 'BSA Dose', display);
};

/* ==================== IV & DRIP ==================== */
window.calculateIV = function () {
    const vol = parseFloat(document.getElementById('iv-volume').value);
    const time = parseFloat(document.getElementById('iv-time').value);
    const gtt = parseFloat(document.getElementById('iv-gtt').value);
    if (!vol || !time || !gtt) { showToast('Please fill in all fields', 'warning'); return; }
    const rate = (vol * gtt) / time, rounded = Math.round(rate);
    const display = `${rounded} gtt/min`;
    const re = document.getElementById('iv-result');
    document.getElementById('iv-result-value').textContent = display;
    document.getElementById('iv-result-note').textContent = `Count ${Math.round(rate / 4)} drops every 15 seconds`;
    document.getElementById('iv-ml-hr').textContent = `Flow rate: ${Math.round((vol / time) * 60)} mL/hr`;
    re.classList.remove('result-normal', 'result-warning', 'result-danger', 'result-neutral');
    re.classList.add('result-neutral', 'show');
    addToHistory('IV/Drip', 'Drip Rate', display);
    if (navigator.vibrate) navigator.vibrate(12);
};

window.calculateInfusionTime = function () {
    const vol = parseFloat(document.getElementById('infusion-volume').value);
    const rate = parseFloat(document.getElementById('infusion-rate').value);
    if (!vol || !rate) { showToast('Please enter volume and rate', 'warning'); return; }
    const hrs = vol / rate, wh = Math.floor(hrs), mins = Math.round((hrs - wh) * 60);
    const comp = new Date(Date.now() + hrs * 3600000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const display = wh > 0 ? `${wh} hr ${mins} min` : `${mins} min`;
    showResult('infusion-time-result', 'infusion-time-value', display, 'neutral', `Completes at approximately ${comp}`, 'infusion-completion');
    addToHistory('IV/Drip', 'Infusion Time', display);
};

window.calculateConcentration = function () {
    const drug = parseFloat(document.getElementById('conc-drug').value);
    const vol = parseFloat(document.getElementById('conc-volume').value);
    const unit = document.getElementById('conc-unit').value;
    if (!drug || !vol) { showToast('Please enter drug amount and volume', 'warning'); return; }
    const conc = drug / vol;
    const display = `${conc.toFixed(3)} ${unit}/mL`;
    showResult('concentration-result', 'concentration-value', display, 'neutral');
    addToHistory('IV/Drip', 'Concentration', display);
};

/* ==================== VITALS ==================== */
window.calculateMAP = function () {
    const sys = parseFloat(document.getElementById('bp-sys').value);
    const dia = parseFloat(document.getElementById('bp-dia').value);
    if (!sys || !dia) { showToast('Please enter both blood pressure values', 'warning'); return; }
    const map = Math.round(dia + (sys - dia) / 3);
    const display = `${map} mmHg`;
    let status = map >= 70 ? 'normal' : map >= 65 ? 'warning' : 'danger';
    let note = map >= 70 ? 'Adequate perfusion pressure' : map >= 65 ? 'Borderline — monitor closely' : 'Below target — consider intervention';
    showResult('map-result', 'map-value', display, status, note, 'map-interpretation');
    addToHistory('Vitals', 'MAP', display);
};

window.calculatePP = function () {
    const sys = parseFloat(document.getElementById('pp-sys').value);
    const dia = parseFloat(document.getElementById('pp-dia').value);
    if (!sys || !dia) { showToast('Please enter both blood pressure values', 'warning'); return; }
    const pp = sys - dia;
    const display = `${pp} mmHg`;
    let status = (pp >= 25 && pp <= 60) ? 'normal' : (pp < 25) ? 'warning' : 'danger';
    let note = pp < 25 ? 'Narrow — consider reduced stroke volume' : pp > 60 ? 'Wide — consider aortic regurgitation or stiff vessels' : 'Normal pulse pressure';
    showResult('pp-result', 'pp-value', display, status, note, 'pp-note');
    addToHistory('Vitals', 'Pulse Pressure', display);
};

window.calculateShockIndex = function () {
    const hr = parseFloat(document.getElementById('si-hr').value);
    const sbp = parseFloat(document.getElementById('si-sbp').value);
    if (!hr || !sbp) { showToast('Please enter heart rate and systolic BP', 'warning'); return; }
    const si = hr / sbp;
    const display = si.toFixed(2);
    let status = si < 0.6 ? 'normal' : si <= 1.0 ? 'warning' : 'danger';
    let note = si < 0.6 ? 'Normal — no haemodynamic compromise' : si <= 1.0 ? 'Mild haemodynamic stress — monitor' : 'Significant haemodynamic compromise — act promptly';
    showResult('si-result', 'si-value', display, status, note, 'si-note');
    addToHistory('Vitals', 'Shock Index', display);
};

window.calculateAAGradient = function () {
    const fio2 = parseFloat(document.getElementById('aa-fio2').value);
    const paco2 = parseFloat(document.getElementById('aa-paco2').value);
    const pao2 = parseFloat(document.getElementById('aa-pao2').value);
    if (!fio2 || !paco2 || !pao2) { showToast('Please fill in all ABG fields', 'warning'); return; }
    const pao2_alveolar = (fio2 / 100) * (760 - 47) - paco2 / 0.8;
    const aa = pao2_alveolar - pao2;
    const normalUpper = 15;
    const display = `${aa.toFixed(1)} mmHg`;
    let status = aa <= normalUpper ? 'normal' : aa <= 35 ? 'warning' : 'danger';
    let note = aa <= normalUpper ? 'Normal gradient — lungs are functioning well' : aa <= 35 ? 'Mildly elevated — possible early lung disease' : 'Significantly elevated — intrinsic lung pathology likely';
    showResult('aa-result', 'aa-value', display, status, note, 'aa-note');
    addToHistory('Vitals', 'A-a Gradient', display);
};

/* ==================== ASSESSMENT ==================== */
window.calculateGCS = function () {
    const e = parseInt(document.getElementById('gcs-eye').value);
    const v = parseInt(document.getElementById('gcs-verbal').value);
    const m = parseInt(document.getElementById('gcs-motor').value);
    const total = e + v + m;
    let status = total >= 13 ? (total >= 15 ? 'normal' : 'warning') : 'danger';
    let label = total === 15 ? 'Fully alert (E' + e + 'V' + v + 'M' + m + ')' : total >= 13 ? 'Minor — (E' + e + 'V' + v + 'M' + m + ')' : total >= 9 ? 'Moderate head injury (E' + e + 'V' + v + 'M' + m + ')' : 'Severe — immediate action required (E' + e + 'V' + v + 'M' + m + ')';
    showResult('gcs-result', 'gcs-result-value', `${total}`, status, label, 'gcs-interpretation');
    addToHistory('Assessment', 'GCS', `${total} pts`);
};

window.calculateBMI = function () {
    const h = parseFloat(document.getElementById('bmi-height').value);
    const w = parseFloat(document.getElementById('bmi-weight').value);
    if (!h || !w || h <= 0 || w <= 0) { showToast('Please enter valid height and weight', 'warning'); return; }
    const bmi = w / Math.pow(h / 100, 2);
    const display = bmi.toFixed(1);
    let status = 'normal', cat = 'Normal weight';
    if (bmi < 18.5) { status = 'warning'; cat = 'Underweight'; }
    else if (bmi >= 30) { status = 'danger'; cat = 'Obese'; }
    else if (bmi >= 25) { status = 'warning'; cat = 'Overweight'; }
    showResult('bmi-result', 'bmi-result-value', display, status, cat, 'bmi-category');
    addToHistory('Assessment', 'BMI', display);
};

window.calculateEGFR = function () {
    const age = parseInt(document.getElementById('egfr-age').value);
    const sex = document.getElementById('egfr-sex').value;
    const cr = parseFloat(document.getElementById('egfr-cr').value);
    if (!age || !cr) { showToast('Please enter age and creatinine', 'warning'); return; }
    const kappa = sex === 'female' ? 0.7 : 0.9, alpha = sex === 'female' ? -0.329 : -0.411;
    const sf = sex === 'female' ? 1.018 : 1.0;
    const egfr = Math.round(141 * Math.pow(Math.min(cr / kappa, 1), alpha) * Math.pow(Math.max(cr / kappa, 1), -1.209) * Math.pow(0.993, age) * sf);
    const display = `${egfr} mL/min/1.73m²`;
    let status = egfr >= 60 ? 'normal' : egfr >= 30 ? 'warning' : 'danger';
    let stage = egfr >= 90 ? '<strong>Stage 1:</strong> Normal or high' : egfr >= 60 ? '<strong>Stage 2:</strong> Mildly decreased' : egfr >= 45 ? '<strong>Stage 3a:</strong> Mild-to-moderate decrease' : egfr >= 30 ? '<strong>Stage 3b:</strong> Moderate-to-severe decrease' : egfr >= 15 ? '<strong>Stage 4:</strong> Severely decreased' : '<strong>Stage 5:</strong> Kidney failure';
    showResult('egfr-result', 'egfr-value', display, status, null, null, 'egfr-stage', stage);
    addToHistory('Assessment', 'eGFR', display);
};

window.calculateWells = function () {
    let score = 0;
    for (let i = 1; i <= 9; i++) {
        const cb = document.getElementById(`wells-${i}`);
        if (cb && cb.checked) score += parseInt(cb.value);
    }
    const display = `${score} points`;
    let status = score <= 0 ? 'normal' : score <= 2 ? 'warning' : 'danger';
    let interp = score <= 0
        ? '<strong>Low Risk:</strong> ~5% probability — D-dimer recommended'
        : score <= 2
            ? '<strong>Moderate Risk:</strong> ~17% probability — D-dimer recommended'
            : '<strong>High Risk:</strong> 17–53% probability — Consider duplex ultrasound';
    showResult('wells-result', 'wells-value', display, status, null, null, 'wells-interpretation', interp);
    addToHistory('Assessment', 'Wells DVT', display);
};

/* ==================== PEDIATRIC ==================== */
window.calculatePedsWeight = function () {
    const age = parseInt(document.getElementById('peds-age').value);
    if (!age || age < 1 || age > 10) { showToast('Enter age between 1 and 10 years', 'warning'); return; }
    const display = `${(age * 2) + 8} kg`;
    showResult('peds-weight-result', 'peds-weight-value', display, 'neutral');
    addToHistory('Pediatric', 'Weight Est.', display);
};

window.calculatePedsDose = function () {
    const w = parseFloat(document.getElementById('peds-dose-weight').value);
    const med = document.getElementById('peds-medication').value;
    if (!w || !med) { showToast('Enter weight and select medication', 'warning'); return; }
    const doses = {
        acetaminophen: [`${(w * 15).toFixed(1)} mg/dose`, `q4-6h PRN · max ${(w * 75).toFixed(1)} mg/day`],
        ibuprofen: [`${(w * 10).toFixed(1)} mg/dose`, `q6-8h PRN · max ${(w * 40).toFixed(1)} mg/day`],
        amoxicillin: [`${(w * 20).toFixed(1)}–${(w * 40).toFixed(1)} mg/day`, `Divided q8-12h`],
        azithromycin: [`Day 1: ${(w * 10).toFixed(1)} mg`, `Days 2–5: ${(w * 5).toFixed(1)} mg once daily`],
        ceftriaxone: [`${(w * 50).toFixed(1)}–${(w * 100).toFixed(1)} mg`, `Once or twice daily · max 2000 mg/day`]
    };
    const [dose, note] = doses[med];
    const re = document.getElementById('peds-dose-result');
    document.getElementById('peds-dose-value').textContent = dose;
    document.getElementById('peds-dose-note').textContent = note;
    re.classList.remove('result-normal', 'result-warning', 'result-danger', 'result-neutral');
    re.classList.add('result-neutral', 'show');
    addToHistory('Pediatric', med, dose);
    if (navigator.vibrate) navigator.vibrate(12);
};

window.calculateAPGAR = function () {
    const total = ['apgar-appearance', 'apgar-pulse', 'apgar-grimace', 'apgar-activity', 'apgar-respiration']
        .reduce((s, id) => s + parseInt(document.getElementById(id).value), 0);
    let status = total >= 7 ? 'normal' : total >= 4 ? 'warning' : 'danger';
    let interp = total >= 7
        ? '<strong>Normal:</strong> Baby is doing well. Routine care.'
        : total >= 4
            ? '<strong>Moderately Abnormal:</strong> Stimulation and supplemental oxygen needed.'
            : '<strong>Severely Abnormal:</strong> Immediate resuscitation required.';
    showResult('apgar-result', 'apgar-value', `${total}`, status, null, null, 'apgar-interpretation', interp);
    addToHistory('Pediatric', 'APGAR', `${total}/10`);
};

/* ==================== LAB CONVERTER ==================== */
const LAB_CONVERSIONS = {
    glucose:      { factor: 0.0555, conventional: 'mg/dL', si: 'mmol/L', decimals: 1, normalConv: '70–100 mg/dL (fasting)', normalSI: '3.9–5.6 mmol/L' },
    cholesterol:  { factor: 0.0259, conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '<200 mg/dL', normalSI: '<5.2 mmol/L' },
    hdl:          { factor: 0.0259, conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '>40 mg/dL (M)', normalSI: '>1.0 mmol/L (M)' },
    ldl:          { factor: 0.0259, conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '<100 mg/dL', normalSI: '<2.6 mmol/L' },
    triglycerides:{ factor: 0.0113, conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '<150 mg/dL', normalSI: '<1.7 mmol/L' },
    creatinine:   { factor: 88.4,   conventional: 'mg/dL', si: 'µmol/L', decimals: 0, normalConv: '0.7–1.3 mg/dL (M)', normalSI: '62–115 µmol/L (M)' },
    bun:          { factor: 0.357,  conventional: 'mg/dL', si: 'mmol/L', decimals: 1, normalConv: '7–20 mg/dL', normalSI: '2.5–7.1 mmol/L' },
    calcium:      { factor: 0.25,   conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '8.5–10.5 mg/dL', normalSI: '2.1–2.6 mmol/L' },
    magnesium:    { factor: 0.411,  conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '1.7–2.2 mg/dL', normalSI: '0.7–0.9 mmol/L' },
    phosphate:    { factor: 0.323,  conventional: 'mg/dL', si: 'mmol/L', decimals: 2, normalConv: '2.5–4.5 mg/dL', normalSI: '0.8–1.5 mmol/L' },
    bilirubin:    { factor: 17.1,   conventional: 'mg/dL', si: 'µmol/L', decimals: 1, normalConv: '0.1–1.2 mg/dL', normalSI: '2–21 µmol/L' }
};

window.convertLab = function () {
    const type = document.getElementById('lab-type').value;
    const value = parseFloat(document.getElementById('lab-value').value);
    const sys = document.getElementById('lab-unit-system').value;
    if (!value) { showToast('Please enter a lab value', 'warning'); return; }
    if (value < 0) { showToast('Lab values cannot be negative', 'warning'); return; }
    const c = LAB_CONVERSIONS[type];
    const result = sys === 'conventional' ? value * c.factor : value / c.factor;
    const unit = sys === 'conventional' ? c.si : c.conventional;
    const normal = sys === 'conventional' ? c.normalSI : c.normalConv;
    const display = `${result.toFixed(c.decimals)} ${unit}`;
    showResult('lab-result', 'lab-result-value', display, 'neutral', `Normal range: ${normal}`, 'lab-normal-range');
    addToHistory('Lab', type, display);
};

/* ==================== LIVE CONVERTERS ==================== */
function initializeConverters() {
    const lbs = document.getElementById('weight-lbs'), kg = document.getElementById('weight-kg');
    if (lbs && kg) {
        lbs.addEventListener('input', e => { const v = parseFloat(e.target.value); kg.value = v >= 0 ? (v / 2.20462).toFixed(2) : ''; });
        kg.addEventListener('input', e => { const v = parseFloat(e.target.value); lbs.value = v >= 0 ? (v * 2.20462).toFixed(2) : ''; });
    }

    const cel = document.getElementById('temp-celsius'), fahr = document.getElementById('temp-fahrenheit');
    if (cel && fahr) {
        cel.addEventListener('input', e => { const v = parseFloat(e.target.value); fahr.value = !isNaN(v) ? ((v * 9 / 5) + 32).toFixed(1) : ''; });
        fahr.addEventListener('input', e => { const v = parseFloat(e.target.value); cel.value = !isNaN(v) ? ((v - 32) * 5 / 9).toFixed(1) : ''; });
    }

    const ft = document.getElementById('height-feet'), ins = document.getElementById('height-inches'), cm = document.getElementById('height-cm');
    if (ft && ins && cm) {
        const fromFtIn = () => {
            const f = parseFloat(ft.value) || 0, i = parseFloat(ins.value) || 0;
            cm.value = (f > 0 || i > 0) ? ((f * 12 + i) * 2.54).toFixed(1) : '';
        };
        ft.addEventListener('input', fromFtIn);
        ins.addEventListener('input', fromFtIn);
        cm.addEventListener('input', e => {
            const v = parseFloat(e.target.value);
            if (v > 0) { const ti = v / 2.54; ft.value = Math.floor(ti / 12); ins.value = (ti % 12).toFixed(1); }
            else { ft.value = ''; ins.value = ''; }
        });
    }
}

/* ==================== NOTES ==================== */
function loadNotes() {
    const ta = document.getElementById('shift-notes');
    if (!ta) return;
    try { const saved = localStorage.getItem('medconvert_notes'); if (saved) ta.value = saved; } catch {}
    let saveTimeout;
    ta.addEventListener('input', e => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try { localStorage.setItem('medconvert_notes', e.target.value); showToast('Notes saved', 'success'); } catch {}
        }, 800);
    });
}

window.clearNotes = function () {
    if (confirm('Clear all notes? This action cannot be undone.')) {
        document.getElementById('shift-notes').value = '';
        try { localStorage.removeItem('medconvert_notes'); } catch {}
        showToast('Notes cleared', 'info');
    }
};

window.exportNotes = function () {
    const notes = document.getElementById('shift-notes').value;
    if (!notes.trim()) { showToast('No notes to export', 'warning'); return; }
    const date = new Date().toISOString().split('T')[0];
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedConvert_Notes_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Notes exported', 'success');
};

/* ==================== DRUG REFERENCE ==================== */
const DRUG_DB = [
    { name: 'Adenosine', category: 'Cardiac', route: 'IV', dose: '6 mg rapid IVP; repeat 12 mg if no response', onset: '~10 sec', peak: '~30 sec', notes: 'SVT termination. Flush immediately with rapid NS bolus.' },
    { name: 'Amiodarone', category: 'Antiarrhythmic', route: 'IV/PO', dose: '150 mg IV over 10 min (loading)', onset: '1–3 hrs IV', peak: 'Days–weeks', notes: 'Pulmonary/thyroid toxicity with long-term use. Monitor QT.' },
    { name: 'Atropine', category: 'Anticholinergic', route: 'IV/IM', dose: '0.5–1 mg IV q3-5 min (max 3 mg)', onset: '<1 min IV', peak: '2–4 min', notes: 'Bradycardia. Min 0.5 mg to avoid paradoxical bradycardia.' },
    { name: 'Cefazolin', category: 'Antibiotic', route: 'IV/IM', dose: '1–2 g q8h; surgical prophylaxis: 2 g', onset: '30 min', peak: '1–2 hrs', notes: '1st-gen cephalosporin. Reduce dose in renal impairment.' },
    { name: 'Dextrose 50%', category: 'Metabolic', route: 'IV', dose: '25 g (50 mL D50W)', onset: '1–3 min', peak: '5–10 min', notes: 'Symptomatic hypoglycaemia. Ensure patent IV — vesicant.' },
    { name: 'Diltiazem', category: 'Cardiac', route: 'IV/PO', dose: '0.25 mg/kg IV over 2 min', onset: '2–5 min', peak: '2–7 min', notes: 'A-fib/flutter rate control. Contraindicated in WPW, severe HF.' },
    { name: 'Dopamine', category: 'Vasopressor', route: 'IV infusion', dose: '2–20 mcg/kg/min', onset: '2–5 min', peak: 'Minutes', notes: 'Low dose: dopaminergic; mid: beta-1; high: alpha-1. Vesicant.' },
    { name: 'Epinephrine', category: 'Emergency', route: 'IV/IM/ET', dose: 'Cardiac arrest: 1 mg IV q3-5 min', onset: '<1 min', peak: '3–5 min', notes: 'Anaphylaxis IM (1:1000): 0.3–0.5 mg. Always have available.' },
    { name: 'Furosemide', category: 'Diuretic', route: 'IV/PO', dose: '20–80 mg IV (0.5–1 mg/kg)', onset: '5 min IV', peak: '30 min', notes: 'Monitor K+, Na+, fluid status. Ototoxicity at high doses.' },
    { name: 'Heparin', category: 'Anticoagulant', route: 'IV/SubQ', dose: 'DVT: 80 u/kg bolus, then 18 u/kg/hr', onset: '<5 min IV', peak: 'Minutes', notes: 'Monitor aPTT q6h. Antidote: Protamine sulfate. HIT risk.' },
    { name: 'Hydralazine', category: 'Antihypertensive', route: 'IV/IM/PO', dose: '10–20 mg IV q4-6h PRN', onset: '5–20 min IV', peak: '10–80 min', notes: 'Pregnancy-associated hypertension. Reflex tachycardia common.' },
    { name: 'Insulin (Regular)', category: 'Metabolic', route: 'IV/SubQ/IM', dose: 'DKA infusion: 0.1 units/kg/hr', onset: '30 min SubQ', peak: '2–4 hrs SubQ', notes: 'IV onset 15 min. Monitor glucose q1h on infusion. Refrigerate.' },
    { name: 'Ketorolac', category: 'Analgesic', route: 'IV/IM', dose: '15–30 mg q6h (max 5 days)', onset: '30 min', peak: '1–2 hrs', notes: 'Max 5-day course. Avoid in renal insufficiency or GI bleeding.' },
    { name: 'Labetalol', category: 'Antihypertensive', route: 'IV/PO', dose: '10–20 mg IV q10 min (max 300 mg)', onset: '2–5 min IV', peak: '5–15 min', notes: 'Alpha + beta blockade. Avoid in asthma, severe bradycardia, acute HF.' },
    { name: 'Lorazepam', category: 'Benzodiazepine', route: 'IV/IM/PO/SL', dose: 'Status epilepticus: 4 mg IV over 2 min', onset: '1–5 min IV', peak: '15–20 min', notes: 'Sedation: 0.5–2 mg IV. Monitor respirations. Refrigerate.' },
    { name: 'Magnesium Sulfate', category: 'Electrolyte', route: 'IV', dose: 'Eclampsia: 4–6 g over 15–20 min', onset: '1–2 min IV', peak: 'Minutes', notes: 'Torsades: 1–2 g IV. Monitor Mg levels and deep tendon reflexes.' },
    { name: 'Metoprolol', category: 'Beta-Blocker', route: 'IV/PO', dose: '5 mg IV q5min x3 (ACS)', onset: '1–2 min IV', peak: '5–15 min', notes: 'STEMI: up to 15 mg IV. Contraindicated in acute decompensated HF.' },
    { name: 'Midazolam', category: 'Benzodiazepine', route: 'IV/IM/IN', dose: 'Procedural sedation: 1–2.5 mg IV slowly', onset: '<2 min IV', peak: '3–5 min', notes: 'Amnestic. Short-acting. Respiratory depression risk.' },
    { name: 'Morphine', category: 'Opioid Analgesic', route: 'IV/IM/SubQ/PO', dose: '2–4 mg IV q3-4h PRN', onset: '5–10 min IV', peak: '20 min IV', notes: 'Histamine release possible. Antidote: Naloxone. Monitor respirations.' },
    { name: 'Naloxone', category: 'Reversal Agent', route: 'IV/IM/IN/SubQ', dose: '0.4–2 mg IV/IM q2-3 min', onset: '1–2 min IV', peak: '5–15 min', notes: 'Opioid reversal. Duration shorter than morphine — repeat as needed.' },
    { name: 'Nitroglycerin', category: 'Vasodilator', route: 'SL/IV/Topical', dose: 'ACS SL: 0.4 mg q5 min x3', onset: '1–3 min SL', peak: '3–5 min', notes: 'Hold if SBP <90. IV: 5–200 mcg/min. Avoid with PDE-5 inhibitors.' },
    { name: 'Norepinephrine', category: 'Vasopressor', route: 'IV infusion', dose: '0.01–3 mcg/kg/min (titrate to MAP)', onset: '1–2 min', peak: 'Minutes', notes: 'First-line in septic shock. Central line preferred. Vesicant.' },
    { name: 'Ondansetron', category: 'Antiemetic', route: 'IV/PO/IM', dose: '4 mg IV over 2–5 min q4-8h', onset: '<5 min IV', peak: '30 min', notes: 'QT prolongation risk at high doses. Safe in pregnancy.' },
    { name: 'Potassium Chloride', category: 'Electrolyte', route: 'IV/PO', dose: 'IV: max 10–20 mEq/hr (peripheral)', onset: 'During infusion', peak: 'N/A', notes: 'NEVER IV push. Monitor ECG continuously. Dilute appropriately.' },
    { name: 'Propofol', category: 'Sedative', route: 'IV infusion', dose: 'ICU sedation: 5–50 mcg/kg/min', onset: '<1 min', peak: '1–2 min', notes: 'Propofol infusion syndrome risk with high or prolonged doses.' },
    { name: 'Vancomycin', category: 'Antibiotic', route: 'IV', dose: '15–20 mg/kg q8-12h (max 3 g/dose)', onset: '30–60 min', peak: '1–2 hrs post-infusion', notes: 'Infuse over at least 60 min. Red Man Syndrome risk with rapid infusion. Monitor AUC/MIC.' }
];

const DRUG_CATEGORIES = [...new Set(DRUG_DB.map(d => d.category))].sort();

window.initDrugPanel = function () {
    const sel = document.getElementById('drug-category-filter');
    if (sel && sel.options.length <= 1) {
        DRUG_CATEGORIES.forEach(cat => {
            const o = document.createElement('option');
            o.value = cat;
            o.textContent = cat;
            sel.appendChild(o);
        });
    }
};

function makeDrugTagSVG(iconPath) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`;
}

window.searchDrugs = function () {
    const q = document.getElementById('drug-search').value.toLowerCase().trim();
    const cat = document.getElementById('drug-category-filter').value;
    const el = document.getElementById('drug-results');
    if (!q && !cat) {
        el.innerHTML = `<div class="drug-placeholder">Start typing to search ${DRUG_DB.length} drugs, or filter by category above.</div>`;
        return;
    }
    const results = DRUG_DB.filter(d => {
        const mq = !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.notes.toLowerCase().includes(q) || d.dose.toLowerCase().includes(q);
        const mc = !cat || d.category === cat;
        return mq && mc;
    });
    if (results.length === 0) {
        el.innerHTML = `<div class="drug-placeholder">No results found for "${q || cat}"</div>`;
        return;
    }
    el.innerHTML = results.map(d => `
        <div class="drug-card">
            <div class="drug-header">
                <span class="drug-name">${d.name}</span>
                <span class="drug-badge">${d.category}</span>
            </div>
            <div class="drug-meta">
                <span class="drug-tag">${makeDrugTagSVG('<path d="M17 8C8 10 5.9 16.17 3.82 19.17a2 2 0 1 0 3.29 2.13L9.6 17M17 8V3M17 8h-5"/>')} ${d.route}</span>
                <span class="drug-tag">${makeDrugTagSVG('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>')} Onset: ${d.onset}</span>
                <span class="drug-tag">${makeDrugTagSVG('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>')} Peak: ${d.peak}</span>
            </div>
            <div class="drug-dose"><strong>Dose:</strong> ${d.dose}</div>
            <div class="drug-notes">${d.notes}</div>
        </div>`).join('');
};

window.clearDrugSearch = function () {
    document.getElementById('drug-search').value = '';
    document.getElementById('drug-category-filter').value = '';
    document.getElementById('drug-results').innerHTML = `<div class="drug-placeholder">Start typing to search ${DRUG_DB.length} drugs, or filter by category above.</div>`;
};

/* ==================== BACK TO TOP ==================== */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==================== SCROLL REVEAL ==================== */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ==================== SERVICE WORKER ==================== */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/medconvert-sw.js').catch(() => {});
    }
}

/* ==================== KEYBOARD SHORTCUTS ==================== */
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabs = document.querySelectorAll('.tab-btn');
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) tabs[idx].click();
    }
});

console.log('MedConvert — Ghibli Edition loaded. Built with care.');

/* ==========================================
   HCI ENHANCEMENT LAYER
   All 8 principles applied intentionally
   ==========================================
   1. Consistency      — unified ARIA roles, focus patterns
   2. Visibility       — live regions, status indicators, form states
   3. Feedback         — ripple effects, confirm toasts, button states
   4. Affordance       — button loading states, visual cues
   5. Accessibility    — keyboard trap for modals, ARIA attributes
   6. Cognitive Load   — progressive disclosure, contextual help
   7. Fitts's Law      — keyboard shortcut panel, quick access
   8. User Control     — undo, escape key, cancel patterns
   =========================================== */

/* ── HCI Init: Append all enhancements after DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
    hci_initSkipLink();
    hci_initARIALiveRegion();
    hci_initFormValidation();
    hci_initButtonFeedback();
    hci_initKeyboardNavigation();
    hci_initFocusTrap();
    hci_initTabARIA();
    hci_initBackToTopARIA();
    hci_initScrollThreshold();
    hci_initDrugCount();
    hci_initInputHints();
    hci_patchShowResult();
    hci_patchShowToast();
    hci_initEscapeClose();
});

/* ── HCI #5: Accessibility — Skip to main content link ── */
function hci_initSkipLink() {
    // Inject skip link if not already in DOM
    if (document.querySelector('.skip-link')) return;
    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to main content';
    document.body.insertBefore(skip, document.body.firstChild);

    // Ensure main content has proper id
    const main = document.querySelector('main, .container');
    if (main && !main.id) main.id = 'main-content';
}

/* ── HCI #2 + #3: Visibility — ARIA live region for dynamic announcements ── */
function hci_initARIALiveRegion() {
    if (document.getElementById('hci-live-region')) return;
    const live = document.createElement('div');
    live.id = 'hci-live-region';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
    document.body.appendChild(live);
}

function hci_announce(msg) {
    const r = document.getElementById('hci-live-region');
    if (!r) return;
    r.textContent = '';
    requestAnimationFrame(() => { r.textContent = msg; });
}

/* ── HCI #2 + #3: Form Validation — inline real-time feedback ── */
function hci_initFormValidation() {
    // Add visual validation feedback to all number/text inputs
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
        // Hover: show focus ring preview
        input.addEventListener('mouseenter', () => {
            input.style.cursor = 'text';
        });

        // Validation on blur — check if required and empty
        input.addEventListener('blur', () => {
            hci_validateInput(input);
        });

        // Clear error on typing — give immediate positive feedback
        input.addEventListener('input', () => {
            if (input.value.trim()) {
                input.classList.remove('input-error');
                input.classList.add('input-success');
                const errEl = input.nextElementSibling;
                if (errEl && errEl.classList.contains('field-error')) {
                    errEl.classList.remove('visible');
                }
            } else {
                input.classList.remove('input-success');
            }
        });
    });
}

function hci_validateInput(input) {
    const isEmpty = !input.value.trim();
    const isNumber = input.type === 'number';
    const isNegative = isNumber && parseFloat(input.value) < 0;
    const isZero = isNumber && parseFloat(input.value) === 0;

    if (isEmpty && input.required) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        hci_showFieldError(input, 'This field is required');
    } else if (isNegative) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        hci_showFieldError(input, 'Please enter a positive value');
    } else if (!isEmpty) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        hci_hideFieldError(input);
    }
}

function hci_showFieldError(input, message) {
    let errEl = input.parentElement.querySelector('.field-error');
    if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'field-error';
        errEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span></span>`;
        input.insertAdjacentElement('afterend', errEl);
    }
    errEl.querySelector('span').textContent = message;
    errEl.classList.add('visible');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errEl.id || (errEl.id = `err-${Math.random().toString(36).slice(2)}`));
}

function hci_hideFieldError(input) {
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.classList.remove('visible');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
}

/* ── HCI #3 + #4: Button Feedback — loading state + micro-interaction ── */
function hci_initButtonFeedback() {
    // All primary buttons get ripple effect and active feedback
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Ripple effect at click point
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `
                position:absolute;
                width:${size}px;height:${size}px;
                top:${e.clientY - rect.top - size/2}px;
                left:${e.clientX - rect.left - size/2}px;
                background:rgba(255,255,255,0.22);
                border-radius:50%;
                transform:scale(0);
                animation:ripple 0.45s ease-out;
                pointer-events:none;
            `;
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 450);
        });
    });

    // Inject ripple keyframes once
    if (!document.getElementById('hci-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'hci-ripple-style';
        style.textContent = `@keyframes ripple { to { transform: scale(2.5); opacity: 0; } }`;
        document.head.appendChild(style);
    }
}

/* ── HCI #5 + #8: Keyboard Navigation — arrow keys within tab nav ── */
function hci_initKeyboardNavigation() {
    const tabNav = document.querySelector('.tab-nav');
    if (!tabNav) return;

    tabNav.addEventListener('keydown', (e) => {
        const tabs = [...tabNav.querySelectorAll('.tab-btn')];
        const current = document.activeElement;
        const idx = tabs.indexOf(current);
        if (idx === -1) return;

        let next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            next = (idx + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            next = (idx - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
            e.preventDefault(); next = 0;
        } else if (e.key === 'End') {
            e.preventDefault(); next = tabs.length - 1;
        }

        if (next !== -1) {
            tabs[next].focus();
            tabs[next].click();
        }
    });

    // Sub-tab keyboard navigation — same pattern (Consistency)
    document.querySelectorAll('.sub-tabs').forEach(subTabGroup => {
        subTabGroup.addEventListener('keydown', (e) => {
            const tabs = [...subTabGroup.querySelectorAll('.sub-tab')];
            const current = document.activeElement;
            const idx = tabs.indexOf(current);
            if (idx === -1) return;

            let next = -1;
            if (e.key === 'ArrowRight') { e.preventDefault(); next = (idx + 1) % tabs.length; }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); next = (idx - 1 + tabs.length) % tabs.length; }

            if (next !== -1) { tabs[next].focus(); tabs[next].click(); }
        });
    });
}

/* ── HCI #5: Accessibility — Focus trap for modal overlays ── */
function hci_initFocusTrap() {
    // Patches the global open functions to trap focus inside the modal
    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function trapFocus(overlay) {
        if (!overlay) return;
        const focusable = [...overlay.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];

        // Return focus to triggering element when closed
        const trigger = document.activeElement;

        // Set initial focus inside the modal
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { first.focus(); });
        });

        const handler = (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        overlay.addEventListener('keydown', handler);
        overlay._focusTrapHandler = handler;
        overlay._focusTrigger = trigger;
    }

    function releaseFocus(overlay) {
        if (!overlay) return;
        if (overlay._focusTrapHandler) overlay.removeEventListener('keydown', overlay._focusTrapHandler);
        if (overlay._focusTrigger) overlay._focusTrigger.focus();
    }

    // Monkey-patch showOnboarding / openSettings / openPinManager to apply traps
    const _origShowOnboarding = window.showOnboarding;
    const _origOpenSettings   = window.openSettings;
    const _origOpenPinManager = window.openPinManager;
    const _origSubmitOnboard  = window.submitOnboarding;
    const _origClosePinMgr    = window.closePinManager;

    function attachTrap(id) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const overlay = document.getElementById(id);
                    if (overlay) trapFocus(overlay);
                });
            });
        });
    }

    function detachTrap(id) {
        const overlay = document.getElementById(id);
        if (overlay) releaseFocus(overlay);
    }

    if (_origOpenSettings) {
        window.openSettings = function() {
            _origOpenSettings.apply(this, arguments);
            attachTrap('onboarding-overlay');
        };
    }

    if (_origOpenPinManager) {
        window.openPinManager = function() {
            _origOpenPinManager.apply(this, arguments);
            attachTrap('pin-overlay');
        };
    }

    if (_origSubmitOnboard) {
        window.submitOnboarding = function() {
            detachTrap('onboarding-overlay');
            _origSubmitOnboard.apply(this, arguments);
        };
    }

    if (_origClosePinMgr) {
        window.closePinManager = function() {
            detachTrap('pin-overlay');
            _origClosePinMgr.apply(this, arguments);
        };
    }
}

/* ── HCI #1 + #5: Tab ARIA — proper role/aria attributes ── */
function hci_initTabARIA() {
    const tabNav = document.querySelector('.tab-nav');
    if (tabNav) {
        tabNav.setAttribute('role', 'tablist');
        tabNav.setAttribute('aria-label', 'Calculator sections');

        document.querySelectorAll('.tab-btn').forEach((btn, i) => {
            btn.setAttribute('role', 'tab');
            const tabId = btn.getAttribute('data-tab');
            if (tabId) {
                btn.setAttribute('aria-controls', `panel-${tabId}`);
                btn.id = btn.id || `tab-${tabId}`;
                const panel = document.getElementById(`panel-${tabId}`);
                if (panel) {
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-labelledby', btn.id);
                    panel.setAttribute('tabindex', '0');
                }
            }
            // Make non-active tabs not in tab order (managed tabindex pattern)
            if (!btn.classList.contains('active')) {
                btn.setAttribute('tabindex', '-1');
            }
        });

        // Patch switchToTab to update tabindex properly
        const _origSwitch = window.switchToTab;
        if (_origSwitch) {
            window.switchToTab = function(tabId) {
                _origSwitch(tabId);
                // Update managed tabindex
                document.querySelectorAll('.tab-btn').forEach(b => {
                    const isActive = b.getAttribute('data-tab') === tabId;
                    b.setAttribute('tabindex', isActive ? '0' : '-1');
                });
                // Announce to screen readers
                const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                if (activeBtn) {
                    hci_announce(`${activeBtn.textContent.trim()} section selected`);
                }
            };
        }
    }
}

/* ── HCI #8: User Control — Escape key closes overlays ── */
function hci_initEscapeClose() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;

        const pinOverlay = document.getElementById('pin-overlay');
        if (pinOverlay && pinOverlay.classList.contains('visible')) {
            if (window.closePinManager) window.closePinManager();
            return;
        }

        const onboardOverlay = document.getElementById('onboarding-overlay');
        if (onboardOverlay && onboardOverlay.classList.contains('visible')) {
            const isFirstTime = !window.getProfile || !window.getProfile();
            if (!isFirstTime) {
                // Only allow escape on settings edit, not initial onboarding
                onboardOverlay.classList.remove('visible');
                onboardOverlay.classList.add('hiding');
                setTimeout(() => onboardOverlay.remove(), 400);
            }
        }
    });
}

/* ── HCI #2: Visibility — ARIA on back-to-top button ── */
function hci_initBackToTopARIA() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('role', 'button');
    // Keyboard: Enter and Space activate
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            hci_announce('Scrolled to top of page');
        }
    });
}

/* ── HCI #2: Visibility — back-to-top button pulse on crossing threshold ── */
function hci_initScrollThreshold() {
    let wasVisible = false;
    window.addEventListener('scroll', () => {
        const isVisible = window.scrollY > 400;
        if (isVisible && !wasVisible) {
            // Button is newly appearing — brief pulse to draw attention
            const btn = document.getElementById('back-to-top');
            if (btn) {
                btn.style.animation = 'none';
                requestAnimationFrame(() => {
                    btn.style.animation = '';
                });
            }
        }
        wasVisible = isVisible;
    }, { passive: true });
}

/* ── HCI #2: Visibility — drug count updates as user searches ── */
function hci_initDrugCount() {
    const countEl = document.getElementById('drug-count');
    if (!countEl) return;

    // Patch searchDrugs to also announce count via live region
    const _origSearch = window.searchDrugs;
    if (_origSearch) {
        window.searchDrugs = function() {
            _origSearch.apply(this, arguments);
            // Update aria count after render
            requestAnimationFrame(() => {
                const cards = document.querySelectorAll('.drug-card');
                const count = cards.length;
                if (count > 0) {
                    hci_announce(`${count} drug${count !== 1 ? 's' : ''} found`);
                }
            });
        };
    }
}

/* ── HCI #6: Cognitive Load — contextual input hints on focus ── */
function hci_initInputHints() {
    // Map of input IDs to their hint text
    const hints = {
        'dose-desired':      'The dose prescribed by the physician',
        'dose-stock':        'The dose available in your current supply',
        'dose-volume':       'Volume the stock dose is dissolved in (usually mL)',
        'weight-dose-kg':    'Patient weight in kilograms',
        'weight-dose-per-kg':'Dose in mg per kg of body weight',
        'bp-sys':            'Upper (systolic) blood pressure value',
        'bp-dia':            'Lower (diastolic) blood pressure value',
        'iv-volume':         'Total volume of fluid to be infused (mL)',
        'iv-time':           'Time for infusion in minutes',
        'bsa-height':        'Patient height in centimetres',
        'bsa-weight':        'Patient weight in kilograms',
        'si-hr':             'Current heart rate in beats per minute',
        'si-sbp':            'Systolic blood pressure (top number)',
    };

    Object.entries(hints).forEach(([id, hint]) => {
        const input = document.getElementById(id);
        if (!input) return;

        // Add a ARIA describedby hint (screen reader friendly)
        const hintId = `hint-${id}`;
        if (!document.getElementById(hintId)) {
            const hintEl = document.createElement('div');
            hintEl.id = hintId;
            hintEl.style.cssText = 'font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;display:none;font-family:var(--font-body);line-height:1.4;';
            hintEl.textContent = hint;
            input.insertAdjacentElement('afterend', hintEl);
            input.setAttribute('aria-describedby', hintId);

            input.addEventListener('focus', () => { hintEl.style.display = 'block'; });
            input.addEventListener('blur',  () => { hintEl.style.display = 'none'; });
        }
    });
}

/* ── HCI #3: Feedback — patch showResult to announce result to screen readers ── */
function hci_patchShowResult() {
    const _orig = window.showResult || function(){};
    window.showResult = function(resultElId, valueElId, displayValue, status, note, noteElId, interpElId, interpHtml) {
        _orig.apply(this, arguments);
        // Announce result to screen reader
        const statusWords = { normal: 'Normal', warning: 'Caution', danger: 'Alert', neutral: 'Result' };
        const prefix = statusWords[status] || 'Result';
        const noteText = (noteElId && note) ? `. ${note}` : '';
        hci_announce(`${prefix}: ${displayValue}${noteText}`);
    };
}

/* ── HCI #3: Feedback — patch showToast to also announce via live region ── */
function hci_patchShowToast() {
    const _orig = window.showToast || function(){};
    window.showToast = function(msg, type) {
        _orig.apply(this, arguments);
        hci_announce(msg);
    };
    // Also make showToast global from medconvert.js accessible after overwrite
}

/* ── HCI #5: Accessibility — ensure all icon buttons have aria-labels ── */
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn && !themeBtn.getAttribute('aria-label')) {
        themeBtn.setAttribute('aria-label', 'Toggle colour theme');
    }

    // Settings button
    const settingsBtn = document.querySelector('.icon-btn[onclick*="Settings"]');
    if (settingsBtn && !settingsBtn.getAttribute('aria-label')) {
        settingsBtn.setAttribute('aria-label', 'Open settings');
    }

    // All icon buttons without aria-label
    document.querySelectorAll('.icon-btn').forEach(btn => {
        if (!btn.getAttribute('aria-label') && !btn.getAttribute('aria-labelledby')) {
            const title = btn.title || btn.getAttribute('data-tooltip') || 'Action button';
            btn.setAttribute('aria-label', title);
        }
    });

    // All buttons in general — ensure they have accessible names
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
        if (!btn.textContent.trim() && !btn.querySelector('text')) {
            btn.setAttribute('aria-label', 'Button');
        }
    });

    // Drug count: initial state
    const countEl = document.getElementById('drug-count');
    if (countEl) countEl.setAttribute('aria-live', 'polite');
});

/* ── HCI #2: Visibility — highlight active section in tab nav when scrolling ── */
(function hci_tabScrollIntoView() {
    // Patch switchToTab to scroll active tab button into view
    const _orig = window.switchToTab;
    if (_orig) {
        window.switchToTab = function(tabId) {
            _orig.apply(this, arguments);
            requestAnimationFrame(() => {
                const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                if (activeBtn) {
                    activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        };
    }
})();

/* ── HCI #6: Cognitive Load — auto-clear success states after 3s ── */
document.addEventListener('DOMContentLoaded', () => {
    // Observe input success states and auto-clear after timeout
    const successTimeout = new Map();
    document.addEventListener('input', (e) => {
        const input = e.target;
        if (!input.classList || !input.classList.contains('input-success')) return;
        if (successTimeout.has(input)) clearTimeout(successTimeout.get(input));
        successTimeout.set(input, setTimeout(() => {
            input.classList.remove('input-success');
            successTimeout.delete(input);
        }, 3000));
    });
});

/* ── HCI #1: Consistency — ensure all calculate buttons use consistent loading pattern ── */
(function hci_calcButtonStates() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-primary');
        if (!btn) return;
        // Don't apply to nav/settings buttons
        if (btn.closest('.header-controls') || btn.closest('#onboarding-overlay') || btn.closest('#pin-overlay')) return;

        // Brief visual press state
        btn.style.transform = 'scale(0.975)';
        setTimeout(() => { btn.style.transform = ''; }, 120);
    });
})();

console.log('MedConvert HCI layer loaded — 8 principles applied.');
/* ==========================================
   IMPROVEMENT PATCH — All Key Fixes Applied
   ========================================== */

/* ── 1. ONLINE/OFFLINE INDICATOR ── */
function initOfflineIndicator() {
    const badge = document.getElementById('offline-badge');
    if (!badge) return;
    const dot = badge.querySelector('.offline-dot');
    const label = badge.querySelector('.offline-label');

    function update() {
        const online = navigator.onLine;
        badge.classList.toggle('is-offline', !online);
        label.textContent = online ? 'Online' : 'Offline';
        badge.title = online ? 'Connected' : 'No internet — using cached data';
    }

    update();
    window.addEventListener('online', () => { update(); showToast('Back online', 'success'); });
    window.addEventListener('offline', () => { update(); showToast('Working offline — all features still available', 'info'); });
}

/* ── 2. ENTER-TO-CALCULATE keyboard shortcut ── */
function initEnterToCalculate() {
    // Map: panel ID → calculate function name
    const panelCalcMap = {
        'panel-dosage': { 'sub-dosage-standard': 'calculateDosage', 'sub-dosage-weight': 'calculateWeightDose', 'sub-dosage-bsa': 'calculateBSA' },
        'panel-iv':     { 'sub-drip-rate': 'calculateIV', 'sub-infusion-time': 'calculateInfusionTime', 'sub-concentration': 'calculateConcentration' },
        'panel-vitals': { 'sub-map': 'calculateMAP', 'sub-pp': 'calculatePP', 'sub-shock-index': 'calculateShockIndex', 'sub-a-a-gradient': 'calculateAAGradient' },
        'panel-assessment': { 'sub-gcs': 'calculateGCS', 'sub-bmi': 'calculateBMI', 'sub-egfr': 'calculateEGFR', 'sub-wells': 'calculateWells' },
        'panel-pediatric': { 'sub-peds-weight': 'calculatePedsWeight', 'sub-peds-dose': 'calculatePedsDose', 'sub-apgar': 'calculateAPGAR' },
        'panel-lab':     { '_default': 'convertLab' },
    };

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        // Only if focused inside an input (not a button or textarea)
        const active = document.activeElement;
        if (!active || !['INPUT', 'SELECT'].includes(active.tagName)) return;
        // Don't trigger if inside onboarding or modals
        if (active.closest('#onboarding-overlay, #pin-overlay, #confirm-modal')) return;

        // Find which panel is active
        const activePanel = document.querySelector('.calc-card.active');
        if (!activePanel) return;
        const panelId = activePanel.id;
        const panelMap = panelCalcMap[panelId];
        if (!panelMap) return;

        // Find active sub-panel
        const activeSubPanel = activePanel.querySelector('.sub-panel.active');
        const subId = activeSubPanel ? activeSubPanel.id : '_default';

        let fn = panelMap[subId] || panelMap['_default'];
        if (!fn) {
            // If only one entry in map, use that
            const entries = Object.values(panelMap);
            if (entries.length === 1) fn = entries[0];
        }

        if (fn && window[fn]) {
            e.preventDefault();
            window[fn]();
        }
    });
}

/* ── 3. COPY RESULT BUTTON ── */
function initCopyResultButtons() {
    // Add copy button to each result-display
    document.querySelectorAll('.result-display').forEach(resultEl => {
        if (resultEl.querySelector('.result-copy-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'result-copy-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Copy result to clipboard');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy`;
        btn.addEventListener('click', () => {
            const valueEl = resultEl.querySelector('.result-value');
            const noteEl = resultEl.querySelector('.result-note');
            if (!valueEl) return;
            const text = valueEl.textContent.trim() + (noteEl ? '\n' + noteEl.textContent.trim() : '');
            navigator.clipboard.writeText(text).then(() => {
                btn.textContent = '✓ Copied!';
                btn.innerHTML = '✓ Copied!';
                setTimeout(() => {
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy`;
                }, 1800);
                showToast('Result copied to clipboard', 'success');
            }).catch(() => showToast('Copy not supported in this browser', 'warning'));
        });
        resultEl.appendChild(btn);
    });
}

/* ── 4. CLEAR INPUTS BUTTON after results ── */
function addClearInputButtons() {
    // Add "New Calculation" clear button to each result-display
    document.querySelectorAll('.result-display').forEach(resultEl => {
        if (resultEl.querySelector('.calc-clear-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'calc-clear-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Clear inputs for new calculation');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 .49-3.5"></path></svg>New Calc`;
        btn.addEventListener('click', () => {
            // Clear all inputs in the parent sub-panel or calc-card
            const parent = resultEl.closest('.sub-panel') || resultEl.closest('.calc-card');
            if (!parent) return;
            parent.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
                input.value = '';
                input.classList.remove('input-error', 'input-success');
            });
            parent.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
            // Hide result
            resultEl.classList.remove('show', 'result-normal', 'result-warning', 'result-danger', 'result-neutral');
            // Focus first input
            const first = parent.querySelector('input[type="number"], input[type="text"], select');
            if (first) first.focus();
            showToast('Inputs cleared', 'info');
        });
        resultEl.appendChild(btn);
    });
}

/* ── 5. TIMER PROGRESS RING ── */
let timerTotal = 0;
const RING_CIRCUMFERENCE = 326.7; // 2 * π * 52

function updateTimerRing(secondsLeft) {
    const ring = document.getElementById('timer-ring-fill');
    if (!ring) return;
    const pct = timerTotal > 0 ? secondsLeft / timerTotal : 0;
    const offset = RING_CIRCUMFERENCE * (1 - pct);
    ring.style.strokeDashoffset = offset;
    ring.classList.toggle('ring-urgent', secondsLeft <= 5 && secondsLeft > 0);
}

// Patch startTimer to update ring
const _origStartTimer = window.startTimer;
window.startTimer = function(seconds) {
    timerTotal = seconds;
    updateTimerRing(seconds);
    _origStartTimer.call(this, seconds);
};

const _origUpdateTimerDisplay = window.updateTimerDisplay;
// We need to hook into the interval - patch via overriding the whole timer
let _timerPatchInterval = null;
const _origStartTimer2 = window.startTimer;
window.startTimer = function(seconds) {
    timerTotal = seconds;
    updateTimerRing(seconds);
    // Clear existing
    if (_timerPatchInterval) clearInterval(_timerPatchInterval);
    const display = document.getElementById('timer-countdown');
    let left = seconds;
    _updateTimerDisplayLocal(left);
    _timerPatchInterval = setInterval(() => {
        left--;
        _updateTimerDisplayLocal(left);
        updateTimerRing(left);
        if (left <= 0) {
            clearInterval(_timerPatchInterval);
            if (display) { display.textContent = 'Done'; display.style.color = 'var(--dusty-rose)'; }
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
            showToast('Timer complete', 'success');
        }
    }, 1000);
    if (navigator.vibrate) navigator.vibrate(12);
};

function _updateTimerDisplayLocal(s) {
    const d = document.getElementById('timer-countdown');
    if (!d) return;
    d.textContent = s >= 60 ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` : s.toString().padStart(2, '0');
    d.style.color = s <= 5 && s > 0 ? 'var(--danger)' : 'var(--forest)';
}

const _origResetTimer = window.resetTimer;
window.resetTimer = function() {
    if (_timerPatchInterval) clearInterval(_timerPatchInterval);
    const d = document.getElementById('timer-countdown');
    if (d) { d.textContent = '00'; d.style.color = 'var(--forest)'; }
    timerTotal = 0;
    updateTimerRing(0);
    if (navigator.vibrate) navigator.vibrate(5);
};

/* ── 6. SUB-TAB STATE MEMORY ── */
const subTabMemory = {};

const _origShowSubPanel = window.showSubPanel;
window.showSubPanel = function(subId) {
    // Remember which sub-panel was selected per parent panel
    const clickedBtn = event ? (event.currentTarget || event.target) : null;
    if (clickedBtn) {
        const parentCard = clickedBtn.closest('.calc-card');
        if (parentCard) subTabMemory[parentCard.id] = subId;
    }
    _origShowSubPanel.apply(this, arguments);
};

const _origSwitchToTab2 = window.switchToTab;
window.switchToTab = function(tabId) {
    _origSwitchToTab2.apply(this, arguments);
    // Restore remembered sub-tab
    const panelId = `panel-${tabId}`;
    const remembered = subTabMemory[panelId];
    if (remembered) {
        const panel = document.getElementById(panelId);
        if (panel) {
            const targetSub = document.getElementById(`sub-${remembered}`);
            if (targetSub) {
                panel.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
                panel.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
                targetSub.classList.add('active');
                // Find and activate corresponding sub-tab button
                panel.querySelectorAll('.sub-tab').forEach(b => {
                    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${remembered}'`)) {
                        b.classList.add('active');
                    }
                });
            }
        }
    }
};

/* ── 7. DRUG PANEL - SHOW ALL ON LOAD ── */
const _origInitDrugPanel = window.initDrugPanel;
window.initDrugPanel = function() {
    _origInitDrugPanel.apply(this, arguments);
    // Auto-show all drugs on panel open
    const el = document.getElementById('drug-results');
    if (el) renderAllDrugs();
};

function renderAllDrugs() {
    const el = document.getElementById('drug-results');
    if (!el || !window.DRUG_DB) return;
    const count = document.getElementById('drug-count');
    if (count) count.textContent = `${DRUG_DB.length} drugs`;
    el.innerHTML = DRUG_DB.map(d => buildDrugCard(d)).join('');
}

function buildDrugCard(d) {
    return `<div class="drug-card">
        <div class="drug-header">
            <span class="drug-name">${d.name}</span>
            <span class="drug-badge">${d.category}</span>
        </div>
        <div class="drug-meta">
            <span class="drug-tag">${d.route}</span>
            <span class="drug-tag">Onset: ${d.onset}</span>
            <span class="drug-tag">Peak: ${d.peak}</span>
        </div>
        <div class="drug-dose"><strong>Dose:</strong> ${d.dose}</div>
        <div class="drug-notes">${d.notes}</div>
    </div>`;
}

// Also patch searchDrugs to reset to all when cleared
const _origSearchDrugs = window.searchDrugs;
window.searchDrugs = function() {
    const q = document.getElementById('drug-search') ? document.getElementById('drug-search').value.toLowerCase().trim() : '';
    const cat = document.getElementById('drug-category-filter') ? document.getElementById('drug-category-filter').value : '';
    if (!q && !cat) {
        renderAllDrugs();
        return;
    }
    _origSearchDrugs.apply(this, arguments);
};

const _origClearDrugSearch = window.clearDrugSearch;
window.clearDrugSearch = function() {
    if (document.getElementById('drug-search')) document.getElementById('drug-search').value = '';
    if (document.getElementById('drug-category-filter')) document.getElementById('drug-category-filter').value = '';
    renderAllDrugs();
};

/* ── 8. STYLED CONFIRM MODAL for Clear Notes ── */
function initConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');
    if (!modal || !cancelBtn || !okBtn) return;

    cancelBtn.addEventListener('click', () => closeConfirmModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) closeConfirmModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) closeConfirmModal();
    });

    // Override clearNotes
    window.clearNotes = function() {
        showConfirmModal(() => {
            document.getElementById('shift-notes').value = '';
            try { localStorage.removeItem('medconvert_notes'); } catch {}
            showToast('Notes cleared', 'info');
        });
    };
}

function showConfirmModal(onConfirm) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    modal.classList.add('visible');
    const okBtn = document.getElementById('confirm-ok');
    // Remove old listener
    const newOk = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    newOk.addEventListener('click', () => {
        closeConfirmModal();
        if (onConfirm) onConfirm();
    });
    // Focus cancel (safer default)
    setTimeout(() => document.getElementById('confirm-cancel') && document.getElementById('confirm-cancel').focus(), 50);
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('visible');
}

/* ── 9. WEIGHT UNIT TOGGLE ── */
window.setWeightUnit = function(btn, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const group = btn.closest('.unit-toggle-group');
    group.querySelectorAll('.unit-toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const fromUnit = input.dataset.unit || 'kg';
    const toUnit = btn.dataset.unit;
    if (fromUnit === toUnit) return;
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
        if (toUnit === 'lbs' && fromUnit === 'kg') input.value = (val * 2.20462).toFixed(1);
        else if (toUnit === 'kg' && fromUnit === 'lbs') input.value = (val / 2.20462).toFixed(1);
    }
    input.dataset.unit = toUnit;
    input.placeholder = toUnit === 'lbs' ? 'e.g., 154' : 'e.g., 70';
};

// Patch calculate functions to convert lbs→kg before calculating
function getWeightInKg(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return null;
    const val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) return null;
    return input.dataset.unit === 'lbs' ? val / 2.20462 : val;
}

// Patch weight-based calculations to use getWeightInKg
const _origCalcWeightDose = window.calculateWeightDose;
window.calculateWeightDose = function() {
    const w = getWeightInKg('weight-dose-kg');
    const d = parseFloat(document.getElementById('weight-dose-per-kg').value);
    const f = parseInt(document.getElementById('weight-dose-freq').value) || 1;
    if (!w || !d) { showToast('Please enter weight and dose per kg', 'warning'); return; }
    const single = w * d, daily = single * f;
    const display = `${single.toFixed(1)} mg / dose`;
    showResult('weight-dose-result', 'weight-dose-value', display, 'neutral', `Total daily: ${daily.toFixed(1)} mg (${f}× per day)`, 'weight-dose-note');
    addToHistory('Dosage', 'Weight-based', display);
};

const _origCalcBSA = window.calculateBSA;
window.calculateBSA = function() {
    const h = parseFloat(document.getElementById('bsa-height').value);
    const w = getWeightInKg('bsa-weight');
    if (!h || !w) { showToast('Please enter height and weight', 'warning'); return; }
    const bsa = Math.sqrt((h * w) / 3600);
    const display = `${bsa.toFixed(2)} m²`;
    showResult('bsa-result', 'bsa-value', display, 'neutral');
    window.currentBSA = bsa;
    addToHistory('Dosage', 'BSA', display);
};

const _origCalcBMI = window.calculateBMI;
window.calculateBMI = function() {
    const h = parseFloat(document.getElementById('bmi-height').value);
    const w = getWeightInKg('bmi-weight');
    if (!h || !w || h <= 0 || w <= 0) { showToast('Please enter valid height and weight', 'warning'); return; }
    const bmi = w / Math.pow(h / 100, 2);
    const display = bmi.toFixed(1);
    let status = 'normal', cat = 'Normal weight';
    if (bmi < 18.5) { status = 'warning'; cat = 'Underweight'; }
    else if (bmi >= 30) { status = 'danger'; cat = 'Obese'; }
    else if (bmi >= 25) { status = 'warning'; cat = 'Overweight'; }
    showResult('bmi-result', 'bmi-result-value', display, status, cat, 'bmi-category');
    addToHistory('Assessment', 'BMI', display);
};

/* ── 10. eGFR — 2021 CKD-EPI (Race-Neutral) ── */
window.calculateEGFR = function() {
    const age = parseInt(document.getElementById('egfr-age').value);
    const sex = document.getElementById('egfr-sex').value;
    const cr = parseFloat(document.getElementById('egfr-cr').value);
    if (!age || !cr) { showToast('Please enter age and creatinine', 'warning'); return; }
    // 2021 CKD-EPI (race-neutral)
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const sf = sex === 'female' ? 1.012 : 1.0;
    const egfr = Math.round(142 * Math.pow(Math.min(cr / kappa, 1), alpha) * Math.pow(Math.max(cr / kappa, 1), -1.200) * Math.pow(0.9938, age) * sf);
    const display = `${egfr} mL/min/1.73m²`;
    let status = egfr >= 60 ? 'normal' : egfr >= 30 ? 'warning' : 'danger';
    let stage = egfr >= 90 ? '<strong>Stage 1:</strong> Normal or high' : egfr >= 60 ? '<strong>Stage 2:</strong> Mildly decreased' : egfr >= 45 ? '<strong>Stage 3a:</strong> Mild-to-moderate decrease' : egfr >= 30 ? '<strong>Stage 3b:</strong> Moderate-to-severe decrease' : egfr >= 15 ? '<strong>Stage 4:</strong> Severely decreased' : '<strong>Stage 5:</strong> Kidney failure';
    stage += '<br><small style="opacity:0.7;font-weight:400;">Calculated using 2021 CKD-EPI race-neutral equation</small>';
    showResult('egfr-result', 'egfr-value', display, status, null, null, 'egfr-stage', stage);
    addToHistory('Assessment', 'eGFR', display);
};

/* ── 11. TAB SCROLL FADE HINT ── */
function initTabScrollHint() {
    const wrapper = document.querySelector('.tab-nav-wrapper');
    const nav = wrapper ? wrapper.querySelector('.tab-nav') : null;
    if (!nav || !wrapper) return;

    function updateFade() {
        const atEnd = nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 4;
        wrapper.classList.toggle('at-end', atEnd);
    }

    nav.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    updateFade();
}

/* ── LAB NORMAL RANGE HIGHLIGHT ── */
const _origConvertLab = window.convertLab;
window.convertLab = function() {
    _origConvertLab.apply(this, arguments);
    // Enhance the result to highlight normal range
    const noteEl = document.getElementById('lab-normal-range');
    if (noteEl && noteEl.textContent) {
        noteEl.innerHTML = `<span class="normal-range-highlight">${noteEl.textContent}</span>`;
    }
};

/* ── INIT ALL IMPROVEMENTS ── */
document.addEventListener('DOMContentLoaded', () => {
    initOfflineIndicator();
    initEnterToCalculate();
    initTabScrollHint();
    initConfirmModal();
    // Copy and clear buttons added after a small delay to let DOM settle
    requestAnimationFrame(() => {
        initCopyResultButtons();
        addClearInputButtons();
    });
});

console.log('MedConvert Improvements Patch loaded.');