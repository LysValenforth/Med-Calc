/* MedConvert — main script */

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
    // Dismiss splash after app is ready
    dismissSplash();
}

function dismissSplash() {
    const splash = document.getElementById('app-splash');
    if (!splash) return;

    // Don't show on wide desktop monitors
    if (window.innerWidth >= 1024 && !window.matchMedia('(display-mode: standalone)').matches) {
        splash.style.display = 'none';
        return;
    }

    // Minimum display time = 1.6s so the bar + logo animations complete fully.
    // performance.now() tells us how long since page load — if JS was slow,
    // we reduce the wait so the splash doesn't hang forever.
    const MIN_MS = 1600;
    const elapsed = performance.now();
    const delay = Math.max(0, MIN_MS - elapsed);

    setTimeout(() => {
        splash.classList.add('splash-out');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 600); // match the CSS transition duration
    }, delay);
}

/* profile store */
function getProfile() {
    try { const r = localStorage.getItem('medconvert_profile'); return r ? JSON.parse(r) : null; }
    catch { return null; }
}

function saveProfile(p) {
    try { localStorage.setItem('medconvert_profile', JSON.stringify(p)); } catch {}
}

function getName() {
    return 'Abigail';
}

/* theme */
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
    if (btn) {
        btn.innerHTML = theme === 'dark'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    // Specialty pill: dark mode → Night Shift (moon), light mode → Day Shift (sun)
    const pill = document.getElementById('specialty-pill');
    if (pill) {
        const p = typeof getProfile === 'function' ? getProfile() : null;
        const savedShift = p?.shift;
        // If user has a saved shift preference use it, otherwise infer from theme
        if (savedShift && savedShift !== 'Rotating') {
            pill.textContent = savedShift + ' Shift';
        } else {
            pill.innerHTML = theme === 'dark'
                ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Night Shift'
                : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:3px;"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>Day Shift';
        }
    }
}

/* onboarding */
function checkOnboarding() {
    if (!getProfile()) {
        saveProfile({ name: 'Abigail', specialty: 'General', shift: 'Night', shiftStart: '21:00', shiftEnd: '06:00' });
    }
    applyProfileData();
}

function buildOnboardingHTML(profile) {
    const p = profile || {};
    const isEdit = !!profile;
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isOnline = navigator.onLine;
    const iconSVG = isEdit
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M9 22V12h6v10"/><path d="M12 8v4M10 10h4"/></svg>';
    return `
        <div class="onboarding-card">
            <div class="onboarding-logo">${iconSVG}</div>
            <h2 class="onboarding-title">${isEdit ? 'Your Settings' : 'Welcome to MedConvert'}</h2>
            <p class="onboarding-subtitle">${isEdit ? 'Update your profile anytime.' : "Let's personalise your experience — it only takes a moment."}</p>

            ${isEdit ? `
            <div class="onboarding-field settings-mobile-row">
                <label>Appearance</label>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);">
                    <button type="button" id="settings-theme-btn" onclick="settingsToggleTheme(this)"
                        style="flex:1;min-height:2.75rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;
                               background:var(--bg-input);border:2px solid var(--border);border-radius:var(--radius-lg);
                               font-family:var(--font-body);font-size:var(--text-sm);font-weight:700;color:var(--text-primary);cursor:pointer;">
                        ${currentTheme === 'dark'
                            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Light Mode'
                            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark Mode'
                        }
                    </button>
                    <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.85rem;
                                background:var(--bg-input);border:2px solid var(--border);border-radius:var(--radius-lg);
                                font-family:var(--font-body);font-size:var(--text-sm);font-weight:700;color:var(--text-primary);
                                flex-shrink:0;">
                        <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:${isOnline ? '#6ee48a' : 'var(--dusty-rose)'};
                                     box-shadow:0 0 5px ${isOnline ? '#6ee48a' : 'var(--dusty-rose)'};flex-shrink:0;"></span>
                        ${isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>
            </div>
            <div class="onboarding-field">
                <label>Haptic Feedback</label>
                <button type="button" id="settings-vibrate-btn" onclick="settingsToggleVibration(this)"
                    style="width:100%;min-height:2.75rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;
                           background:var(--bg-input);border:2px solid var(--border);border-radius:var(--radius-lg);
                           font-family:var(--font-body);font-size:var(--text-sm);font-weight:700;color:var(--text-primary);cursor:pointer;">
                    ${(localStorage.getItem('mc_vibrate') !== '0')
                        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14.5a8 8 0 0 1 0-5M3 16.5a11 11 0 0 1 0-9M19 14.5a8 8 0 0 0 0-5M21 16.5a11 11 0 0 0 0-9"/><rect x="9" y="7" width="6" height="10" rx="2"/></svg> Vibration On'
                        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M5 14.5a8 8 0 0 1-.34-5M3 16.5A11 11 0 0 1 3 7.5M19 14.5a8 8 0 0 0 .34-5M21 16.5a11 11 0 0 0 0-9"/><rect x="9" y="7" width="6" height="10" rx="2"/></svg> Vibration Off'
                    }
                </button>
            </div>` : ''}

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
                    <div><span class="time-lbl">Start</span><input type="time" id="ob-shift-start" value="${p.shiftStart || '21:00'}"></div>
                    <span class="time-sep">&#8594;</span>
                    <div><span class="time-lbl">End</span><input type="time" id="ob-shift-end" value="${p.shiftEnd || '06:00'}"></div>
                </div>
            </div>
            ${isEdit
                ? `<div style="display:flex;gap:0.75rem;margin-top:1.5rem;align-items:stretch;">
                    <button class="onboarding-submit" style="flex:1;margin-top:0;" type="button" onclick="submitOnboarding()">Save Changes</button>
                    <button class="onboarding-submit" type="button" style="flex:1;margin-top:0;background:var(--bg-input);color:var(--text-primary);border-color:var(--border);font-weight:600;" onclick="document.getElementById('onboarding-overlay').remove()">Cancel</button>
                   </div>`
                : `<button class="onboarding-submit" type="button" onclick="submitOnboarding()">Get Started</button>`
            }
        </div>`;
}

window.settingsToggleTheme = function(btn) {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('medconvert_theme', next);
    // Update button label
    btn.innerHTML = next === 'dark'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Light Mode'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Dark Mode';
};

window.settingsToggleVibration = function(btn) {
    const isOn = localStorage.getItem('mc_vibrate') !== '0';
    const next = !isOn;
    localStorage.setItem('mc_vibrate', next ? '1' : '0');
    btn.innerHTML = next
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14.5a8 8 0 0 1 0-5M3 16.5a11 11 0 0 1 0-9M19 14.5a8 8 0 0 0 0-5M21 16.5a11 11 0 0 0 0-9"/><rect x="9" y="7" width="6" height="10" rx="2"/></svg> Vibration On'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M5 14.5a8 8 0 0 1-.34-5M3 16.5A11 11 0 0 1 3 7.5M19 14.5a8 8 0 0 0 .34-5M21 16.5a11 11 0 0 0 0-9"/><rect x="9" y="7" width="6" height="10" rx="2"/></svg> Vibration Off';
    showToast(next ? 'Haptic feedback on' : 'Haptic feedback off', 'info');
};

// Patch navigator.vibrate to respect the vibration preference
(function() {
    if (!('vibrate' in navigator)) return;
    const _origVibrate = navigator.vibrate.bind(navigator);
    navigator.vibrate = function(pattern) {
        if (localStorage.getItem('mc_vibrate') === '0') return false;
        return _origVibrate(pattern);
    };
})();

function showOnboarding() {
    saveProfile({ name: 'Abigail', specialty: 'General', shift: 'Night', shiftStart: '21:00', shiftEnd: '06:00' });
    applyProfileData();
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
    const name = 'Abigail';
    const specialty = document.getElementById('ob-specialty').value || 'General';
    const shift = document.getElementById('ob-shift').value || 'Day';
    const shiftStart = document.getElementById('ob-shift-start').value || '21:00';
    const shiftEnd = document.getElementById('ob-shift-end').value || '06:00';
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
    const el = document.getElementById('subtitle-text');
    if (el) el.textContent = 'An Offline Tool For Abigail';
    const pill = document.getElementById('specialty-pill');
    if (pill) {
        const p = getProfile();
        const shiftLabel = p?.shift ? p.shift + ' Shift' : 'Night Shift';
        pill.textContent = shiftLabel;
    }
}

/* shift countdown */
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
            // Simple straight progress line
            (function buildBar() {
                const W = 400, H = 6;
                const clipW = Math.max(0, Math.min(W, (pct / 100) * W));
                const fill  = ending ? '#9e4f42' : '#2d5a27';
                const track = ending ? 'rgba(158,79,66,0.2)' : 'rgba(0,0,0,0.12)';

                el.innerHTML = `
                <span class="cd-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg></span>
                <span class="cd-text"><strong>${hrs}h ${mins}m</strong> left</span>
                <svg class="cd-ecg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
                  <rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="${track}"/>
                  <rect x="0" y="0" width="${clipW}" height="${H}" rx="3" fill="${fill}"/>
                </svg>`;
            })();
            el.className = `shift-countdown ${ending ? 'cd-ending' : 'cd-active'}`;
        }
        el.style.display = 'flex';
    }
    update();
    setInterval(update, 60000);
}

/* pinned tools */
const ALL_TABS = [
    { id: 'timer',      label: 'Timer',      icon: 'icon-timer'   },
    { id: 'dosage',     label: 'Dosage',     icon: 'icon-pill'    },
    { id: 'iv',         label: 'IV & Drip',  icon: 'icon-drip'    },
    { id: 'vitals',     label: 'Vitals',     icon: 'icon-heart'   },
    { id: 'assessment', label: 'Assessment', icon: 'icon-chart'   },
    { id: 'pediatric',  label: 'Pediatric',  icon: 'icon-baby'    },
    { id: 'lab',        label: 'Lab Values', icon: 'icon-flask'   },
    { id: 'convert',    label: 'Converters', icon: 'icon-swap'    },
    { id: 'reference',  label: 'Reference',  icon: 'icon-book'    },
    { id: 'notes',      label: 'Notes',      icon: 'icon-notes'   },
    { id: 'drugs',      label: 'Drug Ref',   icon: 'icon-syringe' },
    { id: 'io',         label: 'I&O',        icon: 'icon-io'      },
    { id: 'handover',   label: 'Handover',   icon: 'icon-handover'},
    { id: 'meddue',     label: 'Med Due',    icon: 'icon-clock'   },
    { id: 'news2',      label: 'NEWS2',      icon: 'icon-warning' },
    { id: 'qsofa',      label: 'qSOFA',      icon: 'icon-flag'    },
    { id: 'ecg',        label: 'ECG',        icon: 'icon-heart'   },
    { id: 'crashcart',  label: 'Crash Cart', icon: 'icon-warning' },
    { id: 'ivcompat',   label: 'IV Compat',  icon: 'icon-compat'  },
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
            <p class="onboarding-subtitle">Select up to 6 tools to pin for quick access.</p>
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
        if (pinned.length >= 6) {
            cb.checked = false;
            cb.closest('.pin-option').classList.remove('pinned');
            showToast('Maximum 6 pinned tools', 'warning');
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

/* calculation history */
function getHistory() { try { const r = localStorage.getItem('medconvert_history'); return r ? JSON.parse(r) : []; } catch { return []; } }

function addToHistory(category, label, value) {
    let h = getHistory();
    h.unshift({ id: Date.now(), category, label, value, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) });
    h = h.slice(0, 20);
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

/* toast */
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

/* results */
function showResult(resultElId, valueElId, displayValue, status, note, noteElId, interpElId, interpHtml) {
    const resultEl = document.getElementById(resultElId);
    const valueEl = document.getElementById(valueElId);
    if (!resultEl || !valueEl) return;
    // Un-hide result boxes that start display:none
    if (resultEl.style.display === 'none') resultEl.style.display = '';
    valueEl.textContent = displayValue;
    resultEl.classList.remove('result-normal', 'result-warning', 'result-danger', 'result-neutral');
    resultEl.classList.add(`result-${status || 'neutral'}`, 'show');
    if (noteElId && note !== undefined) { const n = document.getElementById(noteElId); if (n) n.textContent = note || ''; }
    if (interpElId && interpHtml !== undefined) { const i = document.getElementById(interpElId); if (i) i.innerHTML = interpHtml || ''; }
    if (navigator.vibrate) navigator.vibrate(12);
}

/* clock & greeting */
let _use24h = false;

function initializeClock() {
    // Restore user preference
    _use24h = localStorage.getItem('mc_24h') === '1';
    const t = document.getElementById('clock-time'), d = document.getElementById('clock-date');
    function update() {
        const now = new Date();
        if (t) t.textContent = _use24h
            ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
            : now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        if (d) d.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    update();
    setInterval(update, 1000);
    _clockUpdateFn = update;
}

let _clockUpdateFn = null;

window.toggleClockFormat = function() {
    _use24h = !_use24h;
    localStorage.setItem('mc_24h', _use24h ? '1' : '0');
    if (_clockUpdateFn) _clockUpdateFn();
    // Brief visual flash on the clock
    const w = document.getElementById('clock-widget');
    if (w) {
        w.style.transition = 'background 0.15s';
        w.style.background = 'rgba(255,255,255,0.15)';
        setTimeout(() => { w.style.background = ''; }, 180);
    }
    showToast(_use24h ? '24-hour (military) time on' : '12-hour time on', 'info');
};

function setGreeting() {
    const h = new Date().getHours(), el = document.getElementById('greeting');
    if (!el) return;
    // Shift-aware, nurse-specific messages keyed to the clock
    const msgs = [
        [0,  2,  `Still up, baby? I'm proud of you. The hardest part of the night is almost over.`],
        [2,  4,  `Mid-shift slump — take a breath. You're doing so well and I'm right here with you.`],
        [4,  5,  `Almost through it. The sun is coming up soon. You've got this, my love.`],
        [5,  6,  `Morning soon! So close to going home. I'm already waiting for you.`],
        [6,  7,  `Last stretch of the night shift — you made it. Go rest well when you're home.`],
        [7,  10, `Good morning, baby. I hope your handover goes smoothly.`],
        [10, 12, `Morning! Almost lunchtime — please actually eat something today.`],
        [12, 14, `Good afternoon. Have you eaten? No, seriously — please eat.`],
        [14, 17, `Hey baby, I'm thinking of you this afternoon. You're doing so well.`],
        [17, 19, `Evening already. You've had a long day — I hope it was a good one.`],
        [19, 21, `Have a great shift tonight, my love. You've got this — I believe in you.`],
        [21, 22, `Night shift starting — I made sure this works even in hospital dead zones.`],
        [22, 24, `Night shift in full swing. Take it one patient at a time. I'm proud of you.`],
    ];
    el.textContent = (msgs.find(([s, e]) => h >= s && h < e) || msgs[msgs.length-1])[2];
}

function setDailyFooterMessage() {
    const el = document.getElementById('daily-message');
    if (!el) return;
    const name = getName();
    const msgs = [
        `I see how hard you work, ${name}, and I just want you to know — I'm so proud of you. Every single shift.`,
        `I made this for you, ${name}, because you deserve something that makes your job even a little bit easier. I love you.`,
        `I think about you on those long night shifts and I hope you know I'm always rooting for you, ${name}.`,
        `You never complain, you always show up, and you give everything you have. I notice that, ${name}. I really do.`,
        `I wish I could be there with you tonight. Since I can't — I hope this helps. Take care of yourself, ${name}.`,
        `I know the shifts are long and the nights are hard. But I believe in you more than you know, ${name}.`,
        `Please eat, please rest, please drink water. I'm serious, ${name}. You matter so much to me.`,
        `I'm so glad you exist, ${name}. Not just as a nurse — but as you. The world is better with you in it.`,
        `I made sure every calculator here works perfectly, because you deserve tools that don't let you down. Just like you never let anyone down.`,
        `On the days you feel invisible, remember that I see you, ${name}. I always see you.`,
        `I built this offline so it works even at 3am when the signal is gone and you still have patients to care for. I've got you.`,
        `You are my favorite person, ${name}. I just wanted to say that somewhere you'd actually see it.`,
        `I know you're tired. I know. But you're almost there — and I'll be here when you get home.`,
        `Every time you open this app, just know I was thinking of you when I made it, ${name}.`,
        `I love you, ${name}. Go be the amazing nurse I know you are. I'll be here waiting.`
    ];
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    el.textContent = msgs[day % msgs.length];
}

/* navigation */
function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchToTab(btn.getAttribute('data-tab')));
    });
    // Restore tab from URL param (?tab=dosage) — supports manifest shortcuts
    try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && document.getElementById(`panel-${tabParam}`)) {
            switchToTab(tabParam);
            updateMobileNav(tabParam);
        }
    } catch {}
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
    // Sync URL so manifest shortcuts & browser back button restore the correct tab
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabId);
        history.replaceState(null, '', url.toString());
    } catch {}
};

window.showSubPanel = function (subId) {
    const clickedBtn = (typeof event !== 'undefined') ? (event.currentTarget || event.target) : null;
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

/* timer */
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

/* dosage */
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

/* iv & drip */
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

/* vitals */
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

/* assessment */
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
    // 2021 CKD-EPI Creatinine Equation (race-neutral, KDIGO recommended)
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const sf    = sex === 'female' ? 1.012 : 1.0;
    const egfr = Math.round(142 * Math.pow(Math.min(cr / kappa, 1), alpha) * Math.pow(Math.max(cr / kappa, 1), -1.200) * Math.pow(0.9938, age) * sf);
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
    // Wells DVT: ≤1 = Low, 2 = Moderate, ≥3 = High
    let status = score <= 1 ? 'normal' : score === 2 ? 'warning' : 'danger';
    let interp = score <= 1
        ? '<strong>Low Probability:</strong> Score ≤1 · ~5% prevalence — obtain D-dimer; if negative, DVT excluded'
        : score === 2
            ? '<strong>Moderate Probability:</strong> Score 2 · ~17% prevalence — D-dimer or proximal duplex ultrasound'
            : '<strong>High Probability:</strong> Score ≥3 · Up to 53% prevalence — proximal duplex ultrasound; anticoagulation if positive';
    showResult('wells-result', 'wells-value', display, status, null, null, 'wells-interpretation', interp);
    addToHistory('Assessment', 'Wells DVT', display);
};

/* pediatric */
window.calculatePedsWeight = function () {
    const ageInput = document.getElementById('peds-age');
    const ageUnit  = document.getElementById('peds-age-unit') ? document.getElementById('peds-age-unit').value : 'years';
    const rawAge   = parseFloat(ageInput.value);
    if (!rawAge || rawAge <= 0) { showToast('Enter a valid age', 'warning'); return; }

    let weightKg, formula, note;

    if (ageUnit === 'months') {
        // Infant formula (1–12 months)
        if (rawAge < 1 || rawAge > 12) { showToast('For months: enter 1–12', 'warning'); return; }
        weightKg = (rawAge / 2) + 4;
        formula  = `(Age_months ÷ 2) + 4`;
        note     = 'Infant formula (1–12 months). Use Broselow tape or actual weight when available.';
    } else {
        // Broselow (1–10 years)
        const ageYr = Math.round(rawAge);
        if (ageYr < 1 || ageYr > 10) { showToast('For years: enter 1–10', 'warning'); return; }
        weightKg = (ageYr * 2) + 8;
        formula  = `(Age_years × 2) + 8`;
        note     = `Broselow formula · age ${ageYr} yr. Actual weight preferred when available.`;
    }

    const display = `${weightKg.toFixed(1)} kg`;
    showResult('peds-weight-result', 'peds-weight-value', display, 'neutral', note, 'peds-weight-note');
    document.getElementById('peds-weight-formula') && (document.getElementById('peds-weight-formula').textContent = `Formula: ${formula}`);
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

/* lab converter */
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

/* live converters */
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

/* notes */
function loadNotes() {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    try {
        const saved = localStorage.getItem('medconvert_notes_html');
        if (saved) editor.innerHTML = saved;
    } catch {}
    let saveTimeout;
    const save = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            try { localStorage.setItem('medconvert_notes_html', editor.innerHTML); } catch {}
            updateNotesWordCount();
        }, 600);
    };
    editor.addEventListener('input', save);
    editor.addEventListener('keydown', e => {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') { e.preventDefault(); notesExecCmd('bold'); }
            if (e.key === 'i') { e.preventDefault(); notesExecCmd('italic'); }
            if (e.key === 'u') { e.preventDefault(); notesExecCmd('underline'); }
        }
    });
    updateNotesWordCount();
}

function updateNotesWordCount() {
    const editor  = document.getElementById('shift-notes');
    const counter = document.getElementById('notes-char-count');
    if (!editor || !counter) return;
    const text  = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.replace(/\s/g, '').length;
    // Compact label on narrow screens, full label on wider ones
    const narrow = window.innerWidth < 480;
    counter.textContent = narrow
        ? `${words}w · ${chars}c`
        : `${words} word${words !== 1 ? 's' : ''} · ${chars} chars`;
}

window.clearNotes = function () {
    showConfirmModal(() => {
        const editor = document.getElementById('shift-notes');
        if (editor) editor.innerHTML = '';
        try {
            localStorage.removeItem('medconvert_notes_html');
            localStorage.removeItem('medconvert_notes'); // legacy key
        } catch {}
        updateNotesWordCount();
        showToast('Notes cleared', 'info');
    });
};

window.exportNotes = function () {
    const editor = document.getElementById('shift-notes');
    if (!editor || !editor.innerText.trim()) { showToast('No notes to export', 'warning'); return; }
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MedConvert Notes — ${date}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 780px; margin: 2rem auto; padding: 0 1.5rem; color: #2a2018; line-height: 1.85; font-size: 15px; }
  h1   { font-size: 1.1rem; color: #2d5a27; border-bottom: 2px solid #cfc7b4; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
  ul, ol { padding-left: 1.4rem; }
  hr { border: none; border-top: 2px solid #cfc7b4; margin: 1rem 0; }
  @media print { body { margin: 0; padding: 1cm; } }
</style>
</head>
<body>
<h1>MedConvert Shift Notes &mdash; ${date} ${time}</h1>
${editor.innerHTML}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedConvert_Notes_${date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Notes exported as HTML', 'success');
};

/* drug reference */
const DRUG_DB = [
    { name: 'Adenosine', category: 'Cardiac', route: 'IV', dose: '6 mg rapid IVP; repeat 12 mg if no response', onset: '~10 sec', peak: '~30 sec', notes: 'SVT termination. Flush immediately with rapid NS bolus.', contraindications: '2nd/3rd-degree AV block, sick sinus syndrome (without pacemaker), severe asthma' },
    { name: 'Amiodarone', category: 'Antiarrhythmic', route: 'IV/PO', dose: '150 mg IV over 10 min (loading)', onset: '1–3 hrs IV', peak: 'Days–weeks', notes: 'Pulmonary/thyroid toxicity with long-term use. Monitor QT.', contraindications: 'Iodine allergy, thyroid dysfunction, cardiogenic shock, severe sinus node dysfunction' },
    { name: 'Atropine', category: 'Anticholinergic', route: 'IV/IM', dose: '0.5–1 mg IV q3-5 min (max 3 mg)', onset: '<1 min IV', peak: '2–4 min', notes: 'Bradycardia. Min 0.5 mg to avoid paradoxical bradycardia.', contraindications: 'Glaucoma (narrow-angle), prostatic hypertrophy, myasthenia gravis, tachycardia' },
    { name: 'Cefazolin', category: 'Antibiotic', route: 'IV/IM', dose: '1–2 g q8h; surgical prophylaxis: 2 g', onset: '30 min', peak: '1–2 hrs', notes: '1st-gen cephalosporin. Reduce dose in renal impairment.', contraindications: 'Penicillin/cephalosporin hypersensitivity (cross-reactivity ~1–2%)' },
    { name: 'Dextrose 50%', category: 'Metabolic', route: 'IV', dose: '25 g (50 mL D50W)', onset: '1–3 min', peak: '5–10 min', notes: 'Symptomatic hypoglycaemia. Ensure patent IV — vesicant.', contraindications: 'Hyperglycaemia, anuria, intracranial/intraspinal haemorrhage' },
    { name: 'Diltiazem', category: 'Cardiac', route: 'IV/PO', dose: '0.25 mg/kg IV over 2 min', onset: '2–5 min', peak: '2–7 min', notes: 'A-fib/flutter rate control. Contraindicated in WPW, severe HF.', contraindications: 'WPW syndrome, severe LV dysfunction, hypotension, sick sinus syndrome, concurrent IV beta-blockers' },
    { name: 'Dopamine', category: 'Vasopressor', route: 'IV infusion', dose: '2–20 mcg/kg/min', onset: '2–5 min', peak: 'Minutes', notes: 'Low dose: dopaminergic; mid: beta-1; high: alpha-1. Vesicant.', contraindications: 'Phaeochromocytoma, uncorrected tachyarrhythmias, ventricular fibrillation' },
    { name: 'Epinephrine', category: 'Emergency', route: 'IV/IM/ET', dose: 'Cardiac arrest: 1 mg IV q3-5 min', onset: '<1 min', peak: '3–5 min', notes: 'Anaphylaxis IM (1:1000): 0.3–0.5 mg. Always have available.', contraindications: 'No absolute contraindications in cardiac arrest. Relative: narrow-angle glaucoma, hyperthyroidism (non-emergency)' },
    { name: 'Furosemide', category: 'Diuretic', route: 'IV/PO', dose: '20–80 mg IV (0.5–1 mg/kg)', onset: '5 min IV', peak: '30 min', notes: 'Monitor K+, Na+, fluid status. Ototoxicity at high doses.', contraindications: 'Anuria, sulfa allergy, severe dehydration, hepatic coma' },
    { name: 'Heparin', category: 'Anticoagulant', route: 'IV/SubQ', dose: 'DVT: 80 u/kg bolus, then 18 u/kg/hr', onset: '<5 min IV', peak: 'Minutes', notes: 'Monitor aPTT q6h. Antidote: Protamine sulfate. HIT risk.', contraindications: 'Active major bleeding, HIT history, severe thrombocytopenia (<50), bacterial endocarditis (relative)' },
    { name: 'Hydralazine', category: 'Antihypertensive', route: 'IV/IM/PO', dose: '10–20 mg IV q4-6h PRN', onset: '5–20 min IV', peak: '10–80 min', notes: 'Pregnancy-associated hypertension. Reflex tachycardia common.', contraindications: 'Coronary artery disease, mitral valve rheumatic heart disease, tachycardia, dissecting aortic aneurysm' },
    { name: 'Insulin (Regular)', category: 'Metabolic', route: 'IV/SubQ/IM', dose: 'DKA infusion: 0.1 units/kg/hr', onset: '30 min SubQ', peak: '2–4 hrs SubQ', notes: 'IV onset 15 min. Monitor glucose q1h on infusion. Refrigerate.', contraindications: 'Hypoglycaemia. No absolute contraindication when used appropriately.' },
    { name: 'Ketorolac', category: 'Analgesic', route: 'IV/IM', dose: '15–30 mg q6h (max 5 days)', onset: '30 min', peak: '1–2 hrs', notes: 'Max 5-day course. Avoid in renal insufficiency or GI bleeding.', contraindications: 'Active GI bleed, renal impairment, aspirin/NSAID allergy, prior peptic ulcer, bleeding disorders, >5-day use' },
    { name: 'Labetalol', category: 'Antihypertensive', route: 'IV/PO', dose: '10–20 mg IV q10 min (max 300 mg)', onset: '2–5 min IV', peak: '5–15 min', notes: 'Alpha + beta blockade. Avoid in asthma, severe bradycardia, acute HF.', contraindications: 'Bronchospasm/asthma, cardiogenic shock, severe bradycardia, >1st-degree AV block, acute decompensated HF' },
    { name: 'Lorazepam', category: 'Benzodiazepine', route: 'IV/IM/PO/SL', dose: 'Status epilepticus: 4 mg IV over 2 min', onset: '1–5 min IV', peak: '15–20 min', notes: 'Sedation: 0.5–2 mg IV. Monitor respirations. Refrigerate.', contraindications: 'Acute narrow-angle glaucoma, respiratory depression, sleep apnoea (relative), myasthenia gravis' },
    { name: 'Magnesium Sulfate', category: 'Electrolyte', route: 'IV', dose: 'Eclampsia: 4–6 g over 15–20 min', onset: '1–2 min IV', peak: 'Minutes', notes: 'Torsades: 1–2 g IV. Monitor Mg levels and deep tendon reflexes.', contraindications: 'Heart block, renal failure (accumulation risk), hypermagnesaemia, myasthenia gravis' },
    { name: 'Metoprolol', category: 'Beta-Blocker', route: 'IV/PO', dose: '5 mg IV q5min x3 (ACS)', onset: '1–2 min IV', peak: '5–15 min', notes: 'STEMI: up to 15 mg IV. Contraindicated in acute decompensated HF.', contraindications: 'Acute decompensated HF, cardiogenic shock, bradycardia <45 bpm, >1st-degree AV block, severe asthma' },
    { name: 'Midazolam', category: 'Benzodiazepine', route: 'IV/IM/IN', dose: 'Procedural sedation: 1–2.5 mg IV slowly', onset: '<2 min IV', peak: '3–5 min', notes: 'Amnestic. Short-acting. Respiratory depression risk.', contraindications: 'Acute narrow-angle glaucoma, shock, myasthenia gravis. Use with extreme caution if airway not secured.' },
    { name: 'Morphine', category: 'Opioid Analgesic', route: 'IV/IM/SubQ/PO', dose: '2–4 mg IV q3-4h PRN', onset: '5–10 min IV', peak: '20 min IV', notes: 'Histamine release possible. Antidote: Naloxone. Monitor respirations.', contraindications: 'Respiratory depression, paralytic ileus, acute asthma attack, head injury with raised ICP (relative), MAOIs within 14 days' },
    { name: 'Naloxone', category: 'Reversal Agent', route: 'IV/IM/IN/SubQ', dose: '0.4–2 mg IV/IM q2-3 min', onset: '1–2 min IV', peak: '5–15 min', notes: 'Opioid reversal. Duration shorter than morphine — repeat as needed.', contraindications: 'Opioid-dependent patients (precipitates acute withdrawal). Caution: cardiovascular disease (sympathetic surge).' },
    { name: 'Nitroglycerin', category: 'Vasodilator', route: 'SL/IV/Topical', dose: 'ACS SL: 0.4 mg q5 min x3', onset: '1–3 min SL', peak: '3–5 min', notes: 'Hold if SBP <90. IV: 5–200 mcg/min. Avoid with PDE-5 inhibitors.', contraindications: 'SBP <90 mmHg, right ventricular infarction, concurrent PDE-5 inhibitors (sildenafil/tadalafil), raised ICP, severe anaemia' },
    { name: 'Norepinephrine', category: 'Vasopressor', route: 'IV infusion', dose: '0.01–3 mcg/kg/min (titrate to MAP)', onset: '1–2 min', peak: 'Minutes', notes: 'First-line in septic shock. Central line preferred. Vesicant.', contraindications: 'Hypovolaemia (correct first), mesenteric/peripheral vascular thrombosis (relative), halothane anaesthesia' },
    { name: 'Ondansetron', category: 'Antiemetic', route: 'IV/PO/IM', dose: '4 mg IV over 2–5 min q4-8h', onset: '<5 min IV', peak: '30 min', notes: 'QT prolongation risk at high doses. Safe in pregnancy.', contraindications: 'Congenital long QT syndrome, concurrent QT-prolonging drugs at high doses, hypersensitivity to 5-HT3 antagonists' },
    { name: 'Potassium Chloride', category: 'Electrolyte', route: 'IV/PO', dose: 'IV: max 10–20 mEq/hr (peripheral)', onset: 'During infusion', peak: 'N/A', notes: 'NEVER IV push. Monitor ECG continuously. Dilute appropriately.', contraindications: 'Hyperkalaemia (K+ >5.5), renal failure without monitoring, untreated Addison\'s disease, severe dehydration with oliguria' },
    { name: 'Propofol', category: 'Sedative', route: 'IV infusion', dose: 'ICU sedation: 5–50 mcg/kg/min', onset: '<1 min', peak: '1–2 min', notes: 'Propofol infusion syndrome risk with high or prolonged doses.', contraindications: 'Egg/soy/peanut allergy (emulsion), disorders of fat metabolism. Not for induction in children <3 yrs (Diprivan).' },
    { name: 'Vancomycin', category: 'Antibiotic', route: 'IV', dose: '15–20 mg/kg q8-12h (max 3 g/dose)', onset: '30–60 min', peak: '1–2 hrs post-infusion', notes: 'Infuse over at least 60 min. Red Man Syndrome risk with rapid infusion. Monitor AUC/MIC.', contraindications: 'Hypersensitivity to vancomycin. Caution: renal impairment, ototoxicity risk with aminoglycosides, hearing loss.' },
    { name: 'Acetaminophen', category: 'Analgesic', route: 'IV/PO/PR', dose: '500–1000 mg q4-6h (max 4 g/day; 2 g/day in liver disease)', onset: '5–10 min IV', peak: '1 hr IV', notes: 'Hepatotoxic in overdose or chronic alcohol use. Max 4 g/day — reduce in renal/hepatic impairment.', contraindications: 'Severe hepatic impairment, active liver disease. Reduce max dose in chronic alcohol use.' },
    { name: 'Ceftriaxone', category: 'Antibiotic', route: 'IV/IM', dose: '1–2 g q12-24h; meningitis: 2 g q12h', onset: '30–60 min', peak: '2–3 hrs', notes: '3rd-gen cephalosporin. Long half-life allows once-daily dosing. Avoid with calcium in neonates (precipitate risk).', contraindications: 'Penicillin/cephalosporin anaphylaxis, neonates with hyperbilirubinaemia, concurrent calcium-containing IV solutions (neonates)' },
    { name: 'Dexamethasone', category: 'Corticosteroid', route: 'IV/IM/PO', dose: 'Anti-inflammatory: 0.5–9 mg/day; Cerebral edema: 10 mg loading', onset: '1 hr IM', peak: '1–2 hrs', notes: 'High potency, minimal mineralocorticoid activity. Monitor glucose. COVID-19: 6 mg daily x10 days.', contraindications: 'Systemic fungal infections, live vaccines during therapy. Relative: uncontrolled diabetes, active TB, peptic ulcer.' },
    { name: 'Enoxaparin', category: 'Anticoagulant', route: 'SubQ', dose: 'Treatment DVT/PE: 1 mg/kg q12h or 1.5 mg/kg daily', onset: '3–5 hrs', peak: '3–5 hrs', notes: 'Monitor anti-Xa in obesity, renal impairment, pregnancy. Adjust dose for CrCl <30 mL/min.', contraindications: 'HIT history, active major bleeding, severe thrombocytopenia, prosthetic heart valves (relative), epidural/spinal anaesthesia within 12 hrs' },
    { name: 'Fentanyl', category: 'Opioid Analgesic', route: 'IV/IM/Transdermal/IN', dose: 'Pain: 25–100 mcg IV q1-2h PRN; infusion: 12.5–200 mcg/hr', onset: '<1 min IV', peak: '3–5 min IV', notes: '100× more potent than morphine (mcg not mg). Short duration IV. Antidote: Naloxone. Monitor respirations.', contraindications: 'Respiratory depression, MAOIs within 14 days, paralytic ileus. Patch: acute pain, fever (increases absorption).' },
    { name: 'Meropenem', category: 'Antibiotic', route: 'IV', dose: '500 mg–1 g q8h; meningitis/resistant: 2 g q8h', onset: '30–60 min', peak: '30 min post-infusion', notes: 'Broad-spectrum carbapenem. Reserve for resistant infections. Extended infusion (over 3 hrs) optimises PK/PD.', contraindications: 'Hypersensitivity to carbapenems/beta-lactams. Reduces valproate levels — monitor seizure control.' },
    { name: 'Metformin', category: 'Antidiabetic', route: 'PO', dose: '500 mg BID to 1000 mg BID (max 2550 mg/day)', onset: '1–3 hrs', peak: '2.5 hrs', notes: 'Hold 48 hrs before/after contrast media. Contraindicated if eGFR <30. Lactic acidosis risk in hypoxaemia.', contraindications: 'eGFR <30, contrast media procedures (hold 48 hrs), hepatic failure, heart failure requiring pharmacotherapy, alcohol abuse' },
    { name: 'Piperacillin-Tazobactam', category: 'Antibiotic', route: 'IV', dose: '3.375 g q6h; severe infections/Pseudomonas: 4.5 g q6h', onset: '30–60 min', peak: '30 min post-infusion', notes: 'Extended infusion (4 hrs at 4.5g) improves outcomes in severe infections. Monitor renal function.', contraindications: 'Penicillin hypersensitivity. Caution: ESBL-producing organisms (reduced efficacy), concurrent vancomycin (nephrotoxicity).' },
    { name: 'Tranexamic Acid', category: 'Haemostatic', route: 'IV/PO', dose: 'Trauma: 1 g IV over 10 min, then 1 g over 8 hrs (within 3 hrs of injury)', onset: '5–15 min IV', peak: '1 hr', notes: 'Best within 3 hrs of injury. Reduces mortality in major trauma and PPH. Not for late-presenting haemorrhage.', contraindications: 'Subarachnoid haemorrhage (IV), active thromboembolic disease (DVT/PE), disseminated intravascular coagulation (DIC), haematuria from upper urinary tract' },
    { name: 'Metronidazole', category: 'Antibiotic', route: 'IV/PO', dose: '500 mg IV/PO q8h; C. difficile: 500 mg PO TID', onset: '30–60 min IV', peak: '1–2 hrs', notes: 'Anaerobic and protozoal coverage. Avoid alcohol during & 48 hrs after. Metallic taste common. Monitor for peripheral neuropathy with prolonged use.', contraindications: 'First trimester of pregnancy (relative), disulfiram use within 2 weeks, alcohol consumption, CNS disease (high doses)' },
    { name: 'Ciprofloxacin', category: 'Antibiotic', route: 'IV/PO', dose: '400 mg IV q8-12h; PO 500–750 mg q12h', onset: '30–60 min IV', peak: '1–2 hrs', notes: 'Broad gram-negative coverage. QT prolongation risk — check ECG. Avoid antacids ±2 hrs. Tendon rupture risk especially in elderly.', contraindications: 'Concurrent QT-prolonging agents, known quinolone hypersensitivity, myasthenia gravis, children/adolescents (growing cartilage risk)' },
    { name: 'Amoxicillin-Clavulanate', category: 'Antibiotic', route: 'PO/IV', dose: 'PO: 875/125 mg q12h; IV (co-amoxiclav): 1.2 g q8h', onset: '1–2 hrs PO', peak: '1–2.5 hrs', notes: 'Broad-spectrum beta-lactam/inhibitor. Common GI side effects — take with food. Avoid if penicillin-allergic. Hepatotoxicity risk with prolonged use.', contraindications: 'Penicillin/amoxicillin hypersensitivity, history of cholestatic jaundice from amoxicillin-clavulanate, severe renal impairment (IV formulation)' },
    { name: 'Salbutamol', category: 'Bronchodilator', route: 'Inhaled/IV/Nebulised', dose: 'Nebuliser: 2.5–5 mg; MDI: 2–4 puffs q4-6h PRN; Severe asthma IV: 5 mcg/min', onset: '5 min inhaled', peak: '30–60 min', notes: 'Short-acting beta-2 agonist. Tachycardia and hypokalaemia with frequent/high doses. Monitor K+ in severe acute asthma.', contraindications: 'Hypersensitivity to salbutamol. Caution: tachyarrhythmias, thyrotoxicosis, uncorrected hypokalaemia, MAOI use.' },
    { name: 'Ipratropium', category: 'Bronchodilator', route: 'Inhaled/Nebulised', dose: 'Nebuliser: 0.5 mg q4-6h; MDI: 2 puffs q6h', onset: '15 min', peak: '1–2 hrs', notes: 'Short-acting anticholinergic. Additive bronchodilation with salbutamol. Avoid eye contact (glaucoma risk). Dry mouth common.', contraindications: 'Narrow-angle glaucoma (if eye exposure), urinary retention/prostatic hypertrophy, hypersensitivity to atropine' },
    { name: 'Pantoprazole', category: 'Gastrointestinal', route: 'IV/PO', dose: '40 mg IV/PO daily; GI bleed: 80 mg IV bolus then 8 mg/hr infusion', onset: '15–30 min IV', peak: '2 hrs', notes: 'Proton pump inhibitor. For stress ulcer prophylaxis in ICU. IV use for active GI bleed. Interactions: clopidogrel (reduce efficacy).', contraindications: 'Hypersensitivity to PPIs. Caution: long-term use associated with hypomagnesaemia, C. difficile, fracture risk. Reduces clopidogrel efficacy.' },
    { name: 'Ondansetron 8 mg', category: 'Antiemetic', route: 'IV/PO', dose: '8 mg IV over 15 min or PO q8-12h PRN', onset: '5–10 min IV', peak: '30 min', notes: 'Higher 8 mg dose for chemotherapy-induced or post-op nausea. QT prolongation at high doses — do not exceed 32 mg/day IV. Safe in pregnancy. See also Ondansetron 4 mg entry.', contraindications: 'Congenital long QT syndrome, concurrent QT-prolonging agents, apomorphine. Max 32 mg/day IV.' },
    { name: 'Haloperidol', category: 'Antipsychotic', route: 'IV/IM/PO', dose: 'Acute agitation: 2–5 mg IM/IV; delirium: 0.5–2 mg PO/IV q4-6h PRN', onset: '10–20 min IM', peak: '30–60 min', notes: 'QT prolongation — monitor ECG. EPS risk (dystonia, akathisia). Preferred for ICU delirium. Avoid in Parkinson\'s and Lewy body dementia.', contraindications: 'Parkinson\'s disease, Lewy body dementia, CNS depression, QT >500 ms, Torsades de pointes, phaeochromocytoma' },
    { name: 'Prednisolone', category: 'Corticosteroid', route: 'PO/IV', dose: 'Anti-inflammatory: 20–40 mg/day; acute asthma: 40–60 mg/day x5 days', onset: '1–2 hrs', peak: '1–2 hrs', notes: 'Intermediate-acting corticosteroid. Taper after prolonged use to avoid adrenal insufficiency. Monitor glucose especially in diabetics.', contraindications: 'Systemic fungal infection, live vaccines. Relative: uncontrolled diabetes, active peptic ulcer, psychosis, osteoporosis, active TB.' },
    { name: 'Amoxicillin', category: 'Antibiotic', route: 'PO/IV', dose: '500 mg–1 g PO TID; IV: 1 g q8h', onset: '1–2 hrs PO', peak: '1–2 hrs', notes: 'First-line for CAP (mild), UTI, otitis media. Avoid if penicillin-allergic. Poor coverage against Staph aureus and most gram-negatives.', contraindications: 'Penicillin hypersensitivity (including anaphylaxis history), infectious mononucleosis (rash risk), phenylketonuria (some formulations contain aspartame)' },
    { name: 'Acetazolamide', category: 'Diuretic', route: 'PO/IV', dose: '250–375 mg PO/IV daily or BID', onset: '30 min–2 hrs PO', peak: '2–4 hrs', notes: 'Carbonic anhydrase inhibitor. Used for altitude sickness, metabolic alkalosis, glaucoma. Sulfonamide — avoid if sulfa-allergic. Monitor K+ and HCO3−.', contraindications: 'Sulfonamide allergy, hepatic failure, chronic non-congestive angle-closure glaucoma, hyponatraemia, hypokalaemia, adrenocortical insufficiency' },
    { name: 'Gabapentin', category: 'Analgesic', route: 'PO', dose: 'Neuropathic pain: 300 mg TID, titrate to 900–3600 mg/day in 3 divided doses', onset: '2–3 hrs', peak: '3–4 hrs', notes: 'Adjust dose for renal impairment (eGFR <60). Dizziness and sedation common — risk of falls. Abuse potential. Monitor closely in elderly.', contraindications: 'Hypersensitivity to gabapentin. Caution: concurrent CNS depressants, opioids (respiratory depression risk), elderly patients (falls).' },
    { name: 'Clopidogrel', category: 'Antiplatelet', route: 'PO', dose: 'Loading: 300–600 mg once; Maintenance: 75 mg daily', onset: '2 hrs (loading)', peak: '3–7 days (maintenance)', notes: 'Prodrug requiring CYP2C19 activation. Reduced efficacy with PPIs (esp. omeprazole). Check for CYP2C19 poor metaboliser status in ACS. Hold 5 days pre-surgery.', contraindications: 'Active pathological bleeding (peptic ulcer, intracranial), hypersensitivity. Caution: PPIs (CYP2C19 interaction), surgery within 5 days.' }
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
    el.innerHTML = results.map(d => buildDrugCard(d)).join('');
};

window.clearDrugSearch = function () {
    document.getElementById('drug-search').value = '';
    document.getElementById('drug-category-filter').value = '';
    document.getElementById('drug-results').innerHTML = `<div class="drug-placeholder">Start typing to search ${DRUG_DB.length} drugs, or filter by category above.</div>`;
};

/* back to top */
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

/* scroll reveal */
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

/* service worker */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('medconvert-sw.js').catch(() => {});
    }
}

/* keyboard shortcuts */
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabs = document.querySelectorAll('.tab-btn');
        const idx = parseInt(e.key) - 1;
        if (tabs[idx]) tabs[idx].click();
    }
});


/* HCI enhancement layer — 8 principles applied:
   consistency, visibility, feedback, affordance,
   accessibility, cognitive load, Fitts's law, user control */

/* HCI Init: Append all enhancements after DOMContentLoaded */
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

/* ARIA live region */
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

/* Form validation */
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

/* Button feedback */
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

}

/* Keyboard navigation */
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
    const _origShowOnboarding = window.showOnboarding || function(){};
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

/* Tab ARIA */
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


function hci_patchShowToast() {
    const _orig = window.showToast || function(){};
    window.showToast = function(msg, type) {
        _orig.apply(this, arguments);
        hci_announce(msg);
    };
    // Also make showToast global from medconvert.js accessible after overwrite
}


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

/* Improvement patch */

/* Offline indicator */
function initOfflineIndicator() {
    const badge = document.getElementById('offline-badge');
    if (!badge) return;
    const dot = badge.querySelector('.offline-dot');
    const label = badge.querySelector('.offline-label');

    let _swReady = false;
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        _swReady = true;
    }

    function update() {
        const online = navigator.onLine;
        badge.classList.toggle('is-offline', !online);
        if (!online) {
            label.textContent = 'Offline Mode';
            badge.title = 'No internet — using cached data. All calculations still work.';
            dot.style.background = 'var(--dusty-rose)';
        } else if (_swReady) {
            label.textContent = 'Ready Offline';
            badge.title = 'Connected — app is cached and works without internet';
            dot.style.background = '#6ee48a';
        } else {
            // Online but not yet cached — clearer than just "Online"
            label.textContent = 'Not Cached Yet';
            badge.title = 'Connected but not yet cached offline. Keep the app open for a moment to enable offline use.';
            dot.style.background = 'var(--amber, #c4763a)';
        }
    }

    update();
    window.addEventListener('online',  () => { update(); showToast('Connection restored', 'success'); });
    window.addEventListener('offline', () => { update(); showToast('Offline — all tools still available', 'info'); });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
            _swReady = true;
            update();
            // Only toast if user hasn't seen it before this session
            if (!sessionStorage.getItem('mc_sw_ready_toast')) {
                sessionStorage.setItem('mc_sw_ready_toast', '1');
                showToast('App cached — works offline now', 'success');
            }
        }).catch(() => {});
    }
}

/* Enter to calculate */
function initEnterToCalculate() {
    // Map of calc panel IDs to their primary calculate button selector
    const CALC_PANELS = {
        'panel-dosage':     '.btn-primary',
        'panel-iv':         '.btn-primary',
        'panel-vitals':     '.btn-primary',
        'panel-assessment': '.btn-primary',
        'panel-pediatric':  '.btn-primary',
        'panel-lab':        '.btn-primary',
        'panel-convert':    '.btn-primary',
        'panel-reference':  '.btn-primary',
    };

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        const active = document.activeElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'SELECT')) return;
        // Don't intercept time/date inputs or textareas
        if (['time','date','search'].includes(active.type)) return;
        // Find the active sub-panel
        const subPanel = active.closest('.sub-panel.active') || active.closest('.sub-panel');
        if (subPanel) {
            const btn = subPanel.querySelector('.btn-primary');
            if (btn) { e.preventDefault(); btn.click(); return; }
        }
        // Fallback: find the active calc-card's primary button
        const card = active.closest('.calc-card.active') || active.closest('.calc-card');
        if (card) {
            const btn = card.querySelector('.sub-panel.active .btn-primary') || card.querySelector('.btn-primary');
            if (btn) { e.preventDefault(); btn.click(); }
        }
    });
}

/* Copy result button */
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

/* Clear inputs button */
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

/* Timer progress ring */
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

// Patch startTimer — single unified patch (replaces original interval completely)
let _timerPatchInterval = null;
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

/* Sub-tab memory */
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

/* Show all drugs on load */
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
    const favs = getDrugFavorites();
    const isFav = favs.includes(d.name);
    const isDosageDrug = ['Norepinephrine','Epinephrine','Dopamine','Dobutamine','Amiodarone','Heparin','Insulin','Morphine','Fentanyl','Midazolam','Propofol','Vancomycin','Piperacillin-Tazobactam','Meropenem'].includes(d.name);
    const contraindicationsHTML = d.contraindications
        ? `<div class="drug-contraindications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:0.75rem;height:0.75rem;flex-shrink:0;margin-top:2px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg><span><strong>Avoid/Caution:</strong> ${d.contraindications}</span></div>`
        : '';
    return `<div class="drug-card${isFav ? ' drug-fav-active' : ''}">
        <div class="drug-header">
            <span class="drug-name">${d.name}</span>
            <div style="display:flex;align-items:center;gap:0.5rem;">
                <span class="drug-badge">${d.category}</span>
                <button class="drug-fav-btn${isFav ? ' is-fav' : ''}" onclick="toggleDrugFav('${d.name}', this)" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite ${d.name}">
                    <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
            </div>
        </div>
        <div class="drug-meta">
            <span class="drug-tag">${d.route}</span>
            <span class="drug-tag">Onset: ${d.onset}</span>
            <span class="drug-tag">Peak: ${d.peak}</span>
        </div>
        <div class="drug-dose"><strong>Dose:</strong> ${d.dose}</div>
        <div class="drug-notes">${d.notes}</div>
        ${contraindicationsHTML}
        ${isDosageDrug ? `<button class="drug-calc-btn" onclick="drugGoToCalc('${d.name}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
            Calculate dose
        </button>` : ''}
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

/* Confirm modal */
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

    // clearNotes is already defined with rich text support above — no override needed here
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

/* Weight unit toggle */
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

/* eGFR 2021 */
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

/* Tab scroll fade */
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

/* Lab range highlight */
const _origConvertLab = window.convertLab;
window.convertLab = function() {
    _origConvertLab.apply(this, arguments);
    // Enhance the result to highlight normal range
    const noteEl = document.getElementById('lab-normal-range');
    if (noteEl && noteEl.textContent) {
        noteEl.innerHTML = `<span class="normal-range-highlight">${noteEl.textContent}</span>`;
    }
};

/* Init */
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



/* Improvement pack 2 */

/* Dismiss keyboard before showing result */
(function patchCalculateFunctions() {
    function blurActiveInput() {
        if (document.activeElement && ['INPUT','SELECT'].includes(document.activeElement.tagName)) {
            document.activeElement.blur();
        }
    }
    const calcFns = [
        'calculateDosage','calculateWeightDose','calculateBSA','calculateBSADose',
        'calculateIV','calculateInfusionTime','calculateConcentration',
        'calculateMAP','calculatePP','calculateShockIndex','calculateAAGradient',
        'calculateGCS','calculateBMI','calculateEGFR','calculateWells',
        'calculatePedsWeight','calculatePedsDose','calculateAPGAR',
        'convertLab'
    ];
    calcFns.forEach(name => {
        const orig = window[name];
        if (orig) {
            window[name] = function() {
                blurActiveInput();
                return orig.apply(this, arguments);
            };
        }
    });
})();

/* Collapsible dashboard */
function initCollapsibleDashboard() {
    const toggle = document.getElementById('dashboard-toggle');
    const row = document.getElementById('dashboard-row');
    if (!toggle || !row) return;

    // Start collapsed
    row.style.display = 'none';
    row.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            // Collapse with animation
            row.style.maxHeight = row.scrollHeight + 'px';
            requestAnimationFrame(() => {
                row.style.transition = 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
                row.style.maxHeight = '0';
                row.style.opacity = '0';
            });
            setTimeout(() => { row.style.display = 'none'; row.style.maxHeight = ''; row.style.opacity = ''; }, 420);
            toggle.setAttribute('aria-expanded', 'false');
            row.setAttribute('aria-hidden', 'true');
        } else {
            // Expand with animation
            row.style.display = 'grid';
            row.style.maxHeight = '0';
            row.style.opacity = '0';
            row.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    row.style.transition = 'max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
                    row.style.maxHeight = row.scrollHeight + 'px';
                    row.style.opacity = '1';
                });
            });
            setTimeout(() => { row.style.maxHeight = ''; row.style.overflow = ''; }, 460);
            toggle.setAttribute('aria-expanded', 'true');
            row.setAttribute('aria-hidden', 'false');
        }
        if (navigator.vibrate) navigator.vibrate(5);
    });
}

/* Timer label */
function initTimerLabel() {
    const labelInput = document.getElementById('timer-label-input');
    if (!labelInput) return;

    // Update label display inside ring when typing
    labelInput.addEventListener('input', () => {
        const label = document.querySelector('.timer-ring-inner .timer-label');
        if (label) label.textContent = labelInput.value.trim() || 'remaining';
    });

    // Preset buttons set their own label
    const origStartTimer = window.startTimer;
    // Patch each preset button to also set label
    document.querySelectorAll('.timer-btn').forEach(btn => {
        const desc = btn.querySelector('.timer-desc');
        if (!desc) return;
        btn.addEventListener('click', () => {
            if (labelInput) labelInput.value = desc.textContent.trim();
            const label = document.querySelector('.timer-ring-inner .timer-label');
            if (label) label.textContent = desc.textContent.trim();
        }, true); // capture phase so it fires before startTimer
    });
}

/* Drug favorites */
function getDrugFavorites() {
    try { return JSON.parse(localStorage.getItem('medconvert_drug_favs') || '[]'); } catch { return []; }
}
function saveDrugFavorites(favs) {
    try { localStorage.setItem('medconvert_drug_favs', JSON.stringify(favs)); } catch {}
}

window.toggleDrugFav = function(drugName, btn) {
    let favs = getDrugFavorites();
    const isFav = favs.includes(drugName);
    if (isFav) {
        favs = favs.filter(f => f !== drugName);
        btn.classList.remove('is-fav');
        btn.closest('.drug-card').classList.remove('drug-fav-active');
        btn.querySelector('svg').setAttribute('fill', 'none');
        showToast(`${drugName} removed from favorites`, 'info');
    } else {
        favs.push(drugName);
        btn.classList.add('is-fav');
        btn.closest('.drug-card').classList.add('drug-fav-active');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        showToast(`${drugName} starred`, 'success');
    }
    saveDrugFavorites(favs);
    if (navigator.vibrate) navigator.vibrate(8);
};

// Override renderAllDrugs to sort favorites to top
const _origRenderAllDrugs = window.renderAllDrugs || function(){};
window.renderAllDrugs = function() {
    const el = document.getElementById('drug-results');
    if (!el || !window.DRUG_DB) return;
    const count = document.getElementById('drug-count');
    const favs = getDrugFavorites();
    const sorted = [...DRUG_DB].sort((a, b) => {
        const aFav = favs.includes(a.name) ? -1 : 0;
        const bFav = favs.includes(b.name) ? -1 : 0;
        return aFav - bFav;
    });
    if (count) {
        const favCount = favs.length;
        count.textContent = favCount > 0 ? `${DRUG_DB.length} drugs · ${favCount} starred` : `${DRUG_DB.length} drugs`;
    }
    el.innerHTML = (favs.length > 0 ? '<div class="drug-section-label">Starred</div>' : '') +
        sorted.map((d, i) => {
            const html = buildDrugCard(d);
            if (i === favs.length && favs.length > 0 && favs.length < DRUG_DB.length) {
                return '<div class="drug-section-label" style="margin-top:1rem;">All Drugs</div>' + html;
            }
            return html;
        }).join('');
};

/* Remember last tab */
function initTabStatePersistence() {
    // Save active tab on switch
    const origSwitch = window.switchToTab;
    if (origSwitch) {
        window.switchToTab = function(tabId) {
            origSwitch.apply(this, arguments);
            try { localStorage.setItem('medconvert_last_tab', tabId); } catch {}
        };
    }

    // Restore last active tab on load — also sync mobile nav
    try {
        const lastTab = localStorage.getItem('medconvert_last_tab');
        if (lastTab) {
            setTimeout(() => {
                if (window.switchToTab) window.switchToTab(lastTab);
                if (window.updateMobileNav) window.updateMobileNav(lastTab);
            }, 50);
        }
    } catch {}
}

/* Haptic patterns */
function initHapticPatterns() {
    if (!navigator.vibrate) return;

    // Patch showResult to use different haptics based on status
    const origShowResult = window.showResult;
    if (origShowResult) {
        window.showResult = function(resultElId, valueElId, displayValue, status) {
            origShowResult.apply(this, arguments);
            if (status === 'danger') navigator.vibrate([80, 40, 80, 40, 120]);
            else if (status === 'warning') navigator.vibrate([40, 20, 40]);
            else if (status === 'normal') navigator.vibrate([15, 10, 30]);
            else navigator.vibrate(12);
        };
    }

    // Timer done - strong pattern
    // Already handled in timer patch - enhance it
    const origStartTimer = window.startTimer;
    if (origStartTimer) {
        window.startTimer = function(seconds) {
            origStartTimer.apply(this, arguments);
        };
    }
}


function initAutoCalcDefaults() {
    // Trigger GCS calculation immediately so result shows with defaults
    // (Don't auto-trigger - wait for user interaction, just show result display always visible)
    const gcsResult = document.getElementById('gcs-result');
    if (gcsResult) {
        // Make result visible by default for GCS, Wells, APGAR
        // They use selects so defaults are always valid
    }
}

/* Font fallback */
function initFontFallback() {
    // If Google Fonts fails (offline), ensure we have a good fallback chain
    // Add a class to body when fonts load
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            document.body.classList.add('fonts-loaded');
        }).catch(() => {
            document.body.classList.add('fonts-fallback');
        });
    }

    // Detect if fonts loaded after 2s (offline scenario)
    setTimeout(() => {
        if (!document.body.classList.contains('fonts-loaded')) {
            document.body.classList.add('fonts-fallback');
        }
    }, 2000);
}

/* Dashboard toggle styles */
/* addDashboardToggleStyles — styles moved to <style> block */

/* Init */
document.addEventListener('DOMContentLoaded', () => {
    initCollapsibleDashboard();
    initTimerLabel();
    initTabStatePersistence();
    initHapticPatterns();
    initFontFallback();
    // Render drugs with favorites sorted on init
    setTimeout(() => {
        if (window.renderAllDrugs) window.renderAllDrugs();
    }, 100);
});

/* Live result pulse */
const origShowResult2 = window.showResult;
if (origShowResult2) {
    window.showResult = function(resultElId) {
        origShowResult2.apply(this, arguments);
        const el = document.getElementById(resultElId);
        if (el) {
            el.classList.remove('result-live-update');
            requestAnimationFrame(() => el.classList.add('result-live-update'));
        }
    };
}




/* improvement pack 3 */

/* Search index — maps keywords to tab + sub-panel */
const CALC_SEARCH_INDEX = [
    // Timer
    { keywords: ['timer','countdown','stopwatch','timing','interval','infusion timer','obs timer'], tab: 'timer', sub: null, label: 'Vitals Timer' },
    // Dosage
    { keywords: ['standard dose','flat dose','fixed dose','d/h x q','formula dose','volume administer'], tab: 'dosage', sub: 'sub-dosage-standard', label: 'Standard Dosage (D/H×Q)' },
    { keywords: ['weight dose','weight based','kg dose','mcg/kg','mg/kg','dose per kg'], tab: 'dosage', sub: 'sub-dosage-weight', label: 'Weight-Based Dosage' },
    { keywords: ['bsa','body surface area','chemotherapy','mosteller','oncology'], tab: 'dosage', sub: 'sub-dosage-bsa', label: 'BSA Dosing' },
    { keywords: ['vancomycin','vanco','auc mic','auc/mic','renal dose vanco','trough'], tab: 'dosage', sub: 'sub-dosage-vanco', label: 'Vancomycin AUC/MIC' },
    { keywords: ['aminoglycoside','gentamicin','tobramycin','amikacin','hartford','once daily'], tab: 'dosage', sub: 'sub-dosage-aminoglycoside', label: 'Aminoglycoside (Hartford)' },
    // IV & Drip
    { keywords: ['drip rate','iv rate','infusion rate','ml/hr','drops/min','gtt/min','drop factor'], tab: 'iv', sub: 'sub-drip-rate', label: 'IV Drip Rate' },
    { keywords: ['infusion time','how long','duration','iv time','completion time'], tab: 'iv', sub: 'sub-infusion-time', label: 'Infusion Time' },
    { keywords: ['concentration','dilution','mix','reconstitute','mg/ml','mcg/ml'], tab: 'iv', sub: 'sub-concentration', label: 'IV Concentration' },
    // Vitals
    { keywords: ['map','mean arterial pressure','blood pressure','perfusion pressure'], tab: 'vitals', sub: 'sub-map', label: 'Mean Arterial Pressure' },
    { keywords: ['pulse pressure','pp','stroke volume','aortic'], tab: 'vitals', sub: 'sub-pp', label: 'Pulse Pressure' },
    { keywords: ['shock index','si','haemodynamic','hypotension','hemorrhage'], tab: 'vitals', sub: 'sub-shock-index', label: 'Shock Index' },
    { keywords: ['a-a gradient','alveolar','oxygenation','pao2','paco2','fio2','abg'], tab: 'vitals', sub: 'sub-a-a-gradient', label: 'A-a Oxygen Gradient' },
    // Assessment
    { keywords: ['gcs','glasgow coma scale','consciousness','neurological','avpu'], tab: 'assessment', sub: 'sub-gcs', label: 'Glasgow Coma Scale (GCS)' },
    { keywords: ['bmi','body mass index','obesity','overweight','underweight'], tab: 'assessment', sub: 'sub-bmi', label: 'BMI Calculator' },
    { keywords: ['egfr','creatinine','kidney function','renal function','ckd','ckd-epi','glomerular'], tab: 'assessment', sub: 'sub-egfr', label: 'eGFR / Renal Function' },
    { keywords: ['wells','dvt','deep vein thrombosis','clot','thrombosis','venous'], tab: 'assessment', sub: 'sub-wells', label: 'Wells DVT Score' },
    { keywords: ['curb','curb65','pneumonia','severity','cap','respiratory infection'], tab: 'assessment', sub: 'sub-curb65', label: 'CURB-65 Pneumonia Score' },
    { keywords: ['parkland','burn','tbsa','fluid resuscitation','burns','burn formula'], tab: 'assessment', sub: 'sub-parkland', label: 'Parkland Burn Formula' },
    { keywords: ['chadsvasc','cha2ds2','stroke risk','atrial fibrillation','af anticoag','anticoagulation af'], tab: 'assessment', sub: 'sub-chadsvasc', label: 'CHA₂DS₂-VASc Stroke Risk' },
    { keywords: ['braden','pressure ulcer','pressure injury','decubitus','skin integrity','bed sore'], tab: 'assessment', sub: 'sub-braden', label: 'Braden Scale (Pressure Injury)' },
    // Pediatric
    { keywords: ['pediatric weight','peds weight','child weight','broselow','estimated weight'], tab: 'pediatric', sub: 'sub-peds-weight', label: 'Pediatric Weight Estimation' },
    { keywords: ['pediatric dose','peds dose','child dose','paediatric'], tab: 'pediatric', sub: 'sub-peds-dose', label: 'Pediatric Dosage' },
    { keywords: ['apgar','newborn','neonate','birth score','infant assessment'], tab: 'pediatric', sub: 'sub-apgar', label: 'APGAR Score' },
    // Lab
    { keywords: ['lab','convert','mmol','mg/dl','laboratory','sodium','potassium','glucose','hemoglobin','haemoglobin','si units','conventional'], tab: 'lab', sub: null, label: 'Lab Value Converter' },
    // Converters
    { keywords: ['convert','weight convert','kg lb','celsius fahrenheit','temperature convert','height convert','cm inch','unit convert'], tab: 'convert', sub: null, label: 'Unit Converters' },
    // Reference
    { keywords: ['opioid','morphine equivalents','fentanyl','hydromorphone','equianalgesic','opioid conversion'], tab: 'reference', sub: 'sub-ref-opioid', label: 'Opioid Equianalgesic' },
    { keywords: ['edd','gestational age','lmp','due date','pregnancy','obstetric','trimester'], tab: 'reference', sub: 'sub-ref-edd', label: 'EDD / Gestational Age' },
    { keywords: ['inr','warfarin','anticoagulation','coumadin','therapeutic range','anticoag'], tab: 'reference', sub: 'sub-ref-inr', label: 'INR / Warfarin Checker' },
    // Drugs
    { keywords: ['drug','medication','reference','dose range','norepinephrine','epinephrine','dopamine','morphine','fentanyl','vancomycin','antibiotic','analgesic','vasopressor','drug card','metronidazole','ciprofloxacin','salbutamol','pantoprazole','ondansetron','haloperidol','prednisolone','amoxicillin','gabapentin','clopidogrel','metformin','furosemide','ondansetron'], tab: 'drugs', sub: null, label: 'Drug Reference' },
    // Notes
    { keywords: ['notes','shift notes','write','document','record','text','handover notes'], tab: 'notes', sub: null, label: 'Shift Notes' },
    // I&O
    { keywords: ['fluid balance','intake output','io','fluid','urine output','intake','output','iv fluids','ins and outs'], tab: 'io', sub: null, label: 'Fluid Balance / I&O Tracker' },
    // Handover
    { keywords: ['handover','sbar','patient list','shift handover','bedside handover','patient summary','handoff'], tab: 'handover', sub: null, label: 'Patient Handover Builder' },
    // Med Due
    { keywords: ['medication due','med due','next dose','drug schedule','dose time','when is next','prn tracker','medication tracker'], tab: 'meddue', sub: null, label: 'Medication Due Tracker' },
    // NEWS2
    { keywords: ['news2','news','early warning','deterioration','vital signs score','rapid response','escalation'], tab: 'news2', sub: null, label: 'NEWS2 Early Warning Score' },
    // qSOFA
    { keywords: ['qsofa','sofa','sepsis','septic shock','infection','organ dysfunction','sepsis screening'], tab: 'qsofa', sub: null, label: 'qSOFA Sepsis Screening' },
    // ECG
    { keywords: ['ecg','ekg','rhythm','cardiac rhythm','heart rhythm','atrial fibrillation','af','svt','vt','vf','heart block','bundle branch','qtc','qt interval','pr interval','st elevation','stemi'], tab: 'ecg', sub: null, label: 'ECG Rhythm Guide' },
    { keywords: ['qtc','qt corrected','torsades','qt prolongation','long qt','bazett'], tab: 'ecg', sub: 'sub-ecg-intervals', label: 'QTc Calculator' },
    // Crash Cart
    { keywords: ['crash cart','emergency drugs','resuscitation','acls','als','cardiac arrest','adrenaline dose','emergency dose','code blue','crash'], tab: 'crashcart', sub: null, label: 'Crash Cart Drug Doses' },
    // IV Compat
    { keywords: ['iv compatibility','compatible','incompatible','y-site','iv mixing','same line','drug interaction iv','infusion compatible'], tab: 'ivcompat', sub: null, label: 'IV Drug Compatibility' },
];

/* Global search */
function initGlobalSearch() {
    const input = document.getElementById('calc-global-search');
    const results = document.getElementById('calc-search-results');
    const clearBtn = document.getElementById('calc-search-clear');
    if (!input || !results) return;

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        clearBtn.style.display = q ? 'flex' : 'none';
        if (!q) { results.innerHTML = ''; results.style.display = 'none'; return; }

        const matches = CALC_SEARCH_INDEX.filter(item => {
            const haystack = [...item.keywords, item.label.toLowerCase()].join(' ');
            return q.split(' ').filter(Boolean).every(word => haystack.includes(word));
        }).slice(0, 8);

        if (!matches.length) {
            results.innerHTML = `<div class="calc-search-empty">No calculators found for "<strong>${q}</strong>"</div>`;
        } else {
            results.innerHTML = matches.map(m =>
                `<button class="calc-search-result-item" onclick="goToCalc('${m.tab}','${m.sub || ''}');document.getElementById('calc-global-search').value='';document.getElementById('calc-search-results').style.display='none';document.getElementById('calc-search-clear').style.display='none';">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
                    ${m.label}
                </button>`
            ).join('');
        }
        results.style.display = 'block';
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        results.innerHTML = '';
        results.style.display = 'none';
        clearBtn.style.display = 'none';
        input.focus();
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('#calc-search-wrap')) {
            results.style.display = 'none';
        }
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { clearBtn.click(); input.blur(); }
    });
}

function goToCalc(tabId, subId) {
    if (window.switchToTab) window.switchToTab(tabId);
    if (subId && window.showSubPanel) {
        setTimeout(() => window.showSubPanel(subId), 80);
    }
    setTimeout(() => {
        const panel = document.getElementById('panel-' + tabId);
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    if (navigator.vibrate) navigator.vibrate(8);
}

/* Drug → go to dosage calc */
window.drugGoToCalc = function(drugName) {
    goToCalc('dosage', 'sub-dosage-weight');
    showToast(`Switched to Weight-Based Dosage for ${drugName}`, 'success');
};

/* rich text notes engine */

/* execCommand wrapper — keeps toolbar button states in sync.
   NOTE: execCommand handles toggling natively (bold on → bold off).
   The old fallback only wrapped (never unwrapped), causing bold/italic to
   get permanently stuck. This clean version relies on execCommand's
   built-in toggle and never throws on a false return value. */
window.notesExecCmd = function(cmd) {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    // Restore focus so the selection is intact when the command runs.
    // onmousedown=preventDefault on toolbar buttons already prevents blur,
    // but we call focus() here as a belt-and-suspenders safety net.
    editor.focus();
    // execCommand toggles: if selection is already bold, calling 'bold' removes it.
    // Some browsers return false even on success — do NOT treat false as failure.
    document.execCommand(cmd, false, null);
    updateNotesToolbarState();
    editor.dispatchEvent(new Event('input'));
};

/* Highlight selected text with a background colour */
window.notesHighlight = function(colour) {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    editor.focus();
    try { document.execCommand('hiliteColor', false, colour); } catch(e) {
        try { document.execCommand('backColor', false, colour); } catch(e2) {}
    }
    editor.dispatchEvent(new Event('input'));
};

/* Remove highlight from selected text */
window.notesRemoveHighlight = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    editor.focus();
    document.execCommand('hiliteColor', false, 'transparent');
    document.execCommand('removeFormat', false, null);
    editor.dispatchEvent(new Event('input'));
};

/* Indent / outdent */
window.notesIndent = function(indent) {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    editor.focus();
    document.execCommand(indent ? 'indent' : 'outdent', false, null);
    editor.dispatchEvent(new Event('input'));
};

/* Insert timestamp as a styled span */
window.notesInsertTimestamp = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    editor.focus();
    const now = new Date();
    const time = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    const stamp = `<span style="font-size:0.78em;font-weight:700;color:var(--text-muted);background:var(--parchment);padding:0.1em 0.45em;border-radius:4px;letter-spacing:0.03em;">[${date} ${time}]</span>&nbsp;`;
    document.execCommand('insertHTML', false, stamp);
    editor.dispatchEvent(new Event('input'));
};

/* Insert a visual divider */
window.notesInsertDivider = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    editor.focus();
    document.execCommand('insertHTML', false, '<hr><p><br></p>');
    editor.dispatchEvent(new Event('input'));
};

/* Keep toolbar buttons visually active when cursor is inside formatted text.
   queryCommandState is the standard way to check live formatting state — it
   reflects the current selection/caret position correctly after execCommand. */
function updateNotesToolbarState() {
    const editor = document.getElementById('shift-notes');
    const cmds = ['bold', 'italic', 'underline', 'strikeThrough'];
    cmds.forEach(cmd => {
        const btn = document.getElementById(`notes-btn-${cmd}`);
        if (!btn) return;
        // queryCommandState returns true if the entire selection (or caret position)
        // is inside the relevant formatting. This drives the active/inactive toggle.
        let state = false;
        try { state = document.queryCommandState(cmd); } catch(e) {}
        btn.classList.toggle('active', state);
        // ARIA: announce pressed state for screen readers
        btn.setAttribute('aria-pressed', state ? 'true' : 'false');
    });
}

/* Toolbar init — attach selection listener.
   The old guard (activeElement === editor) failed on mobile because tapping a
   toolbar button shifts activeElement away before selectionchange fires.
   We now track "editor was focused recently" with a flag so toolbar state
   still updates right after a format button tap. */
function initNotesToolbar() {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;

    let editorWasFocused = false;

    editor.addEventListener('focus', () => { editorWasFocused = true; });
    editor.addEventListener('blur',  () => {
        setTimeout(() => { editorWasFocused = false; }, 300);
    });

    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        const inEditor = sel && sel.anchorNode && editor.contains(sel.anchorNode);
        if (editorWasFocused || inEditor || document.activeElement === editor) {
            updateNotesToolbarState();
        }
    });

    editor.addEventListener('focus', updateNotesToolbarState);
    editor.addEventListener('click', updateNotesToolbarState);
    editor.addEventListener('keyup', updateNotesToolbarState);

    // Live word/char count — fires on every content change including paste and formatting
    editor.addEventListener('input', updateNotesWordCount);

    // Re-render count label when screen rotates or resizes (compact vs full)
    window.addEventListener('resize', updateNotesWordCount, { passive: true });

    updateNotesWordCount();
}

/* Copy as plain text */
window.copyNotes = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor || !editor.innerText.trim()) { showToast('No notes to copy', 'warning'); return; }
    navigator.clipboard.writeText(editor.innerText)
        .then(() => showToast('Notes copied to clipboard', 'success'))
        .catch(() => showToast('Could not access clipboard', 'danger'));
};

/* Print */
window.printNotes = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor || !editor.innerText.trim()) { showToast('No notes to print', 'warning'); return; }
    const date = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>MedConvert Notes</title>
    <style>body{font-family:'Segoe UI',sans-serif;max-width:780px;margin:2rem auto;padding:0 1.5rem;color:#2a2018;line-height:1.85;font-size:15px;}
    h1{font-size:1rem;color:#2d5a27;border-bottom:2px solid #cfc7b4;padding-bottom:.4rem;margin-bottom:1.2rem;}
    ul,ol{padding-left:1.4rem;}hr{border:none;border-top:2px solid #cfc7b4;margin:1rem 0;}</style>
    </head><body><h1>MedConvert Shift Notes &mdash; ${date}</h1>${editor.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
};

/* Share/export calculation result */
window.shareResult = function(label, value, note) {
    const text = `${label}: ${value}${note ? '\n' + note : ''}\n— MedConvert (${new Date().toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit'})})`;
    if (navigator.share) {
        navigator.share({ title: 'MedConvert Result', text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => showToast('Result copied', 'success'));
    }
};

/* Timer persistence — fixed (no double-interval) */
function saveTimerState(secondsLeft, total, label, running) {
    try {
        localStorage.setItem('mc_timer', JSON.stringify({
            secondsLeft, total, label, running,
            savedAt: running ? Date.now() : null
        }));
    } catch {}
}

function loadTimerState() {
    try {
        const t = JSON.parse(localStorage.getItem('mc_timer') || 'null');
        if (!t || t.secondsLeft <= 0) return null;
        if (t.running && t.savedAt) {
            const elapsed = Math.floor((Date.now() - t.savedAt) / 1000);
            t.secondsLeft = Math.max(0, t.secondsLeft - elapsed);
        }
        return t;
    } catch { return null; }
}

function initTimerPersistence() {
    // Restore timer if page was refreshed mid-countdown
    const saved = loadTimerState();
    if (saved && saved.secondsLeft > 0) {
        if (saved.label) {
            const lbl = document.getElementById('timer-label-input');
            if (lbl) lbl.value = saved.label;
        }
        if (saved.running) {
            setTimeout(() => {
                if (window.startTimer) {
                    window.startTimer(saved.secondsLeft);
                    showToast('Timer restored', 'info');
                }
            }, 400);
        }
    }
    // Persistence is now handled by the central timer in the startTimer patch below
    // (no second setInterval is created here)
}




/* curb-65 */
window.calculateCURB65 = function() {
    const ids = ['curb-c','curb-u','curb-r','curb-b','curb-65'];
    const score = ids.reduce((s,id) => {
        const cb = document.getElementById(id);
        return s + (cb && cb.checked ? 1 : 0);
    }, 0);
    let status, interp, mort;
    if (score <= 1) {
        status = 'normal';
        mort = '~1.5%';
        interp = '<strong>Low Severity:</strong> Consider community treatment (outpatient). Reassess if condition changes.';
    } else if (score === 2) {
        status = 'warning';
        mort = '~9.2%';
        interp = '<strong>Moderate Severity:</strong> Short-term hospital admission or close supervised outpatient care.';
    } else {
        status = 'danger';
        mort = score >= 4 ? '~27–57%' : '~22%';
        interp = '<strong>Severe Pneumonia:</strong> Urgent hospital admission. Score ≥4 — consider ICU assessment.';
    }
    showResult('curb65-result','curb65-value',`${score} / 5`,status,null,null,'curb65-interp',`${interp} <span style="margin-left:0.5em;opacity:0.75;">30-day mortality: ${mort}</span>`);
    addToHistory('Assessment','CURB-65',`${score}/5`);
};

/* parkland formula */
window.calculateParkland = function() {
    const weight = parseFloat(document.getElementById('parkland-weight').value);
    const tbsa   = parseFloat(document.getElementById('parkland-tbsa').value);
    if (!weight || !tbsa) { showToast('Enter weight and %TBSA', 'warning'); return; }
    if (tbsa < 1 || tbsa > 100) { showToast('%TBSA must be between 1 and 100', 'warning'); return; }
    // Cap at 50% as per Parkland convention for very large burns
    const effectiveTBSA = Math.min(tbsa, 50);
    const total = 4 * weight * effectiveTBSA;
    const first8h  = total / 2;
    const next16h  = total / 2;
    const rateFirst = first8h / 8;
    const rateNext  = next16h / 16;
    const display = `${Math.round(total).toLocaleString()} mL`;
    const note = tbsa > 50 ? `%TBSA capped at 50% per convention (actual: ${tbsa}%)` : `4 mL × ${weight} kg × ${tbsa}% TBSA`;
    const schedule = `<div style="margin-top:0.5rem;font-size:var(--text-sm);line-height:1.8;">
        <strong>First 8 hrs from burn:</strong> ${Math.round(first8h).toLocaleString()} mL (${Math.round(rateFirst)} mL/hr)<br>
        <strong>Next 16 hrs:</strong> ${Math.round(next16h).toLocaleString()} mL (${Math.round(rateNext)} mL/hr)<br>
        <em>Fluid: Lactated Ringer's — titrate to UO 0.5–1 mL/kg/hr</em>
    </div>`;
    showResult('parkland-result','parkland-value',display,'neutral',note,'parkland-note','parkland-schedule',schedule);
    addToHistory('Assessment','Parkland',display);
};

/* cha2ds2-vasc */
window.calcCHADSVASc = function() {
    const chf    = document.getElementById('cvsc-chf')?.checked    ? 1 : 0;
    const htn    = document.getElementById('cvsc-htn')?.checked    ? 1 : 0;
    const age75  = document.getElementById('cvsc-age75')?.checked  ? 2 : 0;
    const dm     = document.getElementById('cvsc-dm')?.checked     ? 1 : 0;
    const stroke = document.getElementById('cvsc-stroke')?.checked ? 2 : 0;
    const vasc   = document.getElementById('cvsc-vasc')?.checked   ? 1 : 0;
    const age65  = document.getElementById('cvsc-age65')?.checked  ? 1 : 0;
    const female = document.getElementById('cvsc-female')?.checked ? 1 : 0;
    // Female sex only counts if ≥1 non-sex risk factor
    const nonSexScore = chf + htn + age75 + dm + stroke + vasc + age65;
    const score = nonSexScore + (female && nonSexScore >= 1 ? 1 : 0);
    const display = `${score} / 9`;

    // Annual stroke rate approximations (ESC guidelines)
    const rateTable = [0.0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 12.5, 15.2];
    const annualRate = rateTable[Math.min(score, 9)];

    let status, risk, interp;
    if (score === 0) {
        status = 'normal'; risk = 'Low risk';
        interp = '<strong>No anticoagulation recommended</strong> — annual stroke risk ≈0%. Reassess annually.';
    } else if (score === 1 && !female) {
        status = 'warning'; risk = 'Low–moderate risk (male)';
        interp = '<strong>Consider anticoagulation</strong> — shared decision with patient. Annual stroke risk ≈1.3%.';
    } else if (score === 1 && female) {
        status = 'normal'; risk = 'Score = 1 (female sex only)';
        interp = '<strong>No anticoagulation recommended</strong> — female sex alone does not confer risk. Reassess if new risk factors develop.';
    } else {
        status = 'danger'; risk = `High risk — anticoagulation recommended`;
        interp = `<strong>Anticoagulation recommended</strong> (unless contraindicated). Annual stroke risk ≈${annualRate}%. Preferred agents: apixaban, rivaroxaban, dabigatran (NOACs). Discuss bleeding risk (HAS-BLED).`;
    }
    showResult('chadsvasc-result','chadsvasc-score', display, status, `${risk} · Est. annual stroke risk: ${annualRate}%`, 'chadsvasc-risk', 'chadsvasc-interp', interp);
    addToHistory('Assessment','CHA₂DS₂-VASc', display);
};

/* braden scale */
window.calcBraden = function() {
    const s = parseInt(document.getElementById('braden-sensory')?.value  || 4);
    const m = parseInt(document.getElementById('braden-moisture')?.value || 4);
    const a = parseInt(document.getElementById('braden-activity')?.value || 4);
    const mo= parseInt(document.getElementById('braden-mobility')?.value || 4);
    const n = parseInt(document.getElementById('braden-nutrition')?.value|| 4);
    const f = parseInt(document.getElementById('braden-friction')?.value || 3);
    const score = s + m + a + mo + n + f;
    let status, risk, interp;
    if (score >= 19) {
        status = 'normal'; risk = 'Low risk';
        interp = 'Routine skin assessment. Continue preventive measures.';
    } else if (score >= 15) {
        status = 'normal'; risk = 'Mild risk';
        interp = 'Reposition q2h. Apply protective dressings to bony prominences. Optimise nutrition.';
    } else if (score >= 13) {
        status = 'warning'; risk = 'Moderate risk';
        interp = 'Pressure-redistributing foam overlay. Reposition q2h. Nutritional support. Moisture barrier cream PRN.';
    } else if (score >= 10) {
        status = 'danger'; risk = 'High risk';
        interp = 'Pressure-redistribution mattress. Frequent repositioning ≤q2h. Wound care review. Dietitian referral.';
    } else {
        status = 'danger'; risk = 'Very high risk';
        interp = 'Specialised air-fluidised or alternating-pressure mattress. Strict turn schedule. Wound care nurse consult. Nutritional goals per dietitian.';
    }
    showResult('braden-result','braden-score', `${score} / 23`, status, risk, 'braden-risk', 'braden-interp', `<strong>${risk}:</strong> ${interp}`);
    addToHistory('Assessment','Braden Scale', `${score}/23 — ${risk}`);
};

// Auto-calculate Braden on load so it shows the default values
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if(window.calcBraden) window.calcBraden(); if(window.calcCHADSVASc) window.calcCHADSVASc(); }, 200);
});

/* opioid equianalgesic */
// All values in oral morphine equivalents (OME mg), except fentanyl_iv in mcg
const OPIOID_TABLE = {
    morphine_oral:       { ome: 1,    unit: 'mg',  label: 'Morphine PO' },
    morphine_iv:         { ome: 3,    unit: 'mg',  label: 'Morphine IV/SC' },
    oxycodone_oral:      { ome: 1.5,  unit: 'mg',  label: 'Oxycodone PO' },
    hydromorphone_oral:  { ome: 5,    unit: 'mg',  label: 'Hydromorphone PO' },
    hydromorphone_iv:    { ome: 20,   unit: 'mg',  label: 'Hydromorphone IV' },
    fentanyl_iv:         { ome: 100,  unit: 'mcg', label: 'Fentanyl IV (mcg)' }, // 100 mcg IV ≈ 30 mg oral morphine
    codeine_oral:        { ome: 0.15, unit: 'mg',  label: 'Codeine PO' },
    tramadol_oral:       { ome: 0.1,  unit: 'mg',  label: 'Tramadol PO' },
};

window.convertOpioid = function() {
    const fromKey = document.getElementById('opioid-from').value;
    const toKey   = document.getElementById('opioid-to').value;
    const dose    = parseFloat(document.getElementById('opioid-dose').value);
    if (!dose || dose <= 0) { showToast('Enter a valid dose', 'warning'); return; }
    const from = OPIOID_TABLE[fromKey], to = OPIOID_TABLE[toKey];
    if (!from || !to) return;
    // Convert to OME first then to target
    const omeTotal = dose * from.ome;
    const converted = omeTotal / to.ome;
    const display = `${converted.toFixed(2)} ${to.unit}`;
    const note = `${dose} ${from.unit} ${from.label} ≈ ${converted.toFixed(2)} ${to.unit} ${to.label}  (≈ ${Math.round(omeTotal)} mg OME)`;
    showResult('opioid-result','opioid-value',display,'neutral',note,'opioid-note');
    addToHistory('Reference','Opioid Equiv.',display);
};

/* edd / gestational age */
window.showEDDMode = function(btn, mode) {
    document.querySelectorAll('#sub-ref-edd .sub-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('edd-lmp-mode').style.display = mode === 'lmp' ? '' : 'none';
    document.getElementById('edd-us-mode').style.display  = mode === 'us'  ? '' : 'none';
};

window.calculateEDD = function() {
    const lmpVal = document.getElementById('edd-lmp-date').value;
    if (!lmpVal) { showToast('Please select LMP date', 'warning'); return; }
    const lmp = new Date(lmpVal);
    const edd = new Date(lmp.getTime() + 280 * 86400000);
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.floor((today - lmp) / 86400000);
    const gaWeeks = Math.floor(diffDays / 7);
    const gaDays  = diffDays % 7;
    const daysToEDD = Math.round((edd - today) / 86400000);
    const eddStr = edd.toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    let trimester = gaWeeks < 13 ? 'First Trimester' : gaWeeks < 27 ? 'Second Trimester' : 'Third Trimester';
    let status = gaWeeks > 40 ? 'warning' : 'normal';
    const gaStr = diffDays >= 0 ? `${gaWeeks} weeks ${gaDays} days (${trimester})` : 'Upcoming — not yet at LMP';
    const daysStr = daysToEDD > 0 ? `${daysToEDD} days until EDD` : daysToEDD === 0 ? 'EDD is today!' : `${Math.abs(daysToEDD)} days past EDD`;
    showResult('edd-result','edd-value',eddStr,status,gaStr,'edd-ga','edd-trimester',`<strong>${daysStr}</strong>`);
    addToHistory('Reference','EDD',eddStr);
};

window.calculateEDDfromUS = function() {
    const usDate  = document.getElementById('edd-us-date').value;
    const usWeeks = parseInt(document.getElementById('edd-us-weeks').value) || 0;
    const usDays  = parseInt(document.getElementById('edd-us-days').value) || 0;
    if (!usDate || !usWeeks) { showToast('Enter ultrasound date and weeks GA', 'warning'); return; }
    const us = new Date(usDate);
    const gaAtUSDays = usWeeks * 7 + usDays;
    const lmpEquiv = new Date(us.getTime() - gaAtUSDays * 86400000);
    const edd = new Date(lmpEquiv.getTime() + 280 * 86400000);
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.floor((today - lmpEquiv) / 86400000);
    const gaWeeks = Math.floor(diffDays / 7);
    const gaDays  = diffDays % 7;
    const daysToEDD = Math.round((edd - today) / 86400000);
    const eddStr = edd.toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    let trimester = gaWeeks < 13 ? 'First Trimester' : gaWeeks < 27 ? 'Second Trimester' : 'Third Trimester';
    const gaStr = `${gaWeeks} weeks ${gaDays} days today (${trimester})`;
    const daysStr = daysToEDD > 0 ? `${daysToEDD} days until EDD` : `${Math.abs(daysToEDD)} days past EDD`;
    showResult('edd-result','edd-value',eddStr,'normal',gaStr,'edd-ga','edd-trimester',`<strong>${daysStr}</strong>`);
    addToHistory('Reference','EDD (US)',eddStr);
};

/* inr / warfarin */
const INR_TARGETS = {
    afib:            { min: 2.0, max: 3.0, label: 'Atrial Fibrillation' },
    dvt_pe:          { min: 2.0, max: 3.0, label: 'DVT / PE Treatment' },
    dvt_prevention:  { min: 1.5, max: 2.0, label: 'DVT Prevention' },
    mvr_tissue:      { min: 2.0, max: 3.0, label: 'Mechanical Valve (low-risk)' },
    mvr_mech:        { min: 2.5, max: 3.5, label: 'Mechanical Valve (mitral/high-risk)' },
    antiphospholipid:{ min: 2.5, max: 3.5, label: 'Antiphospholipid Syndrome' },
    none:            { min: 0.8, max: 1.2, label: 'Normal (no anticoagulation)' },
};

window.checkINR = function() {
    const inr   = parseFloat(document.getElementById('inr-value').value);
    const key   = document.getElementById('inr-indication').value;
    if (!inr || inr <= 0) { showToast('Enter a valid INR value', 'warning'); return; }
    const target = INR_TARGETS[key];
    const display = inr.toFixed(1);
    let status, note;
    if (inr < target.min - 0.2) {
        status = 'warning';
        note   = `Below therapeutic range (${target.min}–${target.max}) for ${target.label}. Consider dose increase after clinical review.`;
    } else if (inr < target.min) {
        status = 'warning';
        note   = `Slightly below target range (${target.min}–${target.max}) for ${target.label}. Monitor closely.`;
    } else if (inr <= target.max) {
        status = 'normal';
        note   = `Within therapeutic range (${target.min}–${target.max}) for ${target.label}.`;
    } else if (inr <= target.max + 0.5) {
        status = 'warning';
        note   = `Slightly above target (${target.min}–${target.max}) for ${target.label}. Consider dose reduction.`;
    } else if (inr < 4.5) {
        status = 'danger';
        note   = `Supratherapeutic INR. Hold warfarin and reassess. Risk of bleeding.`;
    } else {
        status = 'danger';
        note   = `⚠️ Critically elevated INR (≥4.5). Hold warfarin; consider Vitamin K or reversal. Urgent assessment needed.`;
    }
    showResult('inr-result','inr-result-value',display,status,note,'inr-note');
    addToHistory('Reference','INR Check',`${display} — ${status}`);
};


/* Init pack 3 */
document.addEventListener('DOMContentLoaded', () => {
    initGlobalSearch();
    initNotesToolbar();
    initTimerPersistence();
});



/* more sheet theme toggle */
window.moreSheetToggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('medconvert_theme', next);
    updateMoreSheetThemeBtn(next);
    showToast(next === 'dark' ? 'Dark mode on' : 'Light mode on', 'info');
};

function updateMoreSheetThemeBtn(theme) {
    const icon = document.getElementById('more-theme-icon');
    const label = document.getElementById('more-theme-label');
    if (!icon || !label) return;
    if (theme === 'dark') {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
        label.textContent = 'Light Mode';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        label.textContent = 'Dark Mode';
    }
}

/* mobile nav sync */
/* more sheet tabs */
// Tabs that live inside the More sheet (not in bottom nav)
const MORE_TABS = ['vitals','assessment','pediatric','lab','drugs','convert','reference','io','handover','meddue','news2','qsofa','ecg','crashcart','ivcompat'];

function updateMobileNav(tabId) {
    const isMoreTab = MORE_TABS.includes(tabId);

    // Core 4 buttons
    document.querySelectorAll('.mobile-quick-tab-btn:not(.mobile-more-btn)').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabId);
    });

    // More button glows amber when a "more" section is active
    const moreBtn = document.getElementById('more-tab-btn');
    if (moreBtn) moreBtn.classList.toggle('active', isMoreTab);

    // Highlight the active tile inside the sheet
    document.querySelectorAll('.more-sheet-item').forEach(b => {
        b.classList.toggle('active-tool', b.dataset.tab === tabId);
    });
}

/* Open More sheet */
window.openMoreSheet = function() {
    const overlay = document.getElementById('more-sheet-overlay');
    const sheet   = document.getElementById('more-sheet');
    if (!overlay || !sheet) return;
    // Clear any leftover inline display from a previous close
    overlay.style.display = '';
    sheet.style.display   = '';
    // Force display via class — CSS handles it, no inline style needed
    overlay.classList.add('visible');
    sheet.classList.add('visible');
    // Two-frame delay so the browser paints display:block before
    // adding 'open', which triggers the CSS transition
    requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.add('open');
        sheet.classList.add('open');
    }));
    document.body.style.overflow = 'hidden';
    sheet.setAttribute('aria-hidden', 'false');
    sheet.removeAttribute('inert');
    attachSheetSwipe(sheet);
    // Hide glove FAB so it doesn't overlap sheet tiles
    const fab = document.getElementById('glove-fab');
    if (fab) fab.style.visibility = 'hidden';
    // Update theme button state whenever sheet opens
    updateMoreSheetThemeBtn(document.documentElement.getAttribute('data-theme') || 'light');
};

/* Close More sheet — wait for transition to finish, then hide */
window.closeMoreSheet = function() {
    const overlay = document.getElementById('more-sheet-overlay');
    const sheet   = document.getElementById('more-sheet');
    if (!overlay || !sheet) return;
    overlay.classList.remove('open');
    sheet.classList.remove('open');
    document.body.style.overflow = '';
    // Move focus out before hiding so aria-hidden doesn't trap a focused element
    if (sheet.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    sheet.setAttribute('aria-hidden', 'true');
    sheet.setAttribute('inert', '');
    // Restore glove FAB
    const fab = document.getElementById('glove-fab');
    if (fab) fab.style.visibility = '';
    // After the transition ends, remove .visible so display:block is cleared
    // and the elements go back to display:none — freeing up pointer events
    const TRANSITION_MS = 420; // matches --t-spring ~500ms, give a little buffer
    setTimeout(() => {
        overlay.classList.remove('visible');
        sheet.classList.remove('visible');
    }, TRANSITION_MS);
};

/* Switch tab from inside the sheet */
window.sheetSwitchTab = function(tabId) {
    closeMoreSheet();
    if (window.switchToTab) window.switchToTab(tabId);
};

/* Swipe-down gesture to dismiss sheet */
function attachSheetSwipe(sheet) {
    let startY = 0, isDragging = false;
    function onStart(e) {
        startY = (e.touches ? e.touches[0].clientY : e.clientY);
        isDragging = true;
    }
    function onMove(e) {
        if (!isDragging) return;
        const dy = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
        if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
    }
    function onEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        const dy = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - startY;
        sheet.style.transform = '';
        if (dy > 80) closeMoreSheet();
    }
    // Remove old listeners before adding new ones
    sheet.removeEventListener('touchstart', sheet._swipeStart);
    sheet._swipeStart = onStart;
    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove',  onMove,  { passive: true });
    sheet.addEventListener('touchend',   onEnd,   { passive: true });
}

// Patch switchToTab to keep mobile nav in sync
(function() {
    const _orig = window.switchToTab;
    window.switchToTab = function(tabId) {
        _orig.apply(this, arguments);
        updateMobileNav(tabId);
        // Scroll to top of main on mobile tab switch
        if (window.innerWidth <= 640) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
})();

/* notes auto-save indicator */
(function() {
    let _saveTimer;
    const _origLoadNotes = window.loadNotes || function(){};

    function showSaveIndicator(state) {
        const el = document.getElementById('notes-save-indicator');
        if (!el) return;
        el.classList.remove('saving', 'saved');
        if (state === 'saving') {
            el.classList.add('saving');
            el.querySelector('svg').innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
            el.childNodes[el.childNodes.length-1].textContent = ' Saving…';
        } else if (state === 'saved') {
            el.classList.add('saved');
            el.querySelector('svg').innerHTML = '<polyline points="20 6 9 17 4 12"/>';
            el.childNodes[el.childNodes.length-1].textContent = ' Saved';
            setTimeout(() => el.classList.remove('saved'), 2500);
        }
    }

    // Patch notes loading to hook into auto-save
    const origLoadNotes = window.loadNotes;
    if (origLoadNotes) {
        window.loadNotes = function() {
            origLoadNotes.apply(this, arguments);
            const editor = document.getElementById('shift-notes');
            if (!editor) return;
            // Enhanced auto-save with indicator
            editor.addEventListener('input', function() {
                showSaveIndicator('saving');
                clearTimeout(_saveTimer);
                _saveTimer = setTimeout(() => {
                    try { localStorage.setItem('medconvert_notes_html', editor.innerHTML); } catch {}
                    showSaveIndicator('saved');
                    updateNotesWordCount();
                }, 800);
            });
        };
    }
})();

/* keyboard shortcuts */
(function() {
    const TAB_KEYS = {
        '1': 'timer', '2': 'dosage', '3': 'iv', '4': 'vitals',
        '5': 'assessment', '6': 'pediatric', '7': 'lab',
        '8': 'convert', '9': 'reference', '0': 'drugs',
    };

    document.addEventListener('keydown', function(e) {
        // Alt+number = switch tab
        if (e.altKey && !e.ctrlKey && !e.metaKey && TAB_KEYS[e.key]) {
            const focused = document.activeElement;
            if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || focused.isContentEditable)) return;
            e.preventDefault();
            const tabId = TAB_KEYS[e.key];
            if (window.switchToTab) window.switchToTab(tabId);
            showToast(`Switched to ${tabId.charAt(0).toUpperCase()+tabId.slice(1)}`, 'info');
        }
        // Alt+/ = focus search
        if (e.altKey && e.key === '/') {
            e.preventDefault();
            const search = document.getElementById('calc-global-search');
            if (search) { search.focus(); search.select(); }
        }
        // Alt+D = toggle dark mode
        if (e.altKey && e.key === 'd') {
            e.preventDefault();
            const btn = document.getElementById('theme-toggle');
            if (btn) btn.click();
        }
    });
})();

/* Drug favorites — defined earlier, duplicate removed */

/* Sort favorites to top in renderAllDrugs */
(function(){
    const _orig = window.renderAllDrugs;
    if (!_orig) return;
    window.renderAllDrugs = function() {
        const el = document.getElementById('drug-results');
        if (!el || !window.DRUG_DB) return;
        const favs = getDrugFavorites();
        const sorted = [
            ...DRUG_DB.filter(d => favs.includes(d.name)),
            ...DRUG_DB.filter(d => !favs.includes(d.name))
        ];
        const count = document.getElementById('drug-count');
        if (count) count.textContent = `${DRUG_DB.length} drugs`;
        el.innerHTML = sorted.map(d => buildDrugCard(d)).join('');
    };
})();

/* notesExecCmd defined earlier — duplicate removed */

/* service worker: fetch timeout */
// Add SW registration with better error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('medconvert-sw.js')
            .then(reg => {
                console.info('[MedConvert] SW registered:', reg.scope);
                // Check for updates
                reg.addEventListener('updatefound', () => {
                    const newSW = reg.installing;
                    if (newSW) {
                        newSW.addEventListener('statechange', () => {
                            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                                showToast('App updated — reload to apply', 'info');
                            }
                        });
                    }
                });
            })
            .catch(err => console.warn('[MedConvert] SW registration failed:', err));
    });
}

/* manifest: add id field dynamically */
// manifest.json can't be edited at runtime, but we log the missing field
// (The fix should be applied to manifest.json directly — see updated file)

/* init: run all improvements */
document.addEventListener('DOMContentLoaded', function() {
    // Mobile nav initial state
    updateMobileNav('timer');
    
    // Set search placeholder: shortcut hint on desktop, clean text on mobile
    const searchInput = document.getElementById('calc-global-search');
    if (searchInput) {
        const isMobile = window.matchMedia('(max-width: 640px)').matches;
        searchInput.placeholder = isMobile
            ? 'Search calculators or notes…'
            : 'Search calculators… (Alt+/ to focus, Alt+1–9 for tabs)';
    }

    // Initialize EDD date to today's date
    const eddDateInput = document.getElementById('edd-lmp-date');
    if (eddDateInput && !eddDateInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth()+1).padStart(2,'0');
        const dd = String(today.getDate()).padStart(2,'0');
        eddDateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    const eddUSDateInput = document.getElementById('edd-us-date');
    if (eddUSDateInput && !eddUSDateInput.value) {
        const today = new Date();
        eddUSDateInput.value = today.toISOString().split('T')[0];
    }
});



/* drug favorites filter */
let _showFavsOnly = false;

window.toggleFavFilter = function(btn) {
    _showFavsOnly = !_showFavsOnly;
    btn.classList.toggle('btn-primary', _showFavsOnly);
    btn.classList.toggle('btn-secondary', !_showFavsOnly);
    btn.querySelector('svg').setAttribute('fill', _showFavsOnly ? 'currentColor' : 'none');
    if (_showFavsOnly) {
        const favs = getDrugFavorites();
        if (favs.length === 0) { showToast('No favorites yet — tap ★ on any drug', 'warning'); _showFavsOnly = false; btn.classList.remove('btn-primary'); btn.classList.add('btn-secondary'); return; }
        const el = document.getElementById('drug-results');
        const count = document.getElementById('drug-count');
        const sorted = DRUG_DB.filter(d => favs.includes(d.name));
        if (count) count.textContent = `${sorted.length} favorite${sorted.length!==1?'s':''}`;
        el.innerHTML = sorted.map(d => buildDrugCard(d)).join('');
        showToast(`Showing ${sorted.length} favorite${sorted.length!==1?'s':''}`, 'info');
    } else {
        if (window.renderAllDrugs) window.renderAllDrugs();
        showToast('Showing all drugs', 'info');
    }
};


/* glove scratchpad */
let gloveExpiryTimer = null;
let gloveExpiryEnd = null;
let gloveExpiryTotal = null;
let gloveExpiryInterval = null;

function toggleGlove() {
    const panel = document.getElementById('glove-panel');
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    if (!isOpen) {
        // Focus first input
        const first = panel.querySelector('.glove-input');
        if (first) setTimeout(() => first.focus(), 200);
        // Load saved state
        gloveLoadState();
    }
}

function gloveLoadState() {
    try {
        const saved = JSON.parse(localStorage.getItem('mc_glove') || 'null');
        if (!saved) return;
        // Check if expired
        if (saved.expiry && Date.now() > saved.expiry) {
            localStorage.removeItem('mc_glove');
            gloveClearFields();
            return;
        }
        if (saved.bp)    document.getElementById('g-bp').value    = saved.bp;
        if (saved.hr)    document.getElementById('g-hr').value    = saved.hr;
        if (saved.spo2)  document.getElementById('g-spo2').value  = saved.spo2;
        if (saved.temp)  document.getElementById('g-temp').value  = saved.temp;
        if (saved.rr)    document.getElementById('g-rr').value    = saved.rr;
        if (saved.pain)  document.getElementById('g-pain').value  = saved.pain;
        if (saved.notes) document.getElementById('g-notes').value = saved.notes;
        if (saved.expiry) gloveStartExpiryDisplay(saved.expiry - Date.now());
        gloveUpdateDot();
    } catch {}
}

function gloveSaveState() {
    const state = {
        bp:    document.getElementById('g-bp')?.value,
        hr:    document.getElementById('g-hr')?.value,
        spo2:  document.getElementById('g-spo2')?.value,
        temp:  document.getElementById('g-temp')?.value,
        rr:    document.getElementById('g-rr')?.value,
        pain:  document.getElementById('g-pain')?.value,
        notes: document.getElementById('g-notes')?.value,
        expiry: gloveExpiryEnd || null,
    };
    const hasContent = Object.values(state).some(v => v && v !== null);
    try { if (hasContent) localStorage.setItem('mc_glove', JSON.stringify(state)); }
    catch {}
    gloveUpdateDot();
}

function gloveUpdateDot() {
    const dot = document.getElementById('glove-dot');
    if (!dot) return;
    const hasAny = ['g-bp','g-hr','g-spo2','g-temp','g-rr','g-pain','g-notes'].some(id => {
        const el = document.getElementById(id);
        return el && el.value.trim();
    });
    dot.classList.toggle('visible', hasAny);
}

function gloveClearFields() {
    ['g-bp','g-hr','g-spo2','g-temp','g-rr','g-pain','g-notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function gloveClear() {
    gloveClearFields();
    localStorage.removeItem('mc_glove');
    clearTimeout(gloveExpiryTimer);
    clearInterval(gloveExpiryInterval);
    gloveExpiryEnd = null;
    const fill = document.getElementById('glove-timer-fill');
    if (fill) { fill.style.width = '100%'; fill.classList.remove('ending'); }
    const expiryText = document.getElementById('glove-expiry-text');
    if (expiryText) expiryText.textContent = 'No auto-clear set';
    const expiryEl = document.getElementById('glove-expiry');
    if (expiryEl) expiryEl.classList.remove('expiring');
    gloveUpdateDot();
    showToast('Scratchpad cleared', 'info');
}

function gloveSetExpiry(minutes) {
    clearTimeout(gloveExpiryTimer);
    clearInterval(gloveExpiryInterval);
    const ms = minutes * 60 * 1000;
    gloveExpiryEnd = Date.now() + ms;
    gloveExpiryTotal = ms;
    gloveStartExpiryDisplay(ms);
    gloveExpiryTimer = setTimeout(() => {
        gloveClear();
        showToast('Scratchpad auto-cleared', 'info');
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    }, ms);
    gloveSaveState();
    showToast(`Scratchpad clears in ${minutes} min`, 'success');
}

function gloveStartExpiryDisplay(remainingMs) {
    clearInterval(gloveExpiryInterval);
    const fill = document.getElementById('glove-timer-fill');
    const expiryText = document.getElementById('glove-expiry-text');
    const expiryEl = document.getElementById('glove-expiry');
    if (!fill || !expiryText) return;

    function update() {
        const remaining = gloveExpiryEnd - Date.now();
        if (remaining <= 0) {
            fill.style.width = '0%';
            clearInterval(gloveExpiryInterval);
            return;
        }
        const pct = (remaining / (gloveExpiryTotal || remainingMs)) * 100;
        fill.style.width = pct + '%';
        fill.classList.toggle('ending', remaining < 60000);
        expiryEl && expiryEl.classList.toggle('expiring', remaining < 60000);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        expiryText.textContent = `Clears in ${mins > 0 ? mins + 'm ' : ''}${secs}s`;
    }
    update();
    gloveExpiryInterval = setInterval(update, 1000);
}

function gloveSendToNotes() {
    const bp    = document.getElementById('g-bp')?.value.trim();
    const hr    = document.getElementById('g-hr')?.value.trim();
    const spo2  = document.getElementById('g-spo2')?.value.trim();
    const temp  = document.getElementById('g-temp')?.value.trim();
    const rr    = document.getElementById('g-rr')?.value.trim();
    const pain  = document.getElementById('g-pain')?.value.trim();
    const notes = document.getElementById('g-notes')?.value.trim();

    const now = new Date().toLocaleTimeString('en-PH', {hour:'2-digit',minute:'2-digit',hour12:true});
    const lines = [`[${now}] Quick Vitals:`];
    if (bp)    lines.push(`  BP: ${bp} mmHg`);
    if (hr)    lines.push(`  HR: ${hr} bpm`);
    if (spo2)  lines.push(`  SpO₂: ${spo2}%`);
    if (temp)  lines.push(`  Temp: ${temp}°C`);
    if (rr)    lines.push(`  RR: ${rr}/min`);
    if (pain !== '' && pain !== undefined) lines.push(`  Pain: ${pain}/10`);
    if (notes) lines.push(`  Note: ${notes}`);

    if (lines.length === 1) { showToast('Nothing to send', 'warning'); return; }

    const editor = document.getElementById('shift-notes');
    if (!editor) { showToast('Open the Notes tab first', 'warning'); return; }

    const html = `<p style="font-family:monospace;font-size:0.88em;background:var(--parchment);padding:0.5em 0.75em;border-radius:6px;border-left:3px solid var(--sage);margin:0.5em 0;">${lines.join('<br>')}</p>`;
    editor.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('insertHTML', false, html);
    editor.dispatchEvent(new Event('input'));

    // Switch to notes tab
    if (window.switchToTab) window.switchToTab('notes');
    showToast('Vitals sent to Notes', 'success');
    if (navigator.vibrate) navigator.vibrate([10, 10, 30]);
    toggleGlove();
}

// Init: attach input listeners for auto-save
document.addEventListener('DOMContentLoaded', function() {
    ['g-bp','g-hr','g-spo2','g-temp','g-rr','g-pain','g-notes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', gloveSaveState);
    });
    // Load any existing state
    gloveLoadState();
    // Close panel on outside click
    document.addEventListener('click', function(e) {
        const panel = document.getElementById('glove-panel');
        const fab = document.getElementById('glove-fab');
        if (panel && panel.classList.contains('open') && !panel.contains(e.target) && !fab.contains(e.target)) {
            panel.classList.remove('open');
        }
    });
});

/* screen wake lock */
let wakeLock = null;

async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch (err) {
        // Permission denied or not available — silently ignore
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
    }
}

// Re-acquire on page visibility change (required by spec)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && wakeLock === null && timerTotal > 0) {
        await requestWakeLock();
    }
});

/* timer sound */
let timerSoundEnabled = true;
let timerAudioCtx = null;

function getAudioCtx() {
    if (!timerAudioCtx) {
        try { timerAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch { return null; }
    }
    return timerAudioCtx;
}

function playTimerChime() {
    if (!timerSoundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    // Three ascending tones — gentle, professional
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.6);
    });
}

function playTickSound() {
    if (!timerSoundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
}

function toggleTimerSound() {
    timerSoundEnabled = !timerSoundEnabled;
    const icon = document.getElementById('timer-sound-icon');
    const btn = document.getElementById('timer-sound-btn');
    if (!icon) return;
    if (timerSoundEnabled) {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
        btn && btn.classList.remove('btn-primary');
        showToast('Sound on', 'success');
        playTickSound(); // preview
    } else {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
        showToast('Sound off', 'info');
    }
}

/* timer preset active state */
let activePresetSeconds = null;

(function() {
    const _orig = window.startTimer;
    if (!_orig) return;
    window.startTimer = function(seconds) {
        // Mark active preset button
        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        const presetBtns = document.querySelectorAll('.timer-btn');
        presetBtns.forEach(b => {
            const onclick = b.getAttribute('onclick') || '';
            const match = onclick.match(/startTimer\((\d+)\)/);
            if (match && parseInt(match[1]) === seconds) b.classList.add('active');
        });
        activePresetSeconds = seconds;
        // Wake lock
        requestWakeLock();
        // Ring running glow
        const wrap = document.querySelector('.timer-ring-wrap');
        if (wrap) { wrap.classList.remove('complete'); wrap.classList.add('running'); }
        _orig.apply(this, arguments);
    };
})();

(function() {
    const _orig = window.resetTimer;
    if (!_orig) return;
    window.resetTimer = function() {
        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        activePresetSeconds = null;
        releaseWakeLock();
        const wrap = document.querySelector('.timer-ring-wrap');
        if (wrap) { wrap.classList.remove('complete', 'running'); }
        _orig.apply(this, arguments);
    };
})();

/* Hook into timer complete for chime + pulse */
(function() {
    const _origUpdateRing = window.updateTimerRing;
    window.updateTimerRing = function(secondsLeft) {
        if (_origUpdateRing) _origUpdateRing(secondsLeft);
        if (secondsLeft === 0) {
            // Timer finished
            playTimerChime();
            releaseWakeLock();
            const wrap = document.querySelector('.timer-ring-wrap');
            if (wrap) { wrap.classList.remove('running'); wrap.classList.add('complete'); }
            document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        } else if (secondsLeft <= 3 && secondsLeft > 0) {
            // Last 3 seconds — tick on each
            playTickSound();
        }
    };
})();

/* dose safety guardrails */
// Safety thresholds for common single doses
const DOSE_SAFETY = {
    // mg/kg limits [cautionMin, cautionMax, dangerMax]
    acetaminophen: { maxMgKg: 15, maxMgDose: 1000, maxMgDay: 4000, unit: 'mg' },
    ibuprofen:     { maxMgKg: 10, maxMgDose: 800,  maxMgDay: 3200, unit: 'mg' },
    morphine:      { maxMgKg: 0.1, maxMgDose: 10,  unit: 'mg' },
    vancomycin:    { maxMgKg: 25, maxMgDose: 3000, unit: 'mg' },
};

function showDoseWarning(elementId, textId, message, level) {
    const el = document.getElementById(elementId);
    const text = document.getElementById(textId);
    if (!el || !text) return;
    if (!message) { el.classList.remove('show','warn-amber','warn-red'); return; }
    text.textContent = message;
    el.classList.remove('warn-amber','warn-red');
    el.classList.add('show', level === 'danger' ? 'warn-red' : 'warn-amber');
}

// Patch calculateDosage to check for unusually large volumes
(function() {
    const _orig = window.calculateDosage;
    if (!_orig) return;
    window.calculateDosage = function() {
        _orig.apply(this, arguments);
        const Q = parseFloat(document.getElementById('dose-volume').value);
        const D = parseFloat(document.getElementById('dose-desired').value);
        const H = parseFloat(document.getElementById('dose-stock').value);
        // Always clear first so stale warnings don't linger
        if (!D || !H || !Q) {
            showDoseWarning('dosage-warning', 'dosage-warning-text', null);
            return;
        }
        const result = (D / H) * Q;
        let warning = null, level = 'warning';
        if (result > 50) { warning = `⚠️ ${result.toFixed(1)} mL is a very high volume. Double-check desired dose, stock concentration, and volume.`; level = 'danger'; }
        else if (result > 20) { warning = `Calculated volume is ${result.toFixed(1)} mL — unusually large for a single dose. Verify your values.`; level = 'warning'; }
        if (!warning && D / H > 5) { warning = `Dose requested is ${(D/H).toFixed(1)}× the stock concentration — verify this is intentional.`; level = 'warning'; }
        showDoseWarning('dosage-warning', 'dosage-warning-text', warning, level);
        // Haptic on danger
        if (level === 'danger' && warning && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    };
})();

// Patch calculateWeightDose to flag extreme mg/kg doses
(function() {
    const _orig = window.calculateWeightDose;
    if (!_orig) return;
    window.calculateWeightDose = function() {
        _orig.apply(this, arguments);
        const d = parseFloat(document.getElementById('weight-dose-per-kg').value);
        const w = parseFloat(document.getElementById('weight-dose-kg').value);
        // Always clear first
        if (!d || !w) {
            showDoseWarning('weight-dose-warning', 'weight-dose-warning-text', null);
            return;
        }
        let warning = null, level = 'warning';
        if (w * d > 5000) { warning = `Total dose exceeds 5,000 mg — verify patient weight and dose per kg before administration.`; level = 'danger'; }
        else if (d > 100) { warning = `⚠️ ${d} mg/kg is extremely high. Most medications are dosed at 1–30 mg/kg. Please double-check.`; level = 'danger'; }
        else if (d > 50)  { warning = `${d} mg/kg is high — verify this dose is correct for the chosen medication.`; level = 'warning'; }
        else if (w < 1)   { warning = `Weight under 1 kg — confirm this is a premature neonate and doses are appropriate.`; level = 'warning'; }
        showDoseWarning('weight-dose-warning', 'weight-dose-warning-text', warning, level);
        if (level === 'danger' && warning && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    };
})();


/* sticky nav scroll shadow */
(function() {
    const stickyArea = document.getElementById('sticky-nav-area');
    if (!stickyArea) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                stickyArea.classList.toggle('scrolled', window.scrollY > 60);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

/* live greeting refresh */
// Refresh greeting every 5 minutes so it changes at shift transitions
(function() {
    // Initial call is done in DOMContentLoaded via setGreeting()
    setInterval(() => {
        if (typeof setGreeting === 'function') setGreeting();
    }, 5 * 60 * 1000);
})();

/* clock format hint css */
// Add a subtle tooltip-style indicator on the clock
// Wrapped in load event to guarantee toggleClockFormat is defined first
window.addEventListener('load', function() {
    const widget = document.getElementById('clock-widget');
    if (!widget) return;
    // Add title attribute dynamically based on current format
    function updateTitle() {
        const is24 = localStorage.getItem('mc_24h') === '1';
        widget.title = is24 ? 'Military time (24h) — tap to switch to 12h' : 'Tap to switch to military time (24h)';
        widget.setAttribute('aria-label', is24 ? 'Current time in 24-hour format — click to toggle' : 'Current time — click for 24-hour format');
    }
    updateTitle();
    // Refresh title after each toggle
    const _origToggle = window.toggleClockFormat;
    if (_origToggle) {
        window.toggleClockFormat = function() {
            _origToggle.apply(this, arguments);
            updateTitle();
        };
    }
});


/* feature: multi-patient slots (3 slots) */
let _activePatientSlot = 0;

function getSlotKey(slot) { return `mc_patient_slot_${slot}`; }

function getPatientSlot(slot) {
    // Slot 0 uses the original mc_patient key for backward compat
    const key = slot === 0 ? 'mc_patient' : getSlotKey(slot);
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

function savePatientSlot(slot, data) {
    const key = slot === 0 ? 'mc_patient' : getSlotKey(slot);
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function renderSlotButtons() {
    for (let i = 0; i < 3; i++) {
        const btn = document.getElementById(`slot-btn-${i}`);
        if (!btn) continue;
        const data = getPatientSlot(i);
        const hasData = data && (data.weight || data.age || data.room);
        btn.classList.toggle('active', i === _activePatientSlot);
        btn.classList.toggle('has-data', !!hasData);
        const label = hasData ? (data.room || `Pt ${i+1}`) : `Pt ${i+1}`;
        btn.textContent = label;
        btn.title = hasData ? `${data.room ? data.room + ' · ' : ''}${data.weight ? data.weight + ' kg · ' : ''}${data.age ? data.age + ' yr' : ''}`.trim() : `Empty slot ${i+1} — click to use`;
    }
}

window.switchPatientSlot = function(slot) {
    if (slot === _activePatientSlot) {
        // Same slot — open modal to edit
        openPatientModal();
        return;
    }
    _activePatientSlot = slot;
    renderSlotButtons();
    const p = getPatientSlot(slot);
    renderPatientBanner();
    if (p) {
        applyPatientAutofill(p);
        showToast(`Switched to Pt ${slot + 1}${p.room ? ' — ' + p.room : ''}`, 'success');
    } else {
        showToast(`Slot ${slot + 1} is empty — add a patient`, 'info');
    }
    if (navigator.vibrate) navigator.vibrate(8);
};

// Override getPatientProfile to use active slot
window.getPatientProfile = function() {
    return getPatientSlot(_activePatientSlot);
};

// Override savePatientProfileData to use active slot
const _origSavePtData = window.savePatientProfileData || function(p) {
    try { localStorage.setItem('mc_patient', JSON.stringify(p)); } catch {}
};
window.savePatientProfileData = function(p) {
    savePatientSlot(_activePatientSlot, p);
    renderSlotButtons();
};

// Init slots on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        _activePatientSlot = parseInt(localStorage.getItem('mc_active_slot') || '0');
    } catch { _activePatientSlot = 0; }
    renderSlotButtons();
});

// Persist active slot on switch
const _origSwitchSlot = window.switchPatientSlot;
window.switchPatientSlot = function(slot) {
    try { localStorage.setItem('mc_active_slot', slot.toString()); } catch {}
    _origSwitchSlot(slot);
};
function savePatientProfileData(p) {
    try { localStorage.setItem('mc_patient', JSON.stringify(p)); } catch {}
}

function renderPatientBanner() {
    const p = getPatientProfile();
    const valEl = document.getElementById('patient-banner-values');
    if (!valEl) return;
    if (!p || (!p.weight && !p.age && !p.room && !p.allergies)) {
        valEl.innerHTML = '<span class="patient-banner-empty">Tap to add patient — auto-fills weight, age &amp; eGFR</span>';
        return;
    }
    const chips = [];
    if (p.room)      chips.push(`<span class="patient-banner-chip">${p.room} <span>bed</span></span>`);
    if (p.weight)    chips.push(`<span class="patient-banner-chip">${p.weight} kg <span>weight</span></span>`);
    if (p.age)       chips.push(`<span class="patient-banner-chip">${p.age} yr <span>${p.sex||'M'}</span></span>`);
    if (p.height)    chips.push(`<span class="patient-banner-chip">${p.height} cm <span>height</span></span>`);
    if (p.egfr)      chips.push(`<span class="patient-banner-chip">${Math.round(p.egfr)} <span>eGFR</span></span>`);
    if (p.creatinine)chips.push(`<span class="patient-banner-chip">${p.creatinine} <span>SCr</span></span>`);
    if (p.diagnosis) chips.push(`<span class="patient-banner-chip" style="background:var(--warning-bg);color:var(--warning);border-color:var(--warning);">${p.diagnosis}</span>`);
    if (p.allergies) chips.push(`<span class="patient-banner-chip" style="background:var(--danger-bg);color:var(--danger);border-color:var(--danger);" title="Allergies: ${p.allergies}">⚠ ${p.allergies.substring(0,22)}${p.allergies.length>22?'…':''}</span>`);
    valEl.innerHTML = chips.join('');
}

function calcEGFRFromCr(age, sex, cr) {
    if (!age || !cr || cr <= 0) return null;
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const sf = sex === 'female' ? 1.012 : 1.0;
    return Math.round(142 * Math.pow(Math.min(cr/kappa,1),alpha) * Math.pow(Math.max(cr/kappa,1),-1.200) * Math.pow(0.9938,age) * sf);
}

window.openPatientModal = function() {
    const p = getPatientProfile() || {};
    document.getElementById('pt-weight').value     = p.weight || '';
    document.getElementById('pt-age').value        = p.age || '';
    document.getElementById('pt-sex').value        = p.sex || 'male';
    document.getElementById('pt-height').value     = p.height || '';
    document.getElementById('pt-creatinine').value = p.creatinine || '';
    document.getElementById('pt-room').value       = p.room || '';
    document.getElementById('pt-diagnosis').value  = p.diagnosis || '';
    document.getElementById('pt-allergies').value  = p.allergies || '';
    updatePatientEGFRBadge();
    updatePatientIBWRow();
    const modal = document.getElementById('patient-modal');
    modal.classList.add('visible');
    setTimeout(() => document.getElementById('pt-weight').focus(), 200);

    // Live eGFR preview
    ['pt-age','pt-sex','pt-creatinine'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePatientEGFRBadge);
    });
    // Live IBW/ABW preview
    ['pt-weight','pt-height','pt-sex'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePatientIBWRow);
    });
};

function updatePatientIBWRow() {
    const weight = parseFloat(document.getElementById('pt-weight').value);
    const height = parseFloat(document.getElementById('pt-height').value);
    const sex    = document.getElementById('pt-sex').value;
    const row    = document.getElementById('pt-ibw-row');
    if (!row) return;
    if (!weight || !height || height < 100) { row.style.display = 'none'; return; }
    const ibw = sex === 'male' ? 50 + 2.3 * ((height / 2.54) - 60) : 45.5 + 2.3 * ((height / 2.54) - 60);
    const ibwClamped = Math.max(ibw, 1);
    const isObese = weight > 1.3 * ibwClamped;
    const abw = isObese ? ibwClamped + 0.4 * (weight - ibwClamped) : weight;
    row.style.display = 'flex';
    row.innerHTML = `<span><strong>IBW:</strong> ${ibwClamped.toFixed(1)} kg</span><span><strong>ABW:</strong> ${abw.toFixed(1)} kg${isObese ? ' <em style="color:var(--warning)">(obese adj.)</em>' : ''}</span><span style="color:var(--text-muted)">Used for aminoglycoside &amp; vancomycin dosing</span>`;
}

function updatePatientEGFRBadge() {
    const age = parseInt(document.getElementById('pt-age').value);
    const sex = document.getElementById('pt-sex').value;
    const cr  = parseFloat(document.getElementById('pt-creatinine').value);
    const badge = document.getElementById('pt-egfr-badge');
    if (!badge) return;
    const egfr = calcEGFRFromCr(age, sex, cr);
    if (egfr !== null) {
        const color = egfr >= 60 ? 'var(--success)' : egfr >= 30 ? 'var(--warning)' : 'var(--danger)';
        badge.style.display = 'inline-flex';
        badge.style.background = egfr >= 60 ? 'var(--success-bg)' : egfr >= 30 ? 'var(--warning-bg)' : 'var(--danger-bg)';
        badge.style.color = color;
        badge.style.border = `1px solid ${color}`;
        badge.style.borderRadius = 'var(--radius-full)';
        badge.style.padding = '0.2em 0.65em';
        badge.style.fontSize = 'var(--text-xs)';
        badge.style.fontWeight = '700';
        badge.style.fontFamily = 'var(--font-body)';
        badge.style.marginTop = 'var(--space-2)';
        const stage = egfr >= 90 ? 'G1' : egfr >= 60 ? 'G2' : egfr >= 45 ? 'G3a' : egfr >= 30 ? 'G3b' : egfr >= 15 ? 'G4' : 'G5';
        badge.textContent = `eGFR ≈ ${egfr} mL/min/1.73m² — CKD ${stage}`;
    } else {
        badge.style.display = 'none';
    }
}

window.closePatientModal = function() {
    document.getElementById('patient-modal').classList.remove('visible');
};

window.clearPatientProfile = function() {
    localStorage.removeItem('mc_patient');
    renderPatientBanner();
    closePatientModal();
    showToast('Patient profile cleared', 'info');
};

window.savePatientProfile = function() {
    const weight     = parseFloat(document.getElementById('pt-weight').value)      || null;
    const age        = parseInt(document.getElementById('pt-age').value)            || null;
    const sex        = document.getElementById('pt-sex').value;
    const height     = parseFloat(document.getElementById('pt-height').value)       || null;
    const creatinine = parseFloat(document.getElementById('pt-creatinine').value)   || null;
    const room       = document.getElementById('pt-room').value.trim()              || null;
    const diagnosis  = document.getElementById('pt-diagnosis').value.trim()         || null;
    const allergies  = document.getElementById('pt-allergies').value.trim()         || null;
    const egfr       = calcEGFRFromCr(age, sex, creatinine);
    const p = { weight, age, sex, height, creatinine, egfr, room, diagnosis, allergies };
    savePatientProfileData(p);
    renderPatientBanner();
    applyPatientAutofill(p);
    closePatientModal();
    showToast('Patient profile saved & applied', 'success');
    if (navigator.vibrate) navigator.vibrate(12);
};

function applyPatientAutofill(p) {
    if (!p) return;
    function fill(id, val) {
        if (!val) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.value = val;
        el.classList.add('autofilled');
        setTimeout(() => el.classList.remove('autofilled'), 800);
    }
    // Weight-based dosing
    if (p.weight) {
        fill('weight-dose-kg', p.weight);
        const wtBtn = document.querySelector('#sub-dosage-weight .unit-toggle-btn[data-unit="kg"]');
        if (wtBtn) { wtBtn.classList.add('active'); const lbsBtn = document.querySelector('#sub-dosage-weight .unit-toggle-btn[data-unit="lbs"]'); if(lbsBtn) lbsBtn.classList.remove('active'); }
        const inp = document.getElementById('weight-dose-kg');
        if (inp) inp.dataset.unit = 'kg';
        fill('bsa-weight', p.weight);
        fill('parkland-weight', p.weight);
        fill('bmi-weight', p.weight);
    }
    if (p.height) { fill('bsa-height', p.height); fill('bmi-height', p.height); }
    if (p.age)    { fill('egfr-age', p.age); fill('vanco-age', p.age); fill('amino-age', p.age); }
    if (p.sex)    { const egfrSex = document.getElementById('egfr-sex'); if(egfrSex) egfrSex.value = p.sex; const vancoSex = document.getElementById('vanco-sex'); if(vancoSex) vancoSex.value = p.sex; const aminoSex = document.getElementById('amino-sex'); if(aminoSex) aminoSex.value = p.sex; }
    if (p.creatinine) { fill('egfr-cr', p.creatinine); fill('vanco-cr', p.creatinine); fill('amino-cr', p.creatinine); }
    if (p.weight) { fill('vanco-weight', p.weight); fill('amino-weight', p.weight); fill('amino-height', p.height); }
    // Show autofill labels
    ['vanco-weight-autofill','vanco-age-autofill','amino-weight-autofill','amino-age-autofill'].forEach(id => {
        const el = document.getElementById(id); if (el) el.textContent = '← from patient';
    });
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    renderPatientBanner();
    const p = getPatientProfile();
    if (p) applyPatientAutofill(p);
    // Close modal on overlay click
    document.getElementById('patient-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('patient-modal')) closePatientModal();
    });
});

/* feature: renal dose badges on drug cards */
const DRUG_RENAL_FLAGS = {
    'Vancomycin':            { type: 'adjust',  note: 'Dose & interval ↓ for CrCl <50. Monitor AUC/MIC.' },
    'Gentamicin':            { type: 'adjust',  note: 'Extend interval for CrCl <60. Monitor levels.' },
    'Metformin':             { type: 'avoid',   note: 'Contraindicated if eGFR <30. Hold pre-contrast.' },
    'Enoxaparin':            { type: 'adjust',  note: 'Reduce to 1 mg/kg q24h if CrCl <30 mL/min.' },
    'Cefazolin':             { type: 'adjust',  note: 'Reduce dose for CrCl <35 mL/min.' },
    'Ketorolac':             { type: 'caution', note: 'Avoid in renal insufficiency (GI/renal risk).' },
    'Morphine':              { type: 'caution', note: 'Active metabolite accumulates; reduce dose in renal impairment.' },
    'Furosemide':            { type: 'caution', note: 'Higher doses needed in renal impairment; ototoxicity risk.' },
    'Heparin':               { type: 'caution', note: 'Monitor aPTT closely; bleeding risk ↑ in renal impairment.' },
    'Meropenem':             { type: 'adjust',  note: 'Dose adjustment required for CrCl <50 mL/min.' },
    'Piperacillin-Tazobactam':{ type: 'adjust', note: 'Reduce to 2.25 g q6h for CrCl <20 mL/min.' },
    'Ceftriaxone':           { type: 'caution', note: 'No adjustment usually needed; use caution in severe impairment.' },
    'Acetaminophen':         { type: 'caution', note: 'Increase interval to q8h if eGFR <30.' },
    'Ondansetron':           { type: 'caution', note: 'Reduce dose in severe hepatic impairment (also monitor QT).' },
    'Potassium Chloride':    { type: 'caution', note: 'Risk of hyperkalaemia; monitor K+ closely in renal impairment.' },
    'Ciprofloxacin':         { type: 'adjust',  note: 'Reduce dose for CrCl <30 mL/min. Half-normal dose for CrCl 5–29.' },
    'Metronidazole':         { type: 'caution', note: 'Use with caution in severe renal impairment; metabolites may accumulate.' },
    'Gabapentin':            { type: 'adjust',  note: 'Significant dose reduction required for eGFR <60. See local formulary.' },
    'Acetazolamide':         { type: 'avoid',   note: 'Contraindicated if eGFR <10. Use with caution for eGFR 10–50.' },
    'Metformin':             { type: 'avoid',   note: 'Contraindicated if eGFR <30. Hold pre-contrast.' },
    'Amoxicillin':           { type: 'adjust',  note: 'Reduce dose for severe renal impairment (CrCl <10 mL/min).' },
};

const BADGE_LABELS = { adjust: 'Renal: Adjust', caution: 'Renal: Caution', avoid: 'Renal: Avoid' };
const BADGE_ICONS  = {
    adjust:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
    caution: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
    avoid:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
};

// Patch buildDrugCard to append renal badge
(function() {
    const _orig = window.buildDrugCard;
    if (!_orig) return;
    window.buildDrugCard = function(d) {
        let html = _orig(d);
        const flag = DRUG_RENAL_FLAGS[d.name];
        if (flag) {
            const badge = `<span class="drug-renal-badge renal-${flag.type}" title="${flag.note}">${BADGE_ICONS[flag.type]}${BADGE_LABELS[flag.type]}</span>`;
            // Insert badge after the drug-badge span
            html = html.replace('</div>\n        </div>\n        <div class="drug-meta">', `${badge}</div>\n        </div>\n        <div class="drug-meta">`);
        }
        return html;
    };
})();

/* feature: multi-timer */
let multiTimers = [];
let _mtIdCounter = 0;

function addMultiTimer() {
    const name = prompt('Timer name (e.g. "Dopamine infusion", "BP recheck"):') || `Timer ${_mtIdCounter + 1}`;
    const secsInput = prompt('Duration in seconds (e.g. 300 for 5 min):');
    const secs = parseInt(secsInput);
    if (!secs || secs <= 0) { showToast('Enter a valid duration', 'warning'); return; }

    const id = ++_mtIdCounter;
    const timer = { id, name: name.substring(0, 40), total: secs, remaining: secs, running: false, interval: null, done: false };
    multiTimers.push(timer);
    renderMultiTimers();
    mtStart(id);
}

function renderMultiTimers() {
    const list = document.getElementById('multi-timer-list');
    const empty = document.getElementById('multi-timer-empty');
    if (!list) return;
    if (multiTimers.length === 0) {
        if (empty) empty.style.display = '';
        list.innerHTML = '';
        list.appendChild(empty || document.createElement('div'));
        return;
    }
    if (empty) empty.style.display = 'none';
    list.innerHTML = multiTimers.map(t => {
        const pct = t.total > 0 ? Math.max(0, t.remaining / t.total) * 100 : 0;
        const disp = t.done ? 'Done!' : formatMTTime(t.remaining);
        const cls = t.done ? 'mt-done' : t.running ? 'mt-running' : '';
        return `<div class="multi-timer-item ${cls}" id="mt-item-${t.id}">
            <div style="display:flex;flex-direction:column;flex:1;min-width:0;gap:3px;">
                <div class="mt-name" title="${t.name}">${t.name}</div>
                <div style="height:3px;background:var(--border);border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${t.done?'var(--dusty-rose)':t.remaining<=30?'var(--amber)':'var(--sage)'};border-radius:99px;transition:width 1s linear;"></div>
                </div>
            </div>
            <div class="mt-display" id="mt-disp-${t.id}">${disp}</div>
            <div class="mt-controls">
                ${!t.done ? `<button class="mt-btn" onclick="mtToggle(${t.id})" title="${t.running?'Pause':'Resume'}">
                    ${t.running
                        ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
                        : '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>'}
                </button>` : ''}
                <button class="mt-btn mt-stop" onclick="mtRemove(${t.id})" title="Remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>`;
    }).join('');
}

function formatMTTime(s) {
    if (s >= 3600) return `${Math.floor(s/3600)}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

function mtStart(id) {
    const t = multiTimers.find(x => x.id === id);
    if (!t || t.done) return;
    t.running = true;
    t.interval = setInterval(() => {
        t.remaining--;
        const dispEl = document.getElementById(`mt-disp-${t.id}`);
        const itemEl = document.getElementById(`mt-item-${t.id}`);
        if (t.remaining <= 0) {
            t.remaining = 0; t.done = true; t.running = false;
            clearInterval(t.interval);
            renderMultiTimers();
            showToast(`⏰ "${t.name}" complete!`, 'success');
            if (navigator.vibrate) navigator.vibrate([200,100,200,100,200]);
            if (typeof playTimerChime === 'function') playTimerChime();
        } else {
            if (dispEl) dispEl.textContent = formatMTTime(t.remaining);
            // Update progress bar inline
            if (itemEl) {
                const bar = itemEl.querySelector('div[style*="height:100%"]');
                if (bar) bar.style.width = `${(t.remaining / t.total) * 100}%`;
            }
        }
    }, 1000);
    renderMultiTimers();
}

window.mtToggle = function(id) {
    const t = multiTimers.find(x => x.id === id);
    if (!t || t.done) return;
    if (t.running) { clearInterval(t.interval); t.running = false; }
    else { mtStart(id); return; }
    renderMultiTimers();
};

window.mtRemove = function(id) {
    const t = multiTimers.find(x => x.id === id);
    if (t && t.interval) clearInterval(t.interval);
    multiTimers = multiTimers.filter(x => x.id !== id);
    renderMultiTimers();
};

// Init empty state
document.addEventListener('DOMContentLoaded', () => {
    renderMultiTimers();
});

/* feature: export notes as .txt */
window.exportNotesTxt = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor || !editor.innerText.trim()) { showToast('Nothing to export', 'warning'); return; }
    const text = editor.innerText.trim();
    const date = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'2-digit', day:'2-digit' }).replace(/\//g,'-');
    const time = new Date().toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', hour12:false }).replace(':','h');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `shift-notes-${date}-${time}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Notes saved as .txt', 'success');
};

/* feature: sbar template */
window.insertSBARTemplate = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor) return;
    const now = new Date().toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', hour12:true });
    const p = (typeof getPatientProfile === 'function') ? getPatientProfile() : null;
    const ptLine = p && p.room ? `Patient: ${p.room}${p.diagnosis ? ' — ' + p.diagnosis : ''}` : 'Patient: ';
    const allergyLine = p && p.allergies ? `Allergies: ⚠ ${p.allergies}` : 'Allergies: NKDA';
    const sbarHTML = `
<p style="font-family:monospace;font-size:0.88em;background:var(--parchment);padding:0.75em 1em;border-radius:8px;border-left:4px solid var(--sage);margin:0.5em 0;line-height:1.9;">
<strong>[${now}] SBAR Handover</strong><br>
${ptLine}<br>
${allergyLine}<br>
<br>
<strong>S — Situation</strong><br>
&nbsp;&nbsp;[What is happening right now?]<br>
<br>
<strong>B — Background</strong><br>
&nbsp;&nbsp;[Relevant history, admitting diagnosis, key events]<br>
<br>
<strong>A — Assessment</strong><br>
&nbsp;&nbsp;[Your clinical assessment of the situation]<br>
<br>
<strong>R — Recommendation</strong><br>
&nbsp;&nbsp;[What do you need from the receiver? Orders, review, monitoring?]
</p>`;
    editor.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('insertHTML', false, sbarHTML);
    editor.dispatchEvent(new Event('input'));
    showToast('SBAR template inserted', 'success');
};

/* feature: qr code share for shift notes */
window.showQRShare = function() {
    const editor = document.getElementById('shift-notes');
    if (!editor || !editor.innerText.trim()) { showToast('Add some notes first', 'warning'); return; }

    const text = editor.innerText.trim();
    const modal = document.getElementById('qr-modal');
    const charEl = document.getElementById('qr-modal-chars');
    if (charEl) charEl.textContent = `${text.length} characters — scan with any camera app`;

    modal.classList.add('visible');
    // Generate QR using a lightweight pure-JS implementation
    setTimeout(() => generateQRCode(text), 50);
};

window.closeQRModal = function() {
    document.getElementById('qr-modal').classList.remove('visible');
};

window.downloadQR = function() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `medconvert-notes-${new Date().toISOString().slice(0,10)}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('QR image saved', 'success');
};

function generateQRCode(text) {
    // Minimal QR code renderer using data URI approach via external lib
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Use a data URL approach: encode text as a URL and render via QR API
    // We'll use the qrcode.js library loaded from CDN
    if (typeof QRCode !== 'undefined') {
        canvas.width = 200; canvas.height = 200;
        const qr = new QRCode(canvas, { text: text.substring(0, 2000), width: 200, height: 200, colorDark: '#2d5a27', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    } else {
        // Fallback: load qrcode library dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            canvas.width = 200; canvas.height = 200;
            canvas.innerHTML = '';
            new QRCode(canvas, { text: text.substring(0, 2000), width: 200, height: 200, colorDark: '#2d5a27', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
        };
        script.onerror = () => {
            // Ultimate fallback: render a message
            ctx.fillStyle = '#f5f0e8';
            ctx.fillRect(0,0,200,200);
            ctx.fillStyle = '#2d5a27';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('QR unavailable offline.', 100, 90);
            ctx.fillText('Use Copy instead.', 100, 110);
        };
        document.head.appendChild(script);
    }
}

// Close QR modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
    const qrOverlay = document.getElementById('qr-modal');
    if (qrOverlay) qrOverlay.addEventListener('click', e => { if (e.target === qrOverlay) closeQRModal(); });
});

/* feature: vancomycin auc/mic dosing calculator */
window.calculateVancomycin = function() {
    const weight   = parseFloat(document.getElementById('vanco-weight').value);
    const age      = parseInt(document.getElementById('vanco-age').value);
    const cr       = parseFloat(document.getElementById('vanco-cr').value);
    const sex      = document.getElementById('vanco-sex').value;
    const interval = parseInt(document.getElementById('vanco-interval').value);
    const mic      = parseFloat(document.getElementById('vanco-mic').value);

    if (!weight || !age || !cr || !interval) { showToast('Fill in all fields', 'warning'); return; }
    if (weight < 20 || weight > 300) { showToast('Check patient weight', 'warning'); return; }

    // Cockcroft-Gault CrCl
    const crcl = ((140 - age) * weight / (72 * cr)) * (sex === 'female' ? 0.85 : 1.0);
    // Vanco CL (Matzke 1984): CL = (0.695 × CrCl/TBW) + 0.05
    const vancoClLhrKg = (0.695 * (crcl / weight)) + 0.05;
    const vancoCl = vancoClLhrKg * weight; // L/hr
    // Vd (Rybak): 0.4–0.7 L/kg; use 0.5 L/kg
    const vd = 0.5 * weight;
    // Kel
    const kel = vancoCl / vd;
    // Half-life
    const t12 = 0.693 / kel;

    // Target AUC 400–600; aim for 500
    const targetAUC = 500; // mg·h/L (assuming MIC=1)
    const adjustedTarget = targetAUC * mic;
    // Dose = CL × targetAUC × interval / 24  (simplified one-compartment)
    const dose = Math.round((vancoCl * adjustedTarget * (interval / 24)) / 100) * 100;
    const clampedDose = Math.min(Math.max(dose, 500), 3000);
    // Predicted AUC at this dose
    const predAUC = (clampedDose * 24) / (vancoCl * interval * mic);
    const aucStatus = predAUC >= 400 && predAUC <= 600 ? 'vc-target' : predAUC > 600 ? 'vc-warn' : 'vc-danger';

    document.getElementById('vc-cl-val').textContent  = `${vancoCl.toFixed(2)} L/hr`;
    document.getElementById('vc-vd-val').textContent  = `${(vd/weight).toFixed(2)} L/kg`;
    document.getElementById('vc-dose-val').textContent = `${clampedDose} mg`;
    document.getElementById('vc-auc-val').textContent  = `${Math.round(predAUC)} mg·h/L`;

    document.getElementById('vc-auc-card').className = `vanco-result-card ${aucStatus}`;

    let interp = '';
    if (predAUC >= 400 && predAUC <= 600) {
        interp = `Predicted AUC/MIC ${Math.round(predAUC)} is within target (400–600). Give ${clampedDose} mg every ${interval} hours.`;
    } else if (predAUC > 600) {
        interp = `⚠️ Predicted AUC/MIC ${Math.round(predAUC)} exceeds target. Consider reducing dose to ${Math.max(clampedDose-250,500)} mg q${interval}h or extending interval.`;
    } else {
        interp = `Predicted AUC/MIC ${Math.round(predAUC)} is below target. Consider increasing dose. Verify renal function and weight.`;
    }
    interp += ` CrCl: ${Math.round(crcl)} mL/min. Half-life: ${t12.toFixed(1)} hrs.`;
    document.getElementById('vanco-interp-text').textContent = interp;
    const interpEl = document.getElementById('vanco-interp');
    interpEl.classList.remove('result-normal','result-warning','result-danger','result-neutral');
    interpEl.classList.add(predAUC >= 400 && predAUC <= 600 ? 'result-normal' : predAUC > 600 ? 'result-warning' : 'result-danger');

    document.getElementById('vanco-results').style.display = '';
    addToHistory('Dosage', 'Vancomycin', `${clampedDose} mg q${interval}h`);
};

/* feature: aminoglycoside hartford nomogram */
window.calculateAminoglycoside = function() {
    const drug   = document.getElementById('amino-drug').value;
    const abw    = parseFloat(document.getElementById('amino-weight').value);
    const height = parseFloat(document.getElementById('amino-height').value);
    const sex    = document.getElementById('amino-sex').value;
    const cr     = parseFloat(document.getElementById('amino-cr').value);
    const age    = parseInt(document.getElementById('amino-age').value);

    if (!abw || !height || !cr || !age) { showToast('Fill in all fields', 'warning'); return; }

    // Ideal body weight
    const ibw = sex === 'male' ? 50 + 2.3 * ((height/2.54) - 60) : 45.5 + 2.3 * ((height/2.54) - 60);
    // Adjusted BW if obese (ABW > 130% IBW)
    const dosingWeight = abw > 1.3 * ibw ? ibw + 0.4 * (abw - ibw) : abw;

    // CrCl (Cockcroft-Gault)
    const crcl = Math.min(((140 - age) * dosingWeight / (72 * cr)) * (sex === 'female' ? 0.85 : 1.0), 120);

    if (crcl < 20) { showToast('CrCl <20 mL/min — once-daily aminoglycoside not recommended', 'danger'); return; }

    // Dosing
    const dosePerKg = drug === 'amikacin' ? 15 : 7;
    const dose = Math.round(dosingWeight * dosePerKg / 10) * 10;

    // Hartford nomogram interval selection based on CrCl
    let intervalHrs, nomogramNote;
    if (crcl >= 60)      { intervalHrs = 24; nomogramNote = 'Plot 6–14 hr level on Hartford nomogram — expect q24h zone.'; }
    else if (crcl >= 40) { intervalHrs = 36; nomogramNote = 'Plot 6–14 hr level — likely q36h zone. Confirm with nomogram.'; }
    else                 { intervalHrs = 48; nomogramNote = 'Plot 6–14 hr level — likely q48h zone. Confirm with nomogram.'; }

    document.getElementById('amino-dosing-weight').textContent = `${dosingWeight.toFixed(1)} kg${abw > 1.3*ibw ? ' (adj)' : ''}`;
    document.getElementById('amino-dose').textContent          = `${dose} mg`;
    document.getElementById('amino-crcl').textContent         = `${Math.round(crcl)} mL/min`;
    document.getElementById('amino-interval').textContent     = `q${intervalHrs}h`;

    const interp = `${dose} mg ${drug} every ${intervalHrs} hrs. IBW: ${ibw.toFixed(1)} kg. ${nomogramNote} Draw random level 6–14 hrs post-infusion to confirm interval.`;
    document.getElementById('amino-interp-text').textContent = interp;
    const interpEl = document.getElementById('amino-interp');
    interpEl.classList.remove('result-normal','result-warning','result-danger','result-neutral');
    interpEl.classList.add(intervalHrs === 24 ? 'result-normal' : intervalHrs === 36 ? 'result-warning' : 'result-danger');

    document.getElementById('amino-results').style.display = '';
    addToHistory('Dosage', drug.charAt(0).toUpperCase()+drug.slice(1), `${dose} mg q${intervalHrs}h`);
};

/* i&o tracker */
let ioEntries = [];
try { ioEntries = JSON.parse(localStorage.getItem('mc_io') || '[]'); } catch {}

function ioSave() { try { localStorage.setItem('mc_io', JSON.stringify(ioEntries)); } catch {} }

function ioAdd(dir) {
    const amt = parseFloat(document.getElementById(`io-${dir}-amt`).value);
    const type = document.getElementById(`io-${dir}-type`).value;
    if (!amt || amt <= 0) { showToast('Enter a valid amount', 'warning'); return; }
    ioEntries.push({ dir, amt, type, time: new Date().toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',hour12:true}), ts: Date.now() });
    document.getElementById(`io-${dir}-amt`).value = '';
    ioSave(); ioRender();
    showToast(`${dir==='in'?'Intake':'Output'}: ${amt} mL (${type})`, 'success');
    if (navigator.vibrate) navigator.vibrate(10);
}

function ioRender() {
    const log = document.getElementById('io-log');
    if (!log) return;
    const totalIn  = ioEntries.filter(e=>e.dir==='in').reduce((s,e)=>s+e.amt,0);
    const totalOut = ioEntries.filter(e=>e.dir==='out').reduce((s,e)=>s+e.amt,0);
    const bal = totalIn - totalOut;
    const balEl = document.getElementById('io-balance');
    if (balEl) {
        balEl.textContent = `${bal >= 0 ? '+' : ''}${bal} mL`;
        balEl.style.color = bal > 0 ? 'var(--success)' : bal < 0 ? 'var(--dusty-rose)' : 'var(--forest)';
    }
    if (!ioEntries.length) { log.innerHTML = '<div class="multi-timer-empty">No entries yet. Add intake or output above.</div>'; return; }
    log.innerHTML = [...ioEntries].reverse().map(e => `
        <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-lg);">
            <div style="width:2.25rem;height:2.25rem;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${e.dir==='in'?'var(--success-bg)':'var(--danger-bg)'};border:1px solid ${e.dir==='in'?'var(--success)':'var(--dusty-rose)'};">
                <svg viewBox="0 0 24 24" fill="none" stroke="${e.dir==='in'?'var(--success)':'var(--dusty-rose)'}" stroke-width="2.5" stroke-linecap="round" width="14" height="14">${e.dir==='in'?'<path d="M12 5v14M5 12l7 7 7-7"/>':'<path d="M12 19V5M5 12l7-7 7 7"/>'}</svg>
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);font-family:var(--font-body);">${e.amt} mL — ${e.type}</div>
                <div style="font-size:0.65rem;color:var(--text-muted);font-family:var(--font-body);">${e.dir==='in'?'Intake':'Output'} · ${e.time}</div>
            </div>
            <button onclick="ioRemove(${e.ts})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0.25rem;border-radius:var(--radius-sm);" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`).join('');
}

window.ioRemove = function(ts) { ioEntries = ioEntries.filter(e=>e.ts!==ts); ioSave(); ioRender(); };
window.ioClearAll = function() { ioEntries = []; ioSave(); ioRender(); showToast('I&O cleared','info'); };
document.addEventListener('DOMContentLoaded', ioRender);

/* handover builder */
let handoverPatients = [];
try { handoverPatients = JSON.parse(localStorage.getItem('mc_handover') || '[]'); } catch {}
let _hoId = handoverPatients.reduce((m,p)=>Math.max(m,p.id||0),0);

function handoverSave() { try { localStorage.setItem('mc_handover', JSON.stringify(handoverPatients)); } catch {} }

window.handoverAdd = function() {
    const id = ++_hoId;
    handoverPatients.push({ id, bed:'', name:'', diagnosis:'', situation:'', background:'', assessment:'', recommendation:'', allergies:'' });
    handoverSave(); handoverRender(); handoverRenderEmpty();
};

window.handoverRemove = function(id) {
    handoverPatients = handoverPatients.filter(p=>p.id!==id);
    handoverSave(); handoverRender(); handoverRenderEmpty();
};

window.handoverUpdate = function(id, field, val) {
    const p = handoverPatients.find(x=>x.id===id);
    if (p) { p[field] = val; handoverSave(); }
};

window.handoverCopyAll = function() {
    if (!handoverPatients.length) { showToast('No patients to copy','warning'); return; }
    const text = handoverPatients.map(p => [
        `=== ${p.bed ? 'Bed '+p.bed : 'Patient'} ${p.name ? '— '+p.name : ''} ===`,
        p.diagnosis ? `Dx: ${p.diagnosis}` : '',
        p.allergies ? `Allergies: ${p.allergies}` : '',
        p.situation ? `S: ${p.situation}` : '',
        p.background ? `B: ${p.background}` : '',
        p.assessment ? `A: ${p.assessment}` : '',
        p.recommendation ? `R: ${p.recommendation}` : '',
    ].filter(Boolean).join('\n')).join('\n\n');
    navigator.clipboard.writeText(text).then(()=>showToast('Handover copied','success')).catch(()=>showToast('Copy failed','danger'));
};

window.handoverPrint = function() {
    const w = window.open('','_blank');
    const rows = handoverPatients.map(p=>`<tr><td>${p.bed}</td><td>${p.name}</td><td>${p.diagnosis}</td><td>${p.allergies}</td><td>${p.situation}</td><td>${p.assessment}</td><td>${p.recommendation}</td></tr>`).join('');
    w.document.write(`<html><head><title>Handover</title><style>body{font-family:sans-serif;font-size:12px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:4px 6px;vertical-align:top;}th{background:#eaf5e8;}@media print{body{margin:0;}}</style></head><body><h2 style="color:#2d5a27">Shift Handover — ${new Date().toLocaleDateString()}</h2><table><tr><th>Bed</th><th>Name</th><th>Diagnosis</th><th>Allergies</th><th>Situation</th><th>Assessment</th><th>Plan/Rec</th></tr>${rows}</table></body></html>`);
    w.document.close(); setTimeout(()=>{w.print();},300);
};

window.handoverClearAll = function() {
    if (!confirm('Clear all patients?')) return;
    handoverPatients=[]; _hoId=0; handoverSave(); handoverRender(); handoverRenderEmpty();
};

function handoverRender() {
    const list = document.getElementById('handover-list');
    if (!list) return;
    list.innerHTML = handoverPatients.map(p => `
        <div style="background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);">
            <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">
                <input type="text" value="${p.bed}" placeholder="Bed #" style="width:5rem;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-xs);font-weight:700;background:var(--bg-input);color:var(--text-primary);" oninput="handoverUpdate(${p.id},'bed',this.value)">
                <input type="text" value="${p.name}" placeholder="Patient name" style="flex:1;min-width:8rem;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-sm);background:var(--bg-input);color:var(--text-primary);" oninput="handoverUpdate(${p.id},'name',this.value)">
                <input type="text" value="${p.allergies}" placeholder="Allergies (NKDA)" style="flex:1;min-width:8rem;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-xs);background:var(--danger-bg);color:var(--danger);border-color:rgba(122,42,34,0.3);" oninput="handoverUpdate(${p.id},'allergies',this.value)">
                <button onclick="handoverRemove(${p.id})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0.25rem;" title="Remove patient">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <input type="text" value="${p.diagnosis}" placeholder="Diagnosis / admission reason" style="width:100%;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-sm);background:var(--bg-input);color:var(--text-primary);" oninput="handoverUpdate(${p.id},'diagnosis',this.value)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
                <div><label style="display:block;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--sage);font-family:var(--font-body);margin-bottom:3px;">S — Situation</label>
                <textarea rows="2" style="width:100%;resize:vertical;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-xs);background:var(--bg-input);color:var(--text-primary);outline:none;" placeholder="Current status, reason for call…" oninput="handoverUpdate(${p.id},'situation',this.value)">${p.situation}</textarea></div>
                <div><label style="display:block;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--sage);font-family:var(--font-body);margin-bottom:3px;">B — Background</label>
                <textarea rows="2" style="width:100%;resize:vertical;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-xs);background:var(--bg-input);color:var(--text-primary);outline:none;" placeholder="PMHx, meds, allergies…" oninput="handoverUpdate(${p.id},'background',this.value)">${p.background}</textarea></div>
                <div><label style="display:block;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--amber);font-family:var(--font-body);margin-bottom:3px;">A — Assessment</label>
                <textarea rows="2" style="width:100%;resize:vertical;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-xs);background:var(--bg-input);color:var(--text-primary);outline:none;" placeholder="Nurse assessment…" oninput="handoverUpdate(${p.id},'assessment',this.value)">${p.assessment}</textarea></div>
                <div><label style="display:block;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--dusty-rose);font-family:var(--font-body);margin-bottom:3px;">R — Recommendation</label>
                <textarea rows="2" style="width:100%;resize:vertical;padding:0.35rem 0.5rem;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--text-xs);background:var(--bg-input);color:var(--text-primary);outline:none;" placeholder="Action needed, pending tasks…" oninput="handoverUpdate(${p.id},'recommendation',this.value)">${p.recommendation}</textarea></div>
            </div>
        </div>`).join('');
}

function handoverRenderEmpty() {
    const empty = document.getElementById('handover-empty');
    if (empty) empty.style.display = handoverPatients.length ? 'none' : '';
}

document.addEventListener('DOMContentLoaded', () => { handoverRender(); handoverRenderEmpty(); });

/* med due tracker */
let medDueList = [];
try { medDueList = JSON.parse(localStorage.getItem('mc_meddue') || '[]'); } catch {}
let _mdId = medDueList.reduce((m,x)=>Math.max(m,x.id||0),0);

function medDueSave() { try { localStorage.setItem('mc_meddue', JSON.stringify(medDueList)); } catch {} }

window.medDueAdd = function() {
    const name = document.getElementById('med-name').value.trim();
    const lastGiven = document.getElementById('med-last-given').value;
    const freqHrs = parseFloat(document.getElementById('med-freq').value);
    const patient = document.getElementById('med-patient').value.trim();
    if (!name || !lastGiven) { showToast('Enter drug name and last given time', 'warning'); return; }
    const [h,m] = lastGiven.split(':').map(Number);
    const givenMs = new Date(); givenMs.setHours(h,m,0,0);
    const nextDue = new Date(givenMs.getTime() + freqHrs * 3600000);
    medDueList.push({ id: ++_mdId, name, lastGiven, freqHrs, nextDue: nextDue.getTime(), patient });
    document.getElementById('med-name').value = '';
    document.getElementById('med-last-given').value = '';
    document.getElementById('med-patient').value = '';
    medDueSave(); medDueRender();
    showToast(`${name} tracked — next due ${nextDue.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',hour12:true})}`, 'success');
};

window.medDueRemove = function(id) { medDueList = medDueList.filter(x=>x.id!==id); medDueSave(); medDueRender(); };

function medDueRender() {
    const list = document.getElementById('meddue-list');
    const empty = document.getElementById('meddue-empty');
    if (!list) return;
    if (!medDueList.length) { if(empty) empty.style.display=''; list.innerHTML=''; return; }
    if(empty) empty.style.display='none';
    const now = Date.now();
    list.innerHTML = [...medDueList].sort((a,b)=>a.nextDue-b.nextDue).map(m => {
        const diff = m.nextDue - now;
        const overdue = diff < 0;
        const dueTime = new Date(m.nextDue).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit',hour12:true});
        const diffAbs = Math.abs(diff);
        const diffH = Math.floor(diffAbs/3600000);
        const diffM = Math.floor((diffAbs%3600000)/60000);
        const diffStr = diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`;
        const urgency = overdue ? 'var(--danger)' : diff < 1800000 ? 'var(--warning)' : 'var(--success)';
        const bg = overdue ? 'var(--danger-bg)' : diff < 1800000 ? 'var(--warning-bg)' : 'var(--bg-card)';
        return `<div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:${bg};border:1.5px solid ${urgency};border-radius:var(--radius-lg);">
            <div style="flex:1;min-width:0;">
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);font-family:var(--font-body);">${m.name}</div>
                <div style="font-size:0.65rem;color:var(--text-muted);font-family:var(--font-body);">${m.patient ? m.patient+' · ' : ''}q${m.freqHrs}h · Last: ${m.lastGiven}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:var(--text-sm);font-weight:800;color:${urgency};font-family:var(--font-display);">${dueTime}</div>
                <div style="font-size:0.65rem;font-weight:700;color:${urgency};font-family:var(--font-body);">${overdue?'OVERDUE '+diffStr:'in '+diffStr}</div>
            </div>
            <button onclick="medDueRemove(${m.id})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0.25rem;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

// Refresh med due times every minute
setInterval(medDueRender, 60000);
document.addEventListener('DOMContentLoaded', medDueRender);

/* feature: med due push notifications */
let _medDueNotifGranted = false;
let _medDueNotifCheckInterval = null;

function initMedDueNotifications() {
    const bar = document.getElementById('meddue-notif-bar');
    if (!('Notification' in window)) {
        // Browser doesn't support — hide the bar entirely
        if (bar) bar.style.display = 'none';
        return;
    }
    if (Notification.permission === 'granted') {
        _medDueNotifGranted = true;
        if (bar) bar.style.display = 'none';
        startMedDueNotifWatcher();
    } else if (Notification.permission !== 'denied') {
        if (bar) bar.style.display = 'flex';
    } else {
        if (bar) bar.style.display = 'none';
    }
}

window.requestMedDueNotifications = async function() {
    if (!('Notification' in window)) { showToast('Notifications not supported in this browser', 'warning'); return; }
    const result = await Notification.requestPermission();
    const bar = document.getElementById('meddue-notif-bar');
    if (result === 'granted') {
        _medDueNotifGranted = true;
        if (bar) bar.style.display = 'none';
        showToast('Notifications enabled — you\'ll be alerted when meds are due', 'success');
        startMedDueNotifWatcher();
        // Test notification
        new Notification('MedConvert 💊', {
            body: 'Medication alerts are now active. You\'ll be notified when a tracked med is due.',
            icon: '/Med-Calc/image/favicon.svg',
            tag: 'medconvert-test'
        });
    } else {
        showToast('Notification permission denied — please allow in browser settings', 'warning');
        if (bar) bar.style.display = 'none';
    }
};

const _notifiedMeds = new Set();

function startMedDueNotifWatcher() {
    if (_medDueNotifCheckInterval) clearInterval(_medDueNotifCheckInterval);
    _medDueNotifCheckInterval = setInterval(checkMedsDueForNotification, 30000); // every 30s
}

function checkMedsDueForNotification() {
    if (!_medDueNotifGranted || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = Date.now();
    medDueList.forEach(med => {
        const msUntilDue = med.nextDue - now;
        const notifKey = `${med.id}-${med.nextDue}`;
        // Alert at 5 min before due and when overdue (once each)
        const isDueSoon = msUntilDue > 0 && msUntilDue <= 5 * 60 * 1000;
        const isOverdue = msUntilDue < 0 && msUntilDue > -2 * 60 * 1000; // within 2 min of going overdue
        if ((isDueSoon || isOverdue) && !_notifiedMeds.has(notifKey)) {
            _notifiedMeds.add(notifKey);
            const dueTime = new Date(med.nextDue).toLocaleTimeString('en-PH', { hour:'2-digit', minute:'2-digit', hour12:true });
            const body = isOverdue
                ? `${med.name} is now overdue!${med.patient ? ' Patient: ' + med.patient : ''}`
                : `${med.name} is due at ${dueTime}${med.patient ? ' — ' + med.patient : ''} (5 min warning)`;
            try {
                const notif = new Notification(isOverdue ? '⚠️ Med Overdue — MedConvert' : '💊 Med Due Soon — MedConvert', {
                    body,
                    icon: '/Med-Calc/image/favicon.svg',
                    tag: `medconvert-med-${notifKey}`,
                    requireInteraction: isOverdue,
                    vibrate: isOverdue ? [200, 100, 200] : [100]
                });
                notif.onclick = function() {
                    window.focus();
                    if (window.switchToTab) window.switchToTab('meddue');
                    notif.close();
                };
            } catch(e) {}
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMedDueNotifications, 500);
});

/* news2 score */
window.calcNEWS2 = function() {
    const rr   = parseFloat(document.getElementById('news-rr')?.value);
    const spo2 = parseFloat(document.getElementById('news-spo2')?.value);
    const sbp  = parseFloat(document.getElementById('news-sbp')?.value);
    const hr   = parseFloat(document.getElementById('news-hr')?.value);
    const temp = parseFloat(document.getElementById('news-temp')?.value);
    const o2   = parseInt(document.getElementById('news-o2')?.value || '0');
    const avpu = parseInt(document.getElementById('news-avpu')?.value || '0');
    const scale= parseInt(document.getElementById('news-scale')?.value || '1');
    if (!rr && !spo2 && !sbp && !hr && !temp) return;

    let s = {rr:0, spo2:0, o2, sbp:0, hr:0, temp:0, avpu};

    // RR
    if (rr <= 8) s.rr=3; else if (rr <= 11) s.rr=1; else if (rr <= 20) s.rr=0; else if (rr <= 24) s.rr=2; else s.rr=3;
    // SpO2 — Scale 1
    if (scale===1) {
        if (spo2 <= 91) s.spo2=3; else if (spo2 <= 93) s.spo2=2; else if (spo2 <= 95) s.spo2=1; else s.spo2=0;
    } else {
        // Scale 2 (COPD target 88-92%)
        if (spo2 <= 83) s.spo2=3; else if (spo2 <= 85) s.spo2=2; else if (spo2 <= 87) s.spo2=1;
        else if (spo2 <= 92) s.spo2=0; else if (spo2 <= 94) s.spo2=1; else if (spo2 <= 96) s.spo2=2; else s.spo2=3;
    }
    // SBP
    if (sbp <= 90) s.sbp=3; else if (sbp <= 100) s.sbp=2; else if (sbp <= 110) s.sbp=1; else if (sbp <= 219) s.sbp=0; else s.sbp=3;
    // HR
    if (hr <= 40) s.hr=3; else if (hr <= 50) s.hr=1; else if (hr <= 90) s.hr=0; else if (hr <= 110) s.hr=1; else if (hr <= 130) s.hr=2; else s.hr=3;
    // Temp
    if (temp <= 35.0) s.temp=3; else if (temp <= 36.0) s.temp=1; else if (temp <= 38.0) s.temp=0; else if (temp <= 39.0) s.temp=1; else s.temp=2;

    const total = Object.values(s).reduce((a,b)=>a+b,0);
    const maxSingle = Math.max(s.rr, s.spo2, s.sbp, s.hr, s.temp);
    const hasRedFlag = maxSingle === 3;

    let risk, action, color;
    if (total >= 7 || (total >= 5 && hasRedFlag)) { risk='HIGH'; color='result-danger'; action='Emergency response — continuous monitoring, consider ICU, notify senior immediately.'; }
    else if (total >= 5 || (total >= 4 && hasRedFlag)) { risk='MEDIUM-HIGH'; color='result-warning'; action='Urgent clinical review within 30 min. Consider HDU/ICU step-up.'; }
    else if (total >= 3) { risk='MEDIUM'; color='result-warning'; action='Increased monitoring (q1h vitals). Urgent ward review.'; }
    else { risk='LOW'; color='result-normal'; action='Routine monitoring as per ward policy.'; }

    const resEl = document.getElementById('news2-result');
    if (resEl) { resEl.className = `result-display show ${color}`; }
    const scoreEl = document.getElementById('news2-score');
    if (scoreEl) scoreEl.textContent = `${total} — ${risk}`;
    const actionEl = document.getElementById('news2-action');
    if (actionEl) actionEl.textContent = action;
    const breakdownEl = document.getElementById('news2-breakdown');
    if (breakdownEl) breakdownEl.innerHTML = `RR:${s.rr} | SpO₂:${s.spo2} | O₂:${s.o2} | SBP:${s.sbp} | HR:${s.hr} | Temp:${s.temp} | AVPU:${s.avpu}`;
    addToHistory('Clinical', 'NEWS2', `${total} (${risk})`);
    if (total >= 5 && navigator.vibrate) navigator.vibrate([100,50,100]);
};

/* qsofa */
window.calcQSOFA = function() {
    const rr  = document.getElementById('qsofa-rr')?.checked  ? 1 : 0;
    const ms  = document.getElementById('qsofa-ms')?.checked  ? 1 : 0;
    const sbp = document.getElementById('qsofa-sbp')?.checked ? 1 : 0;
    const total = rr + ms + sbp;
    const resEl = document.getElementById('qsofa-result');
    const scoreEl = document.getElementById('qsofa-score');
    const interpEl = document.getElementById('qsofa-interp');
    if (!resEl || !scoreEl || !interpEl) return;
    scoreEl.textContent = `${total} / 3`;
    if (total >= 2) {
        resEl.className = 'result-display show result-danger';
        interpEl.textContent = '⚠️ High risk — suspect sepsis. Assess for organ dysfunction. Check lactate, cultures, consider escalation.';
    } else if (total === 1) {
        resEl.className = 'result-display show result-warning';
        interpEl.textContent = 'Intermediate — monitor closely. Reassess if condition changes.';
    } else {
        resEl.className = 'result-display show result-normal';
        interpEl.textContent = 'Low risk — routine monitoring. Reassess if deterioration.';
    }
    addToHistory('Clinical','qSOFA',`${total}/3`);
};

/* ecg guide */
const ECG_RHYTHMS = [
    { name:'Normal Sinus Rhythm', rate:'60–100 bpm', p:'Regular, upright in II', pr:'0.12–0.20s', qrs:'<0.12s', notes:'Normal variant. Rate varies with respiration (sinus arrhythmia is normal).' },
    { name:'Sinus Bradycardia', rate:'<60 bpm', p:'Normal', pr:'Normal', qrs:'Normal', notes:'May be normal (athletes). Treat if symptomatic (hypotension, syncope). Atropine 0.5–1 mg IV.' },
    { name:'Sinus Tachycardia', rate:'>100 bpm', p:'Normal', pr:'May shorten', qrs:'Normal', notes:'Treat the cause (fever, pain, dehydration, PE, sepsis). Rarely primary.' },
    { name:'Atrial Fibrillation', rate:'Irregularly irregular', p:'Absent (fibrillatory baseline)', pr:'N/A', qrs:'Usually narrow', notes:'Rate control (metoprolol, diltiazem). Anticoagulation if >48h or unknown duration.' },
    { name:'Atrial Flutter', rate:'Atrial ~300, ventricular 150 (2:1)', p:'Sawtooth flutter waves (II,III,aVF)', pr:'Variable', qrs:'Usually narrow', notes:'2:1 block most common. Cardioversion or rate control. High thromboembolic risk.' },
    { name:'SVT (AVNRT)', rate:'150–250 bpm', p:'Buried in or after QRS', pr:'Very short', qrs:'Narrow', notes:'Vagal maneuvers first. Adenosine 6 mg rapid IV if no response. Cardiovert if unstable.' },
    { name:'Ventricular Tachycardia', rate:'>100 bpm', p:'Dissociated', pr:'N/A', qrs:'>0.12s (wide, bizarre)', notes:'Pulseless VT → CPR + defibrillation. Pulsed → amiodarone 150 mg IV or cardiovert.' },
    { name:'Ventricular Fibrillation', rate:'Chaotic', p:'Absent', pr:'N/A', qrs:'Absent — chaotic waves', notes:'Shockable rhythm — CPR immediately, defibrillate (200J biphasic), adrenaline 1 mg q3-5 min.' },
    { name:'1st Degree AV Block', rate:'Normal', p:'Normal', pr:'>0.20s (>200 ms)', qrs:'Normal', notes:'Benign. Usually no treatment required. Monitor for progression.' },
    { name:'2nd Degree — Mobitz I (Wenckebach)', rate:'Variable', p:'Normal', pr:'Progressive lengthening then dropped QRS', qrs:'Normal', notes:'Usually benign. If symptomatic, atropine or pacing. Often resolves.' },
    { name:'2nd Degree — Mobitz II', rate:'Slow', p:'Normal', pr:'Fixed, then sudden dropped QRS', qrs:'Often wide', notes:'Risk of complete block. Pacemaker usually required. Atropine less effective.' },
    { name:'3rd Degree (Complete) AV Block', rate:'Ventricular <40 bpm', p:'P waves dissociated from QRS', pr:'Varies — no relationship', qrs:'Wide (escape)', notes:'Emergency. Transcutaneous pacing immediately, then transvenous. Atropine bridge only.' },
    { name:'Left Bundle Branch Block', rate:'Variable', p:'Normal', pr:'Normal', qrs:'>0.12s, notched in V5-6', notes:'New LBBB with chest pain = STEMI equivalent — activate cath lab.' },
    { name:'Right Bundle Branch Block', rate:'Variable', p:'Normal', pr:'Normal', qrs:'>0.12s, rSR\' in V1', notes:'Often benign. New RBBB with anterior ST changes may indicate RV strain (PE, STEMI).' },
];

const ECG_INTERVALS = [
    { name:'PR Interval', normal:'120–200 ms (3–5 small squares)', abnormal:'<120 ms = WPW/accessory pathway | >200 ms = 1st degree AV block' },
    { name:'QRS Duration', normal:'<120 ms (<3 small squares)', abnormal:'>120 ms = bundle branch block, ventricular rhythm, hyperkalaemia, Na-channel toxicity' },
    { name:'QT Interval', normal:'Men <440 ms | Women <460 ms', abnormal:'>500 ms = high risk TdP. Correct for rate using QTc = QT ÷ √RR (Bazett).' },
    { name:'ST Segment', normal:'Isoelectric (flat)', abnormal:'Elevation ≥1 mm (2+ leads) = STEMI. Depression = ischaemia/strain/digoxin.' },
    { name:'T Waves', normal:'Upright in I, II, V3–V6', abnormal:'Inverted = ischaemia, RBBB, RV strain. Peaked = hyperkalaemia.' },
    { name:'P Wave', normal:'<2.5 mm tall, <120 ms wide, upright II', abnormal:'Bifid (P mitrale) = LAE. Peaked (P pulmonale) = RAE. Absent = AF/junctional rhythm.' },
];

const ECG_APPROACH = [
    { step:1, title:'Rate', detail:'Count R-R intervals. 300÷(large squares between R-R). Normal 60–100. >100 = tachy, <60 = brady.' },
    { step:2, title:'Rhythm', detail:'Regular or irregular? Check R-R intervals. Irregular = AF, PVCs, Wenckebach. Mark every P wave.' },
    { step:3, title:'P waves', detail:'Present? Shape? One before every QRS? Upright in II, inverted in aVR?' },
    { step:4, title:'PR interval', detail:'Measure from start of P to start of QRS. Normal 120–200 ms (3–5 small squares at 25mm/s).' },
    { step:5, title:'QRS complex', detail:'Width? Normal <120 ms. Morphology in V1 and V6. RSR\' = RBBB. Slurred S in lateral = LBBB.' },
    { step:6, title:'ST segment & T waves', detail:'Compare to TP baseline. Elevation in ≥2 contiguous leads? Depression? T-wave inversions? Hyperacute T?' },
    { step:7, title:'QT interval', detail:'Measure QTc. Prolonged >500 ms = risk of Torsades de Pointes (TdP).' },
    { step:8, title:'Overall interpretation', detail:'Combine all findings. State: Rate, Rhythm, Axis, Intervals, ST/T changes, and clinical correlation.' },
];

function renderECGGuide() {
    const rhythmEl = document.getElementById('ecg-rhythm-list');
    if (rhythmEl) {
        rhythmEl.innerHTML = ECG_RHYTHMS.map(r => `
            <div style="background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-4);">
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-2);">
                    <span style="font-size:var(--text-sm);font-weight:700;color:var(--forest);font-family:var(--font-display);">${r.name}</span>
                    <span style="font-size:0.65rem;font-weight:700;background:var(--moss);color:var(--forest);padding:0.1em 0.55em;border-radius:var(--radius-full);font-family:var(--font-body);">${r.rate}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-bottom:var(--space-2);">
                    <div style="font-size:0.65rem;font-family:var(--font-body);"><span style="color:var(--text-muted);font-weight:700;display:block;">P WAVE</span><span style="color:var(--text-primary);">${r.p}</span></div>
                    <div style="font-size:0.65rem;font-family:var(--font-body);"><span style="color:var(--text-muted);font-weight:700;display:block;">PR</span><span style="color:var(--text-primary);">${r.pr}</span></div>
                    <div style="font-size:0.65rem;font-family:var(--font-body);"><span style="color:var(--text-muted);font-weight:700;display:block;">QRS</span><span style="color:var(--text-primary);">${r.qrs}</span></div>
                </div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);font-family:var(--font-body);padding:var(--space-2) var(--space-3);background:var(--parchment);border-radius:var(--radius-md);border-left:3px solid var(--sage);">${r.notes}</div>
            </div>`).join('');
    }
    const intEl = document.getElementById('ecg-interval-list');
    if (intEl) {
        intEl.innerHTML = ECG_INTERVALS.map(i => `
            <div style="background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-4);">
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--forest);font-family:var(--font-display);margin-bottom:var(--space-2);">${i.name}</div>
                <div style="font-size:var(--text-xs);font-family:var(--font-body);margin-bottom:var(--space-2);"><span style="color:var(--success);font-weight:700;">Normal: </span><span style="color:var(--text-primary);">${i.normal}</span></div>
                <div style="font-size:var(--text-xs);font-family:var(--font-body);padding:var(--space-2) var(--space-3);background:var(--warning-bg);border-radius:var(--radius-md);border-left:3px solid var(--warning);"><span style="color:var(--warning);font-weight:700;">Abnormal: </span><span style="color:var(--text-primary);">${i.abnormal}</span></div>
            </div>`).join('');
    }
    const appEl = document.getElementById('ecg-approach-list');
    if (appEl) {
        appEl.innerHTML = ECG_APPROACH.map(s => `
            <div style="display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-4);background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-lg);">
                <div style="width:2rem;height:2rem;border-radius:50%;background:var(--forest);color:white;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:var(--text-sm);flex-shrink:0;">${s.step}</div>
                <div><div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);font-family:var(--font-body);margin-bottom:4px;">${s.title}</div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);font-family:var(--font-body);line-height:1.6;">${s.detail}</div></div>
            </div>`).join('');
    }
}

window.calcQTc = function() {
    const qt = parseFloat(document.getElementById('qtc-qt').value);
    const rr = parseFloat(document.getElementById('qtc-rr').value);
    if (!qt || !rr) { showToast('Enter QT and RR intervals', 'warning'); return; }
    const qtc = qt / Math.sqrt(rr / 1000);
    const resEl = document.getElementById('qtc-result');
    const valEl = document.getElementById('qtc-value');
    const noteEl = document.getElementById('qtc-note');
    if (!resEl) return;
    resEl.style.display = '';
    valEl.textContent = `${Math.round(qtc)} ms`;
    let status, note;
    if (qtc > 500) { status='result-danger'; note='Critically prolonged — high risk of Torsades de Pointes. Review QT-prolonging drugs, electrolytes (K+, Mg2+, Ca2+).'; }
    else if (qtc > 460) { status='result-warning'; note='Prolonged — monitor, review medications and electrolytes.'; }
    else { status='result-normal'; note='Within normal limits (Men <440 ms, Women <460 ms).'; }
    resEl.className = `result-display show ${status}`;
    noteEl.textContent = note;
    addToHistory('ECG','QTc',`${Math.round(qtc)} ms`);
};

document.addEventListener('DOMContentLoaded', renderECGGuide);

/* crash cart */
const CRASH_DRUGS = [
    { name:'Adrenaline (Epinephrine)', adult:'1 mg IV q3-5 min', peds:'0.01 mg/kg IV (max 1 mg)', dose_fn: w=>`${(0.01*w).toFixed(2)} mg (${(0.1*w).toFixed(1)} mL of 1:10000)`, category:'Cardiac Arrest', color:'var(--danger)' },
    { name:'Amiodarone', adult:'300 mg IV (VF/pVT)', peds:'5 mg/kg IV', dose_fn: w=>`${(5*w).toFixed(0)} mg`, category:'Antiarrhythmic', color:'var(--amber)' },
    { name:'Atropine', adult:'0.5–1 mg IV, repeat to 3 mg', peds:'0.02 mg/kg IV (min 0.1 mg)', dose_fn: w=>`${Math.max(0.1,(0.02*w)).toFixed(2)} mg`, category:'Bradycardia', color:'var(--sage)' },
    { name:'Adenosine', adult:'6 mg rapid IVP, then 12 mg', peds:'0.1 mg/kg (max 6 mg)', dose_fn: w=>`${Math.min(6,(0.1*w)).toFixed(1)} mg rapid IVP`, category:'SVT', color:'var(--sage)' },
    { name:'Calcium Chloride 10%', adult:'5–10 mL IV (500–1000 mg)', peds:'0.2 mL/kg IV (20 mg/kg)', dose_fn: w=>`${(0.2*w).toFixed(1)} mL (${(20*w).toFixed(0)} mg)`, category:'Hyperkalaemia/Ca2+', color:'var(--warning)' },
    { name:'Sodium Bicarbonate 8.4%', adult:'50–100 mmol IV', peds:'1 mmol/kg IV', dose_fn: w=>`${(1*w).toFixed(0)} mmol (${(1*w).toFixed(0)} mL of 8.4%)`, category:'Severe Acidosis', color:'var(--warning)' },
    { name:'Dextrose 50%', adult:'50 mL (25 g) IV', peds:'2–5 mL/kg D10W', dose_fn: w=>`${(2*w).toFixed(0)}–${(5*w).toFixed(0)} mL of D10W`, category:'Hypoglycaemia', color:'var(--amber)' },
    { name:'Magnesium Sulfate', adult:'1–2 g IV (TdP), 4–6 g (eclampsia)', peds:'25–50 mg/kg IV', dose_fn: w=>`${(25*w).toFixed(0)}–${(50*w).toFixed(0)} mg`, category:'TdP / Eclampsia', color:'var(--sage)' },
    { name:'Naloxone', adult:'0.4–2 mg IV/IM/IN q2-3 min', peds:'0.01 mg/kg IV (max 0.1 mg/kg)', dose_fn: w=>`${(0.01*w).toFixed(3)} mg IV`, category:'Opioid Reversal', color:'var(--forest)' },
    { name:'Midazolam (Seizure)', adult:'5–10 mg IM/IV', peds:'0.1–0.2 mg/kg IM (max 10 mg)', dose_fn: w=>`${(0.15*w).toFixed(1)} mg (range ${(0.1*w).toFixed(1)}–${Math.min(10,(0.2*w)).toFixed(1)} mg)`, category:'Seizure', color:'var(--amber)' },
    { name:'Hydrocortisone', adult:'200 mg IV', peds:'2–4 mg/kg IV (max 200 mg)', dose_fn: w=>`${Math.min(200,(3*w)).toFixed(0)} mg IV`, category:'Anaphylaxis / Adrenal', color:'var(--sage)' },
];

window.renderCrashCart = function() {
    const weight = parseFloat(document.getElementById('crash-weight')?.value) || 0;
    const list = document.getElementById('crash-cart-list');
    if (!list) return;
    list.innerHTML = CRASH_DRUGS.map(d => {
        const doseCalc = weight > 0 ? `<div style="font-size:var(--text-sm);font-weight:700;color:${d.color};font-family:var(--font-display);margin-top:var(--space-1);">→ ${d.dose_fn(weight)}</div>` : '';
        return `<div style="background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-4);">
            <div style="display:flex;align-items:flex-start;gap:var(--space-3);flex-wrap:wrap;">
                <div style="flex:1;min-width:0;">
                    <span style="font-size:0.65rem;font-weight:700;background:var(--parchment);color:var(--text-muted);padding:0.1em 0.55em;border-radius:var(--radius-full);font-family:var(--font-body);border:1px solid var(--border);">${d.category}</span>
                    <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);font-family:var(--font-body);margin-top:var(--space-1);">${d.name}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-secondary);font-family:var(--font-body);margin-top:2px;">${d.adult}</div>
                    ${doseCalc}
                </div>
            </div>
        </div>`;
    }).join('');
    // Autofill label
    const lbl = document.getElementById('crash-weight-autofill');
    if (lbl) lbl.textContent = '';
};

document.addEventListener('DOMContentLoaded', () => {
    const p = getPatientProfile ? getPatientProfile() : null;
    if (p?.weight) {
        const el = document.getElementById('crash-weight');
        if (el && !el.value) { el.value = p.weight; const lbl = document.getElementById('crash-weight-autofill'); if(lbl) lbl.textContent='← from patient'; renderCrashCart(); }
    }
    renderCrashCart();
});

/* iv compatibility */
// C=Compatible, I=Incompatible, U=Unknown/variable, V=Variable
const IV_DRUGS = ['Norepinephrine','Epinephrine','Dopamine','Dobutamine','Amiodarone','Heparin','Insulin','Morphine','Fentanyl','Midazolam','Propofol','Vancomycin','Piperacillin-Taz','Meropenem','Furosemide','Potassium Cl','Magnesium SO4','Ondansetron'];

const IV_COMPAT = {
    'Norepinephrine-Epinephrine':'C','Norepinephrine-Dopamine':'C','Norepinephrine-Dobutamine':'C',
    'Norepinephrine-Amiodarone':'C','Norepinephrine-Heparin':'C','Norepinephrine-Insulin':'C',
    'Norepinephrine-Morphine':'C','Norepinephrine-Fentanyl':'C','Norepinephrine-Midazolam':'C',
    'Norepinephrine-Propofol':'C','Norepinephrine-Vancomycin':'C','Norepinephrine-Furosemide':'I',
    'Norepinephrine-Potassium Cl':'C','Norepinephrine-Magnesium SO4':'C','Norepinephrine-Ondansetron':'C',
    'Epinephrine-Dopamine':'C','Epinephrine-Dobutamine':'C','Epinephrine-Amiodarone':'C',
    'Epinephrine-Heparin':'C','Epinephrine-Insulin':'C','Epinephrine-Morphine':'C',
    'Epinephrine-Midazolam':'C','Epinephrine-Propofol':'C','Epinephrine-Vancomycin':'C',
    'Epinephrine-Furosemide':'I','Epinephrine-Ondansetron':'C',
    'Dopamine-Dobutamine':'C','Dopamine-Amiodarone':'C','Dopamine-Heparin':'C',
    'Dopamine-Insulin':'C','Dopamine-Morphine':'C','Dopamine-Fentanyl':'C',
    'Dopamine-Midazolam':'C','Dopamine-Propofol':'C','Dopamine-Vancomycin':'C',
    'Dopamine-Furosemide':'I','Dopamine-Potassium Cl':'C','Dopamine-Ondansetron':'C',
    'Amiodarone-Heparin':'I','Amiodarone-Morphine':'C','Amiodarone-Midazolam':'C',
    'Amiodarone-Propofol':'I','Amiodarone-Vancomycin':'C','Amiodarone-Furosemide':'I',
    'Amiodarone-Potassium Cl':'C','Amiodarone-Ondansetron':'I',
    'Heparin-Insulin':'C','Heparin-Morphine':'C','Heparin-Fentanyl':'C',
    'Heparin-Midazolam':'I','Heparin-Vancomycin':'I','Heparin-Furosemide':'C',
    'Heparin-Potassium Cl':'C','Heparin-Magnesium SO4':'C','Heparin-Ondansetron':'I',
    'Insulin-Morphine':'C','Insulin-Fentanyl':'C','Insulin-Midazolam':'C',
    'Insulin-Propofol':'C','Insulin-Vancomycin':'C','Insulin-Furosemide':'C',
    'Insulin-Potassium Cl':'C','Insulin-Ondansetron':'C',
    'Morphine-Fentanyl':'C','Morphine-Midazolam':'C','Morphine-Propofol':'C',
    'Morphine-Vancomycin':'C','Morphine-Furosemide':'I','Morphine-Ondansetron':'C',
    'Fentanyl-Midazolam':'C','Fentanyl-Propofol':'C','Fentanyl-Vancomycin':'C',
    'Fentanyl-Furosemide':'I','Fentanyl-Ondansetron':'C',
    'Midazolam-Propofol':'C','Midazolam-Vancomycin':'C','Midazolam-Furosemide':'I',
    'Midazolam-Potassium Cl':'C','Midazolam-Ondansetron':'C',
    'Propofol-Vancomycin':'C','Propofol-Furosemide':'I','Propofol-Ondansetron':'C',
    'Propofol-Potassium Cl':'C','Propofol-Magnesium SO4':'C',
    'Vancomycin-Piperacillin-Taz':'I','Vancomycin-Meropenem':'C','Vancomycin-Furosemide':'I',
    'Vancomycin-Potassium Cl':'C','Vancomycin-Ondansetron':'C',
    'Piperacillin-Taz-Meropenem':'U','Piperacillin-Taz-Furosemide':'C','Piperacillin-Taz-Vancomycin':'I',
    'Meropenem-Furosemide':'I','Meropenem-Vancomycin':'C','Meropenem-Ondansetron':'C',
    'Furosemide-Potassium Cl':'C','Furosemide-Magnesium SO4':'C','Furosemide-Ondansetron':'I',
    'Potassium Cl-Magnesium SO4':'C','Potassium Cl-Ondansetron':'C',
    'Magnesium SO4-Ondansetron':'C',
};

function getCompat(a,b) {
    return IV_COMPAT[`${a}-${b}`] || IV_COMPAT[`${b}-${a}`] || 'U';
}

function initCompatMatrix() {
    const s1 = document.getElementById('compat-drug1');
    const s2 = document.getElementById('compat-drug2');
    if (!s1 || !s2) return;
    IV_DRUGS.forEach(d => {
        s1.innerHTML += `<option value="${d}">${d}</option>`;
        s2.innerHTML += `<option value="${d}">${d}</option>`;
    });
    renderCompatMatrix();
}

window.checkCompat = function() {
    const a = document.getElementById('compat-drug1')?.value;
    const b = document.getElementById('compat-drug2')?.value;
    const resEl = document.getElementById('compat-result');
    const verdictEl = document.getElementById('compat-verdict');
    const noteEl = document.getElementById('compat-note');
    if (!a || !b || a === b) { if(resEl) resEl.style.display='none'; return; }
    const c = getCompat(a, b);
    if(resEl) resEl.style.display='';
    const info = {
        'C': { text:'Compatible', status:'result-normal', note:'Generally compatible in Y-site or same line. Verify concentration and diluent.' },
        'I': { text:'Incompatible', status:'result-danger', note:'Do NOT mix or co-administer in same line. Use separate IV lines or flush between.' },
        'V': { text:'Variable', status:'result-warning', note:'Compatibility depends on concentration. Consult pharmacy or Trissel\'s.' },
        'U': { text:'Unknown / No data', status:'result-neutral', note:'No sufficient data. Consult pharmacy before co-administering.' },
    }[c] || { text:'Unknown', status:'result-neutral', note:'Consult pharmacy.' };
    if(resEl) { resEl.className = `result-display show ${info.status}`; resEl.style.display=''; }
    if(verdictEl) verdictEl.textContent = info.text;
    if(noteEl) noteEl.textContent = info.note;
};

function renderCompatMatrix() {
    const el = document.getElementById('compat-matrix');
    if (!el) return;
    const drugs = IV_DRUGS.slice(0, 12); // top 12 for matrix size
    const colors = { C:'#c8f7c5', I:'#ffc8c8', V:'#fff3c8', U:'#e8e8e8' };
    const labels = { C:'C', I:'✗', V:'V', U:'?' };
    let html = '<table style="border-collapse:collapse;font-size:0.6rem;font-family:var(--font-body);">';
    html += '<tr><th style="padding:3px;"></th>';
    drugs.forEach(d => html += `<th style="padding:3px 2px;writing-mode:vertical-rl;text-orientation:mixed;white-space:nowrap;font-weight:700;color:var(--text-secondary);max-height:80px;">${d.substring(0,10)}</th>`);
    html += '</tr>';
    drugs.forEach((a,i) => {
        html += `<tr><td style="padding:3px 4px;font-weight:700;color:var(--text-secondary);white-space:nowrap;">${a.substring(0,12)}</td>`;
        drugs.forEach((b,j) => {
            if (i === j) { html += `<td style="background:#f0f0f0;text-align:center;padding:2px;"></td>`; return; }
            if (i > j) { const c=getCompat(a,b); html += `<td style="background:${colors[c]};text-align:center;padding:2px;font-weight:700;color:#333;cursor:default;" title="${a} + ${b}: ${c==='C'?'Compatible':c==='I'?'Incompatible':'Variable/Unknown'}">${labels[c]}</td>`; }
            else { html += `<td style="background:transparent;"></td>`; }
        });
        html += '</tr>';
    });
    html += '</table><div style="display:flex;gap:var(--space-3);margin-top:var(--space-3);flex-wrap:wrap;">';
    [['C','Compatible','#c8f7c5'],['I','Incompatible','#ffc8c8'],['V','Variable','#fff3c8'],['?','Unknown','#e8e8e8']].forEach(([l,t,c])=>{ html+=`<span style="display:flex;align-items:center;gap:4px;font-size:0.65rem;font-family:var(--font-body);color:var(--text-muted);"><span style="display:inline-block;width:12px;height:12px;background:${c};border:1px solid #ccc;border-radius:2px;"></span>${l} = ${t}</span>`; });
    html += '</div>';
    el.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initCompatMatrix);

/* swipe to switch tabs (mobile) */
(function() {
    let swipeStartX = 0, swipeStartY = 0;
    const THRESHOLD = 60, ANGLE_MAX = 35;
    const TAB_ORDER = ['timer','dosage','iv','vitals','assessment','pediatric','lab','convert','reference','notes','drugs','io','handover','meddue','news2','qsofa','ecg','crashcart','ivcompat'];

    document.addEventListener('touchstart', e => {
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (window.innerWidth > 640) return;
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        if (Math.abs(dy) / Math.abs(dx) > Math.tan(ANGLE_MAX * Math.PI / 180)) return;
        if (Math.abs(dx) < THRESHOLD) return;
        // Don't swipe within inputs, editors or scrollable elements
        const tgt = e.target;
        if (tgt.closest('input,textarea,[contenteditable],.notes-editor,.more-sheet,.glove-panel')) return;
        const activePanel = document.querySelector('.calc-card.active');
        if (!activePanel) return;
        const curTab = activePanel.id.replace('panel-','');
        const idx = TAB_ORDER.indexOf(curTab);
        if (idx === -1) return;
        const nextIdx = dx < 0 ? Math.min(idx+1, TAB_ORDER.length-1) : Math.max(idx-1, 0);
        if (nextIdx === idx) return;
        const nextTab = TAB_ORDER[nextIdx];
        if (window.switchToTab) window.switchToTab(nextTab);
        if (window.updateMobileNav) window.updateMobileNav(nextTab);
    }, { passive: true });
})();

/* pwa install prompt */
(function() {
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        // Show nudge after 30s if not already installed
        const installed = window.matchMedia('(display-mode: standalone)').matches;
        if (installed) return;
        const dismissed = localStorage.getItem('mc_install_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 86400000) return;
        setTimeout(() => showInstallNudge(), 30000);
    });

    function showInstallNudge() {
        const existing = document.getElementById('pwa-nudge');
        if (existing) return;
        const nudge = document.createElement('div');
        nudge.id = 'pwa-nudge';
        nudge.style.cssText = `position:fixed;bottom:calc(4.5rem + env(safe-area-inset-bottom,0px) + 0.75rem);left:50%;transform:translateX(-50%);background:var(--forest);color:#fff;padding:0.75rem 1.25rem;border-radius:var(--radius-full);font-family:var(--font-body);font-size:var(--text-xs);font-weight:700;display:flex;align-items:center;gap:0.75rem;box-shadow:0 8px 32px rgba(45,90,39,0.4);z-index:8000;white-space:nowrap;max-width:90vw;`;
        nudge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M12 5v14M5 12l7-7 7 7"/></svg>Add to Home Screen for offline use<button id="pwa-install-btn" style="background:rgba(255,255,255,0.2);border:none;border-radius:var(--radius-md);color:#fff;padding:0.2rem 0.6rem;font-family:var(--font-body);font-size:var(--text-2xs);font-weight:700;cursor:pointer;margin-left:4px;">Install</button><button id="pwa-dismiss-btn" style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;padding:0.15rem;font-size:1rem;line-height:1;">×</button>`;
        document.body.appendChild(nudge);
        document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
            if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; }
            nudge.remove();
        });
        document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
            localStorage.setItem('mc_install_dismissed', Date.now().toString());
            nudge.remove();
        });
        // Auto-hide after 15s
        setTimeout(() => nudge.remove(), 15000);
    }
})();

/* feature: keyboard shortcuts panel */

// Keyboard shortcuts button visibility is handled by CSS below

window.toggleShortcutsPanel = function() {
    const panel   = document.getElementById('shortcuts-panel');
    const overlay = document.getElementById('shortcuts-overlay');
    if (!panel || !overlay) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display   = isOpen ? 'none' : '';
    overlay.style.display = isOpen ? 'none' : '';
    document.body.style.overflow = isOpen ? '' : 'hidden';
    if (!isOpen) {
        const closeBtn = panel.querySelector('button');
        if (closeBtn) setTimeout(() => closeBtn.focus(), 60);
    }
};

// Press ? or / to open shortcuts (only when not in an input)
document.addEventListener('keydown', function(e) {
    const active = document.activeElement;
    const inInput = active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        active.isContentEditable
    );
    if (inInput) return;

    if (e.key === '?' || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        toggleShortcutsPanel();
        return;
    }
    // Escape closes the panel if open
    if (e.key === 'Escape') {
        const panel = document.getElementById('shortcuts-panel');
        if (panel && panel.style.display !== 'none') {
            toggleShortcutsPanel();
        }
    }
});