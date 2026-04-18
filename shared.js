/* ========== MX1 EXCHANGE — SHARED JS ========== */

// ---------- Auth / session (fake, localStorage-backed) ----------
const MX1 = {
  get session() {
    try { return JSON.parse(localStorage.getItem('mx1_session')); } catch { return null; }
  },
  set session(v) {
    if (v) localStorage.setItem('mx1_session', JSON.stringify(v));
    else localStorage.removeItem('mx1_session');
  },
  login(email, name) {
    const user = {
      email,
      name: name || email.split('@')[0],
      uid: '84729301',
      initials: (name || email.split('@')[0]).slice(0, 2).toUpperCase(),
      kycLevel: 1,
      balance: 30452.18,
      loggedInAt: Date.now()
    };
    this.session = user;
    return user;
  },
  logout() { this.session = null; window.location.href = 'login.html'; },

  requireAuth() {
    if (!this.session) {
      window.location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'index.html');
      return false;
    }
    return true;
  }
};

// ---------- Market data (used by multiple pages) ----------
const MARKETS = [
  { s: 'BTC',   q: 'USDT', p: 88508.76, c: -2.16, vol: 2810000000, hi: 90278.93, lo: 85853.49, name: 'Bitcoin',    icon: '₿',  color: '#f7931a' },
  { s: 'ETH',   q: 'USDT', p: 3214.52,  c:  1.34, vol: 1240000000, hi: 3290.10,  lo: 3160.40,  name: 'Ethereum',   icon: 'Ξ',  color: '#627eea' },
  { s: 'SOL',   q: 'USDT', p: 184.37,   c:  3.82, vol:  680000000, hi: 188.40,   lo: 176.20,   name: 'Solana',     icon: '◎',  color: '#14f195' },
  { s: 'BNB',   q: 'USDT', p: 612.44,   c:  0.21, vol:  420000000, hi: 618.30,   lo: 604.10,   name: 'BNB',        icon: 'BNB',color: '#f3ba2f' },
  { s: 'XRP',   q: 'USDT', p: 2.38,     c: -0.89, vol:  310000000, hi: 2.44,     lo: 2.33,     name: 'Ripple',     icon: 'XRP',color: '#0085c0' },
  { s: 'DOGE',  q: 'USDT', p: 0.395,    c: -2.21, vol:  280000000, hi: 0.410,    lo: 0.388,    name: 'Dogecoin',   icon: 'Ð',  color: '#c3a634' },
  { s: 'ADA',   q: 'USDT', p: 1.05,     c: -1.45, vol:  190000000, hi: 1.09,     lo: 1.03,     name: 'Cardano',    icon: 'ADA',color: '#0033ad' },
  { s: 'AVAX',  q: 'USDT', p: 42.60,    c: -2.34, vol:  150000000, hi: 44.20,    lo: 41.80,    name: 'Avalanche',  icon: 'AVX',color: '#e84142' },
  { s: 'LINK',  q: 'USDT', p: 26.90,    c: -1.56, vol:  140000000, hi: 27.80,    lo: 26.50,    name: 'Chainlink',  icon: 'LNK',color: '#2a5ada' },
  { s: 'DOT',   q: 'USDT', p: 7.85,     c: -0.78, vol:  120000000, hi: 7.98,     lo: 7.72,     name: 'Polkadot',   icon: 'DOT',color: '#e6007a' },
  { s: 'MATIC', q: 'USDT', p: 0.812,    c:  0.92, vol:  110000000, hi: 0.824,    lo: 0.798,    name: 'Polygon',    icon: 'MTC',color: '#8247e5' },
  { s: 'ARB',   q: 'USDT', p: 1.24,     c:  2.18, vol:   95000000, hi: 1.27,     lo: 1.20,     name: 'Arbitrum',   icon: 'ARB',color: '#28a0f0' },
  { s: 'OP',    q: 'USDT', p: 2.67,     c: -1.04, vol:   88000000, hi: 2.72,     lo: 2.63,     name: 'Optimism',   icon: 'OP', color: '#ff0420' },
  { s: 'ATOM',  q: 'USDT', p: 8.92,     c:  0.56, vol:   72000000, hi: 9.04,     lo: 8.84,     name: 'Cosmos',     icon: 'ATM',color: '#2e3148' },
  { s: 'LTC',   q: 'USDT', p: 94.21,    c: -1.22, vol:   68000000, hi: 95.80,    lo: 93.10,    name: 'Litecoin',   icon: 'Ł',  color: '#bfbbbb' },
  { s: 'NEAR',  q: 'USDT', p: 5.44,     c:  1.87, vol:   55000000, hi: 5.52,     lo: 5.32,     name: 'NEAR',       icon: 'NR', color: '#00ec97' },
  { s: 'APT',   q: 'USDT', p: 11.23,    c:  2.45, vol:   48000000, hi: 11.40,    lo: 10.95,    name: 'Aptos',      icon: 'APT',color: '#06f' },
  { s: 'SUI',   q: 'USDT', p: 4.12,     c:  5.12, vol:   44000000, hi: 4.20,     lo: 3.92,     name: 'Sui',        icon: 'SUI',color: '#4ba2ff' },
  { s: 'TRX',   q: 'USDT', p: 0.234,    c: -0.42, vol:   38000000, hi: 0.238,    lo: 0.232,    name: 'Tron',       icon: 'TRX',color: '#ff060a' },
  { s: 'FIL',   q: 'USDT', p: 5.82,     c: -1.88, vol:   30000000, hi: 5.95,     lo: 5.76,     name: 'Filecoin',   icon: 'FIL',color: '#0090ff' },
];

function fmtPrice(p) {
  if (p >= 1000) return p.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
}
function fmtVol(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toFixed(0);
}
function fmtUSD(v, dp = 2) {
  return '$' + v.toLocaleString(undefined, {minimumFractionDigits: dp, maximumFractionDigits: dp});
}

// ---------- Logo base64 (injected into topbars) ----------
let LOGO_DATA_URL = '';

// ---------- Topbar builder ----------
function buildTopbar(active) {
  const session = MX1.session;
  const userBlock = session
    ? `<div class="avatar-btn" onclick="showUserMenu(event)" title="${session.email}">${session.initials}</div>`
    : `<a href="login.html" class="btn-ghost">Log In</a>
       <a href="login.html?tab=signup" class="btn-primary">Sign Up</a>`;

  const depositBtn = session
    ? `<a href="portfolio.html" class="btn-primary">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
         Deposit
       </a>` : '';

  const html = `
    <header class="topbar">
      <a href="index.html" class="logo-wrap">
        <img src="${LOGO_DATA_URL}" alt="MX1" />
        <div class="logo-text">
          <span class="mark">MX1</span>
          <span class="sub">EXCHANGE</span>
        </div>
      </a>
      <nav class="nav-main">
        <a href="index.html"        class="${active==='trade'?'active':''}">Trade</a>
        <a href="copy-trading.html" class="${active==='copy'?'active':''}">Copy Trading</a>
        <a href="p2p.html"          class="${active==='p2p'?'active':''}">P2P</a>
        <a href="launchpad.html"    class="${active==='launchpad'?'active':''}">Launchpad</a>
        <a href="portfolio.html"    class="${active==='portfolio'?'active':''}">Portfolio</a>
      </nav>
      <div class="ticker-pill">
        <span class="dot"></span>
        <span style="color: var(--text-dim);">BTC SENTIMENT</span>
        <span style="font-family: var(--font-mono); color: var(--green-hi); font-weight: 600;">58%</span>
        <span style="color: var(--text-faint); font-size: 11px;">BULLISH</span>
      </div>
      <div class="nav-right">
        <button class="icon-btn" title="Search" onclick="openSearchModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button class="icon-btn theme-toggle" title="Toggle theme" onclick="toggleTheme()">
          <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
        </button>
        <button class="icon-btn" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
        ${depositBtn}
        ${userBlock}
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', html);
}

function buildFooter() {
  const html = `
    <footer class="footer">
      <span class="dot"></span>
      <span>Fusion Online</span>
      <span class="sep">·</span>
      <span>Last cycle: Sat 18 Apr · 21:43 UTC</span>
      <span class="sep">·</span>
      <span>Agents: <span style="color: var(--sky); font-family: var(--font-mono);">12/15</span></span>
      <span class="sep">·</span>
      <span>Avg confidence: <span style="color: var(--green-hi); font-family: var(--font-mono);">78%</span></span>
      <div class="right">
        <span>Kill Switch: <span style="color: var(--red-hi); font-weight: 600;">Inactive</span></span>
        <span class="sep">·</span>
        <span>API: <span style="color: var(--green-hi);">Nominal</span></span>
        <span class="sep">·</span>
        <span>UID: ${MX1.session?.uid || '—'}</span>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function buildTickerTape() {
  const items = MARKETS.slice(0, 12).map(m => `
    <div class="ticker-item" onclick="location.href='index.html?pair=${m.s}'">
      <span class="sym">${m.s}/${m.q}</span>
      <span class="price">${fmtPrice(m.p)}</span>
      <span class="${m.c >= 0 ? 'up' : 'down'}">${m.c >= 0 ? '+' : ''}${m.c.toFixed(2)}%</span>
    </div>
  `).join('');
  document.body.insertAdjacentHTML('afterbegin', `<div class="ticker-tape">${items}</div>`);
  // The topbar will be prepended after this, so we need to reverse: build topbar first.
  // Actually we handle order in init.
}

// ---------- Toast ----------
function toast(msg, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'toastIn 0.25s ease reverse'; setTimeout(() => t.remove(), 240); }, duration);
}

// ---------- Modal ----------
function modal({ title, body, actions = [], width = 440 }) {
  const back = document.createElement('div');
  back.className = 'modal-backdrop';
  const actionsHTML = actions.map((a, i) =>
    `<button class="${a.class || 'btn-ghost'}" data-idx="${i}">${a.label}</button>`
  ).join('');
  back.innerHTML = `
    <div class="modal" style="width: ${width}px;">
      <div class="modal-head">
        <h3>${title}</h3>
        <button class="x-btn" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">${body}</div>
      ${actions.length ? `<div class="modal-foot">${actionsHTML}</div>` : ''}
    </div>
  `;
  const close = () => back.remove();
  back.addEventListener('click', e => { if (e.target === back) close(); });
  back.querySelector('.x-btn').addEventListener('click', close);
  actions.forEach((a, i) => {
    back.querySelector(`[data-idx="${i}"]`).addEventListener('click', () => {
      if (a.onClick) a.onClick(close);
      else close();
    });
  });
  document.body.appendChild(back);
  return { close, el: back };
}

// ---------- User menu ----------
function showUserMenu(e) {
  e.stopPropagation();
  const s = MX1.session;
  if (!s) return;
  const existing = document.querySelector('.user-menu');
  if (existing) { existing.remove(); return; }
  const rect = e.target.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.className = 'user-menu';
  menu.style.cssText = `
    position: fixed; top: ${rect.bottom + 8}px; right: 22px; z-index: 150;
    background: var(--bg-1); border: 1px solid var(--border-hi); border-radius: 10px;
    min-width: 220px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  `;
  menu.innerHTML = `
    <div style="padding: 14px 16px; border-bottom: 1px solid var(--border);">
      <div style="font-weight: 600; font-size: 13px;">${s.name}</div>
      <div style="color: var(--text-faint); font-size: 11px; margin-top: 2px;">${s.email}</div>
      <div style="margin-top: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">UID ${s.uid} · KYC L${s.kycLevel}</div>
    </div>
    <a href="portfolio.html" style="display:block;padding:10px 16px;font-size:13px;color:var(--text);border-bottom:1px solid var(--border);">Portfolio</a>
    <a href="kyc.html" style="display:block;padding:10px 16px;font-size:13px;color:var(--text);border-bottom:1px solid var(--border);">Account &amp; KYC</a>
    <button onclick="MX1.logout()" style="display:block;width:100%;text-align:left;padding:10px 16px;font-size:13px;color:var(--red-hi);">Sign Out</button>
  `;
  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() { menu.remove(); document.removeEventListener('click', closeMenu); }, { once: true });
  }, 0);
}

// ---------- Quick search modal ----------
function openSearchModal() {
  const body = `
    <input id="searchInput" placeholder="Search BTC, ETH, SOL…" style="width:100%;padding:14px 16px;background:var(--bg-2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:14px;outline:none;margin-bottom:14px;" autofocus />
    <div id="searchResults" style="max-height:320px;overflow-y:auto;"></div>
  `;
  const m = modal({ title: 'Quick Search', body });
  const input = m.el.querySelector('#searchInput');
  const results = m.el.querySelector('#searchResults');
  function render(q = '') {
    const matched = MARKETS.filter(x =>
      (x.s + x.q + x.name).toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);
    results.innerHTML = matched.map(m => `
      <a href="index.html?pair=${m.s}" style="display:flex;justify-content:space-between;padding:10px 12px;border-radius:8px;align-items:center;">
        <div>
          <div style="font-weight:600;">${m.s}/${m.q} <span style="color:var(--text-faint);font-size:11px;font-weight:400;margin-left:4px;">${m.name}</span></div>
        </div>
        <div style="text-align:right;">
          <div class="mono">${fmtPrice(m.p)}</div>
          <div class="mono ${m.c >= 0 ? 'up' : 'down'}" style="font-size:11px;">${m.c >= 0 ? '+' : ''}${m.c.toFixed(2)}%</div>
        </div>
      </a>
    `).join('') || '<div style="padding:14px;color:var(--text-faint);text-align:center;">No markets found.</div>';
    results.querySelectorAll('a').forEach(a => {
      a.addEventListener('mouseenter', () => a.style.background = 'rgba(56,189,248,0.08)');
      a.addEventListener('mouseleave', () => a.style.background = 'transparent');
    });
  }
  input.addEventListener('input', () => render(input.value));
  render();
}

// ---------- Theme (dark / light) ----------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mx1_theme', theme);
  // Swap icons in topbar if present
  const moon = document.querySelector('.theme-toggle .icon-moon');
  const sun = document.querySelector('.theme-toggle .icon-sun');
  if (moon && sun) {
    if (theme === 'light') { moon.style.display = 'none'; sun.style.display = ''; }
    else { moon.style.display = ''; sun.style.display = 'none'; }
  }
}
function toggleTheme() {
  const current = localStorage.getItem('mx1_theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  if (typeof toast === 'function') toast(`${next === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info', 1500);
}
// Apply saved theme IMMEDIATELY on script load (before topbar build) to avoid flash
(function initTheme() {
  const saved = localStorage.getItem('mx1_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

// ---------- Init helper ----------
function initPage({ active, requireAuth = false } = {}) {
  if (requireAuth && !MX1.requireAuth()) return false;
  buildTopbar(active);
  buildFooter();
  // Re-apply theme now that topbar exists (so icon swaps correctly)
  applyTheme(localStorage.getItem('mx1_theme') || 'dark');
  return true;
}
