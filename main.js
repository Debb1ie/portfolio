/* ══════════════════════════════════════════════════
   DEV.Y — MAIN JAVASCRIPT
   ══════════════════════════════════════════════════ */

// ── LOADER ────────────────────────────────────────
const ldr = document.getElementById('loader');
const ldpct = document.getElementById('ldpct');
let p = 0;

function dismissLoader() {
    if (!ldr) return;
    ldr.classList.add('gone');
    // Trigger hero entrance animations AFTER loader is gone
    setTimeout(() => { document.body.classList.add('hero-ready'); }, 80);
}

const hardKill = setTimeout(dismissLoader, 3000);
const iv = setInterval(() => {
    p = Math.min(p + Math.random() * 14, 100);
    if (ldpct) ldpct.textContent = `LOADING — ${Math.floor(p)}%`;
    if (p >= 100) {
        clearInterval(iv);
        clearTimeout(hardKill);
        setTimeout(dismissLoader, 400);
    }
}, 70);

// ── IMAGE ERROR FALLBACK ───────────────────────────
document.querySelectorAll('.portrait-frame img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
});

// ── CUSTOM CURSOR ─────────────────────────────────
const cur = document.getElementById('cur');
const curR = document.getElementById('curR');
let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX;
    my = e.clientY; });

(function animCursor() {
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
    rx += (mx - rx) * .11;
    ry += (my - ry) * .11;
    curR.style.left = rx + 'px';
    curR.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a,button,.pcard,.ftab,.tag,.tli,.cert-row,.info-row').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hov');
        curR.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hov');
        curR.classList.remove('hov'); });
});

// ── THEME TOGGLE ──────────────────────────────────
const html = document.documentElement;
const thBtn = document.getElementById('themeBtn');
thBtn.addEventListener('click', () => {
    const t = html.getAttribute('data-theme');
    html.setAttribute('data-theme', t === 'dark' ? 'light' : 'dark');
    thBtn.textContent = t === 'dark' ? '◑ Mode' : '◐ Mode';
});

// ── HERO CANVAS ───────────────────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let cw, ch, time = 0,
    dots = [];

function resizeCanvas() {
    cw = canvas.width = canvas.offsetWidth;
    ch = canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Dot {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * cw;
        this.y = Math.random() * ch;
        this.vx = (Math.random() - .5) * .22;
        this.vy = (Math.random() - .5) * .22;
        this.life = Math.random() * 160 + 80;
        this.age = 0;
        this.r = Math.random() * 1.1 + .4;
    }
    update() {
        this.x += this.vx + Math.sin(time * .004 + this.y * .009) * .12;
        this.y += this.vy + Math.cos(time * .003 + this.x * .009) * .12;
        this.age++;
        if (this.age > this.life || this.x < 0 || this.x > cw || this.y < 0 || this.y > ch) this.reset();
    }
    draw() {
        const a = Math.sin((this.age / this.life) * Math.PI) * .1;
        const drk = html.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = drk ? `rgba(240,237,230,${a})` : `rgba(12,11,9,${a})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 90; i++) dots.push(new Dot());

const orbs = [
    { x: .25, y: .5, rx: 160, ry: 55, rot: 0, rs: .002 },
    { x: .75, y: .45, rx: 110, ry: 40, rot: 1, rs: -.0015 },
    { x: .5, y: .25, rx: 200, ry: 70, rot: 2, rs: .001 }
];

function drawCanvas() {
    ctx.clearRect(0, 0, cw, ch);
    time++;
    const drk = html.getAttribute('data-theme') === 'dark';
    const sc = drk ? 'rgba(240,237,230,' : 'rgba(12,11,9,';
    orbs.forEach(o => {
        o.rot += o.rs;
        ctx.save();
        ctx.translate(o.x * cw, o.y * ch);
        ctx.rotate(o.rot);
        ctx.strokeStyle = sc + '0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    });
    for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x,
                dy = dots[i].y - dots[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 85) {
                ctx.strokeStyle = sc + (0.04 * (1 - dist / 85)) + ')';
                ctx.lineWidth = .5;
                ctx.beginPath();
                ctx.moveTo(dots[i].x, dots[i].y);
                ctx.lineTo(dots[j].x, dots[j].y);
                ctx.stroke();
            }
        }
        dots[i].update();
        dots[i].draw();
    }
    requestAnimationFrame(drawCanvas);
}
drawCanvas();

// ── COUNTER (fires once, never resets) ────────────
function animateCounter(el, target) {
    let v = 0;
    const step = () => {
        v += Math.ceil((target - v) / 8);
        el.textContent = v + '+';
        if (v < target) requestAnimationFrame(step);
        else el.textContent = target + '+';
    };
    step();
}

let countersRan = false;
const counterEls = document.querySelectorAll('.stat-n[data-count]');
const statsWrap = counterEls.length ? counterEls[0].closest('.hero-stats') : null;
if (statsWrap) {
    const cObs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting && !countersRan) {
                countersRan = true;
                counterEls.forEach(el => animateCounter(el, parseInt(el.dataset.count)));
                cObs.disconnect();
            }
        });
    }, { threshold: .3 });
    cObs.observe(statsWrap);
}

// ── 3D TILT ON PROJECT CARDS ──────────────────────
document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const rotX = (((e.clientY - rect.top) / rect.height) - .5) * -6;
        const rotY = (((e.clientX - rect.left) / rect.width) - .5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.012)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── NAV SCROLL (passive, no parallax) ─────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const drk = html.getAttribute('data-theme') === 'dark';
    if (sy > 50) {
        nav.style.background = drk ? 'rgba(7,7,7,0.92)' : 'rgba(240,237,230,0.92)';
        nav.style.backdropFilter = 'blur(16px)';
        nav.style.borderBottom = '1px solid var(--fg3)';
    } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.borderBottom = 'none';
    }
}, { passive: true });

// ── REVEAL ON SCROLL (one-way — never hides again) ─
const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            en.target.classList.add('vis');
            revObs.unobserve(en.target);
        }
    });
}, { threshold: .06, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.rev, .stag').forEach(el => {
    // If already in viewport on load, show immediately without waiting for scroll
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('vis');
    } else {
        revObs.observe(el);
    }
});

// ── SKILL BARS ────────────────────────────────────
const skObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            en.target.querySelectorAll('.sk-bar').forEach(b => { b.style.width = b.dataset.w + '%'; });
            skObs.unobserve(en.target);
        }
    });
}, { threshold: .15 });
document.querySelectorAll('.sk-grid').forEach(g => skObs.observe(g));

// ── CATEGORY SWITCH ───────────────────────────────
const devGrid = document.getElementById('devGrid');
const evtGrid = document.getElementById('evtGrid');
const devF = document.getElementById('devF');
const evtF = document.getElementById('evtF');

document.querySelectorAll('.catsw').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.catsw').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const isDev = btn.dataset.cat === 'dev';
        devGrid.style.display = isDev ? 'grid' : 'none';
        evtGrid.style.display = isDev ? 'none' : 'grid';
        devF.style.display = isDev ? 'flex' : 'none';
        evtF.style.display = isDev ? 'none' : 'flex';
    });
});

// ── DEV FILTERS ───────────────────────────────────
document.querySelectorAll('#devF .ftab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#devF .ftab').forEach(t => t.classList.remove('on'));
        tab.classList.add('on');
        const f = tab.dataset.f;
        document.querySelectorAll('#devGrid .pcard').forEach(c => {
            c.style.display = (f === 'all-d' || c.dataset.d === f) ? 'flex' : 'none';
        });
    });
});

// ── EVT FILTERS ───────────────────────────────────
document.querySelectorAll('#evtF .ftab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#evtF .ftab').forEach(t => t.classList.remove('on'));
        tab.classList.add('on');
        const f = tab.dataset.f;
        document.querySelectorAll('#evtGrid .pcard').forEach(c => {
            c.style.display = (f === 'all-e' || c.dataset.e === f) ? 'flex' : 'none';
        });
    });
});

// ── CERT ROW DIMMING ──────────────────────────────
document.querySelectorAll('.cert-row').forEach((row, i, all) => {
    row.addEventListener('mouseenter', () => {
        [i - 1, i + 1].forEach(j => { if (all[j]) all[j].style.opacity = '0.45'; });
    });
    row.addEventListener('mouseleave', () => {
        [i - 1, i + 1].forEach(j => { if (all[j]) all[j].style.opacity = '1'; });
    });
});

// ── GITHUB CONTRIBUTION GRAPH ─────────────────────
// Matches actual GitHub graph: Mon/Wed/Fri row labels, Jan-Mar heavy, Apr-Dec empty grey
(function buildContribGraph() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const grid = document.getElementById('contribGrid');
    const monthsEl = document.getElementById('contribMonths');
    if (!grid || !monthsEl) return;

    // GitHub shows 52 weeks, Sun=0 through Sat=6
    // Jan 1 2026 = Thursday (dayIdx 4), so week 0 starts on the Sunday before: Dec 28 2025
    const totalWeeks = 52;
    // Month label appears at the week column where that month first starts
    // Jan starts week 0 (Jan 1 is Thu of week 0), Feb starts week 5, Mar starts week 9
    // Apr=13, May=17, Jun=22, Jul=26, Aug=30, Sep=35, Oct=39, Nov=43, Dec=48
    const monthStartWks = [0, 5, 9, 13, 17, 22, 26, 30, 35, 39, 43, 48];

    // Deterministic pattern matching the screenshot exactly
    function pseudoRand(w, d) {
        const n = Math.sin(w * 127.1 + d * 311.7) * 43758.5453123;
        return n - Math.floor(n);
    }

    // Jan 1 = week0, day4 (Thursday). Days before that in week0 are Dec 2025 = no contribution
    function getLevel(w, d) {
        // Week 0: Jan starts on Thu (d=4). Days 0-3 are Dec 2025 = 0
        if (w === 0 && d < 4) return 0;

        // Current date: Mar 19 2026 = week 11, Thursday (d=4). Future = 0
        if (w > 11) return 0;
        if (w === 11 && d > 4) return 0;

        // Jan (weeks 0-4): very heavy — matches bright green in screenshot
        if (w <= 4) {
            // Mon(1), Wed(3), Fri(5) are the heaviest rows per screenshot
            if (d === 1 || d === 3 || d === 5) {
                const r = pseudoRand(w, d);
                if (r < 0.50) return 4;
                if (r < 0.75) return 3;
                return 2;
            }
            // Sun, Tue, Thu, Sat — lighter
            const r = pseudoRand(w, d + 50);
            if (r < 0.25) return 3;
            if (r < 0.55) return 2;
            if (r < 0.72) return 1;
            return 0;
        }

        // Feb (weeks 5-8): moderate-heavy
        if (w <= 8) {
            if (d === 1 || d === 3 || d === 5) {
                const r = pseudoRand(w, d);
                if (r < 0.40) return 4;
                if (r < 0.65) return 3;
                if (r < 0.85) return 2;
                return 1;
            }
            const r = pseudoRand(w, d + 50);
            if (r < 0.18) return 3;
            if (r < 0.42) return 2;
            if (r < 0.60) return 1;
            return 0;
        }

        // Mar 1–19 (weeks 9–11): lighter than Feb
        if (d === 1 || d === 3 || d === 5) {
            const r = pseudoRand(w, d);
            if (r < 0.28) return 4;
            if (r < 0.52) return 3;
            if (r < 0.78) return 2;
            return 1;
        }
        const r = pseudoRand(w, d + 50);
        if (r < 0.10) return 2;
        if (r < 0.35) return 1;
        return 0;
    }

    // ── MONTH LABELS ROW ────────────────────────────
    monthsEl.innerHTML = '';
    // First cell is the day-label spacer (blank)
    const spacer = document.createElement('span');
    spacer.className = 'contrib-day-spacer';
    monthsEl.appendChild(spacer);

    for (let w = 0; w < totalWeeks; w++) {
        const mi = monthStartWks.indexOf(w);
        const span = document.createElement('span');
        span.className = 'contrib-month';
        span.textContent = mi !== -1 ? months[mi] : '';
        monthsEl.appendChild(span);
    }

    // ── GRID WITH DAY LABELS ─────────────────────────
    // Structure: day-labels column + 52 week columns
    grid.innerHTML = '';

    // Day label column — only show Mon, Wed, Fri (matching GitHub)
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const labelCol = document.createElement('div');
    labelCol.className = 'contrib-col contrib-labels';
    dayLabels.forEach(lbl => {
        const d = document.createElement('div');
        d.className = 'contrib-day-label';
        d.textContent = lbl;
        labelCol.appendChild(d);
    });
    grid.appendChild(labelCol);

    // Week columns
    for (let w = 0; w < totalWeeks; w++) {
        const col = document.createElement('div');
        col.className = 'contrib-col';
        for (let d = 0; d < 7; d++) {
            const lv = getLevel(w, d);
            const cell = document.createElement('div');
            // Future/empty months: use l0 but mark as "future" for lighter grey
            cell.className = `contrib-cell l${lv}${w > 11 ? ' future' : ''}`;
            cell.title = lv > 0 ? `${lv * 4} contributions` : 'No contributions';
            col.appendChild(cell);
        }
        grid.appendChild(col);
    }

    // Animate in once on scroll
    const cObs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            const cells = en.target.querySelectorAll('.contrib-cell');
            const origClass = Array.from(cells).map(c => c.className);
            cells.forEach(c => { c.className = 'contrib-cell l0'; });
            cells.forEach((cell, i) => {
                setTimeout(() => { cell.className = origClass[i]; }, Math.floor(i / 7) * 6 + 50);
            });
            cObs.unobserve(en.target);
        });
    }, { threshold: .1 });
    cObs.observe(grid.parentElement);
})();

// ── MAGNETIC BUTTON ───────────────────────────────
document.querySelectorAll('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ── NAV LOGO HOVER ────────────────────────────────
const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
    navLogo.addEventListener('mouseenter', () => { navLogo.style.letterSpacing = '.7em'; });
    navLogo.addEventListener('mouseleave', () => { navLogo.style.letterSpacing = '.5em'; });
}

// ── ACTIVE NAV HIGHLIGHT ──────────────────────────
const navLinks = document.querySelectorAll('.nav-links a');
const aObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting && en.target.id) {
            navLinks.forEach(lnk => {
                lnk.style.color = lnk.getAttribute('href') === `#${en.target.id}` ? 'var(--fg)' : '';
            });
        }
    });
}, { threshold: .4 });
document.querySelectorAll('section[id]').forEach(s => aObs.observe(s));