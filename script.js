// ===== NAV SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  document.getElementById('mainNav')?.classList.toggle('scrolled', window.scrollY > 10);
});

// ===== MOBILE NAV =====
function toggleMobileNav() {
  document.getElementById('mobileDrawer').classList.toggle('open');
  document.getElementById('drawerOverlay').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobileDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}


// ===== AUTH STATE =====
let cUser = null;
const ALARM = 30;
const pwStore = {};
let issues = [];
let nxtId = 1, curFilter = 'all', ratIssueId = null, curStar = 0;

// Animal Emojis avatars
const avatars = ['🦊', '🐶', '🐱', '🐭', '🐹', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '👨‍🦱', '👩‍🦰', '🐸', '🐵'];
const userAvatars = {};

// ===== MONKEY ANIMATION =====
function closeye(animId) {
  const container = document.getElementById(animId);
  if (!container) return;
  const hands = container.querySelector('img');
  container.style.backgroundImage = "url('images/monkey_pwd.gif')";
  if (hands) hands.style.marginTop = "0%";
}

function openeye(animId) {
  const container = document.getElementById(animId);
  if (!container) return;
  const hands = container.querySelector('img');
  container.style.backgroundImage = "url('images/monkey.gif')";
  if (hands) hands.style.marginTop = "110%";
}


// ===== PUBLIC TABS =====
function gLoginTab(t) {
  document.querySelectorAll('.nb,.mob-nb').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('.pub-tab').forEach(s => s.classList.remove('on'));
  const nl = document.getElementById('nl-' + t); if (nl) nl.classList.add('on');
  const sec = document.getElementById('pt-' + t); if (sec) sec.classList.add('on');
  closeMobileNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== LOGIN — STUDENTS ONLY =====
function doLogin() {
  const id = document.getElementById('loginId').value.trim().toLowerCase();
  const pw = document.getElementById('loginPass').value;
  const btn = document.getElementById('loginBtn');

  document.getElementById('lerr').style.display = 'none';

  if (!id || !pw) {
    showLoginErr('Please enter your Student ID and password.');
    return;
  }

  const m = id.match(/^bcaclass@(\d+)$/);
  if (!m) {
    showLoginErr('Invalid ID format. Use: bcaclass@1 to bcaclass@500');
    return;
  }
  const n = parseInt(m[1]);
  if (n < 1 || n > 500) {
    showLoginErr('Roll number out of range. Must be 1–500.');
    return;
  }

  // Loading state (delay simulation without text change)
  btn.disabled = true;

  setTimeout(() => {
    btn.disabled = false;

    const stored = pwStore[id];
    const expected = stored || id;

    if (pw !== expected) {
      showLoginErr('Incorrect password. Please try again.');
      return;
    }

    cUser = { id, role: 'student', firstLogin: !stored };
    openeye('loginMonkey'); // Ensure eyes are open on success

    if (cUser.firstLogin) {
      document.getElementById('newPw').value = '';
      document.getElementById('confPw').value = '';
      document.getElementById('pwErr').style.display = 'none';
      document.getElementById('psFill').style.width = '0';
      document.getElementById('psLabel').textContent = 'Enter a password';
      document.getElementById('pwOverlay').classList.add('open');
      openeye('modalMonkey'); // init modal monkey state
    } else {
      enterApp();
    }
  }, 600);
}

// ===== STAFF — Hidden login via URL param ?staff=1 =====
(function checkStaffUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('staff') !== '1') return;
  setTimeout(() => {
    const sid = prompt('Staff ID (min 3 chars):');
    if (!sid || sid.length < 3) return;
    const spw = prompt('Staff Password:');
    if (!spw) return;
    const key = 'STAFF_' + sid.toLowerCase();
    const stored = pwStore[key];
    const expected = stored || sid.toLowerCase();
    if (spw !== expected) { alert('Incorrect staff credentials.'); return; }
    cUser = { id: sid, role: 'staff', firstLogin: !stored };
    if (cUser.firstLogin) {
      const np = prompt('Set new staff password (min 8 chars, include a number):');
      if (np && np.length >= 8 && /\d/.test(np)) { pwStore[key] = np; cUser.firstLogin = false; }
      else { alert('Invalid password format.'); cUser = null; return; }
    }
    enterApp();
    window.history.replaceState({}, '', window.location.pathname);
  }, 500);
})();

function showLoginErr(msg) {
  const e = document.getElementById('lerr');
  e.textContent = msg; e.style.display = 'block';
  const card = document.querySelector('.login-card');
  if (!card) return;
  const shakes = ['-8px', '8px', '-5px', '5px', '0'];
  let i = 0;
  const iv = setInterval(() => {
    card.style.transform = `translateX(${shakes[i]})`;
    i++; if (i >= shakes.length) { clearInterval(iv); card.style.transform = ''; }
  }, 60);
}

function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text'; btn.textContent = 'HIDE';
    if (inputId === 'loginPass') closeye('loginMonkey');
    if (inputId === 'newPw' || inputId === 'confPw') closeye('modalMonkey');
  } else {
    inp.type = 'password'; btn.textContent = 'SHOW';
  }
}

function checkStrength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  const pct = Math.round(s / 5 * 100);
  const fill = document.getElementById('psFill');
  const lbl = document.getElementById('psLabel');
  if (!fill || !lbl) return;
  fill.style.width = pct + '%';
  const colors = ['', '#ef4444', '#f97316', '#f59e0b', '#00b87c', '#7c3aed'];
  fill.style.background = colors[s] || '#e4ddf0';
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  lbl.textContent = labels[s] || '';
  lbl.style.color = colors[s] || 'var(--muted)';
}

function changePw() {
  const np = document.getElementById('newPw').value;
  const cp = document.getElementById('confPw').value;
  const er = document.getElementById('pwErr');
  er.style.display = 'none';
  if (np.length < 8) { er.textContent = 'Min 8 characters required.'; er.style.display = 'block'; return; }
  if (!/\d/.test(np)) { er.textContent = 'Must include at least one number.'; er.style.display = 'block'; return; }
  if (np === cUser.id) { er.textContent = 'Cannot use your Student ID as password.'; er.style.display = 'block'; return; }
  if (np !== cp) { er.textContent = 'Passwords do not match.'; er.style.display = 'block'; return; }
  pwStore[cUser.id] = np;
  cUser.firstLogin = false;

  if (!userAvatars[cUser.id] && cUser.role !== 'staff') {
    userAvatars[cUser.id] = avatars[Math.floor(Math.random() * avatars.length)];
  }

  document.getElementById('pwOverlay').classList.remove('open');
  enterApp();
  toast('Password set successfully.', 'ok');
}

function updateAvatarDisplay() {
  if (!cUser) return;
  const avatarEl = document.getElementById('userAvatar');
  if (cUser.role === 'staff') {
    avatarEl.textContent = 'A';
    avatarEl.style.background = '#1e293b';
  } else {
    avatarEl.textContent = userAvatars[cUser.id] || '👤';
    avatarEl.style.background = '#cbd5e0';
  }
}

function toggleProfileMenu(event) {
  if (event) event.stopPropagation();
  if (!cUser) return;
  const menu = document.getElementById('profileMenu');
  if (menu.classList.contains('open')) {
    menu.classList.remove('open');
  } else {
    // Populate grid if student
    if (cUser.role !== 'staff') {
      const grid = document.getElementById('avatarGrid');
      if (grid) {
        grid.innerHTML = avatars.map(c => `<div class="avatar-opt" onclick="selectAvatar('${c}', event)" style="font-size:1.5rem;background:#f1f5f9;">${c}</div>`).join('');
      }
    }

    // Set current big avatar/info
    const bigAv = document.getElementById('pm-avatar-big');
    if (bigAv) {
      if (cUser.role === 'staff') {
        bigAv.textContent = 'A';
        bigAv.style.background = '#1e293b';
        bigAv.style.color = 'white';
      } else {
        bigAv.textContent = userAvatars[cUser.id] || '👤';
        bigAv.style.background = '#cbd5e0';
        bigAv.style.color = 'inherit';
      }
    }

    const unEl = document.getElementById('pm-username');
    if (unEl) unEl.textContent = cUser.id;
    const rlEl = document.getElementById('pm-role');
    if (rlEl) rlEl.textContent = cUser.role === 'staff' ? 'Admin Staff' : 'BCA Student';

    menu.classList.add('open');
  }
}

function selectAvatar(c, event) {
  event.stopPropagation();
  userAvatars[cUser.id] = c;
  updateAvatarDisplay();
  document.getElementById('profileMenu').classList.remove('open');
  toast('Profile theme updated.', 'ok');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileMenu');
  const chip = document.getElementById('userChip');
  if (menu && menu.classList.contains('open') && !chip.contains(e.target)) {
    menu.classList.remove('open');
  }
});

function enterApp() {
  document.getElementById('pg-public').classList.remove('on');
  const app = document.getElementById('pg-app');
  app.classList.add('on');

  document.getElementById('nav-login-links').style.display = 'none';
  document.getElementById('nav-app-links').style.display = 'none'; // Ensure hidden
  document.getElementById('mob-login-links').style.display = 'none';
  document.getElementById('mob-app-links').style.display = 'flex';
  document.getElementById('navR').classList.add('show');
  document.getElementById('hamburger').style.display = 'block'; // Show on desktop too now

  const mainAboutContent = document.querySelector('.pub-about-container').innerHTML;
  document.getElementById('app-about-placeholder').innerHTML = mainAboutContent;

  document.getElementById('pm-username').textContent = cUser.id;
  document.getElementById('pm-role').textContent = cUser.role === 'staff' ? 'Admin Staff' : 'BCA Student';

  if (!userAvatars[cUser.id] && cUser.role !== 'staff') {
    userAvatars[cUser.id] = avatars[Math.floor(Math.random() * avatars.length)];
  }
  updateAvatarDisplay();

  if (cUser.role === 'staff') {
    ['nb-staff', 'mob-staff'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'inline-block';
    });
    ['nb-post', 'mob-post'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.querySelector('.dd-arrow').style.display = 'none';
  } else {
    document.querySelector('.dd-arrow').style.display = 'inline';
  }

  gTab('dashboard');
  if (cUser.role !== 'staff') toast(`Welcome back, ${cUser.id}`, 'ok');
}

function logout() {
  cUser = null;
  document.getElementById('pg-public').classList.add('on');
  document.getElementById('pg-app').classList.remove('on');

  document.getElementById('nav-login-links').style.display = 'flex';
  document.getElementById('nav-app-links').style.display = 'none';
  document.getElementById('mob-login-links').style.display = 'flex';
  document.getElementById('mob-app-links').style.display = 'none';
  document.getElementById('navR').classList.remove('show');
  document.getElementById('hamburger').style.display = 'none';
  document.getElementById('loginId').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('lerr').style.display = 'none';
  openeye('loginMonkey');

  ['nb-staff', 'mob-staff'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  ['nb-post', 'mob-post'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'inline-block';
  });

  gLoginTab('login');
  toast('Signed out entirely.', 'info');
}

// ===== APP TABS =====
function gTab(tid) {
  document.querySelectorAll('.ts').forEach(el => el.classList.remove('on'));
  const target = document.getElementById('ts-' + tid);
  if (target) {
    target.classList.add('on');
    if (tid === 'issues') renderIssues();
    if (tid === 'staff') renderStaff();
  }

  // Sync desktop side nav
  document.querySelectorAll('#nav-app-links .nb').forEach(el => el.classList.remove('on'));
  const nt = document.getElementById('nb-' + tid);
  if (nt) nt.classList.add('on');

  // Sync mobile drawer nav
  document.querySelectorAll('.mob-nb').forEach(el => el.classList.remove('on'));
  const mbt = document.getElementById('mb-' + tid); // This should be updated if IDs changed
  // Actually, gTab in current state uses .mob-nb buttons.
  // Re-syncing based on the buttons that exist in index.html for the drawer.
  closeMobileNav();

  if (tid === 'dashboard') renderDash();
  if (tid === 'issues') renderIssues();
  if (tid === 'staff') renderStaff();
  window.scrollTo({ top: 64, behavior: 'smooth' });
}

// ===== HELPERS =====
function stag(s) {
  const m = { open: 't-open', solved: 't-done', 'in-progress': 't-prog' };
  const l = { open: 'Open', solved: 'Solved', 'in-progress': 'In Progress' };
  return `<span class="tag ${m[s] || 't-open'}">${l[s] || s}</span>`;
}

function animateCount(el, target) {
  if (!el) return;
  const dur = 700, step = 16;
  const start = 0;
  const inc = (target - start) / (dur / step);
  let cur = start;
  const iv = setInterval(() => {
    cur += inc;
    if (cur >= target) { cur = target; clearInterval(iv); }
    el.textContent = Math.round(cur);
  }, step);
}

// ===== DASHBOARD =====
function renderDash() {
  const tot = issues.length;
  const slv = issues.filter(i => i.status === 'solved').length;
  const inp = issues.filter(i => i.status === 'in-progress').length;
  const opn = issues.filter(i => i.status === 'open').length;
  const tvot = issues.reduce((a, b) => a + b.votes, 0);

  document.getElementById('srow').innerHTML = `
    <div class="scard"><div class="n" id="sc-tot">0</div><div class="l">Total Issues</div></div>
    <div class="scard"><div class="n" id="sc-opn">0</div><div class="l">Open</div></div>
    <div class="scard"><div class="n" id="sc-inp">0</div><div class="l">In Progress</div></div>
    <div class="scard"><div class="n" id="sc-slv">0</div><div class="l">Resolved</div></div>
    <div class="scard"><div class="n" id="sc-vot">0</div><div class="l">Total Votes</div></div>`;
  setTimeout(() => {
    animateCount(document.getElementById('sc-tot'), tot);
    animateCount(document.getElementById('sc-opn'), opn);
    animateCount(document.getElementById('sc-inp'), inp);
    animateCount(document.getElementById('sc-slv'), slv);
    animateCount(document.getElementById('sc-vot'), tvot);
  }, 60);

  const sorted = [...issues].sort((a, b) => b.votes - a.votes);
  const mx = sorted[0]?.votes || 1;
  const tvList = document.getElementById('tvList');

  if (!sorted.length) {
    tvList.innerHTML = `<div class="empty-state"><div class="es-title">No Issues Yet</div><p class="es-text">Be the first to report a campus issue!</p></div>`;
    document.getElementById('apanel').classList.remove('show');
    return;
  }

  tvList.innerHTML = sorted.slice(0, 7).map((iss, i) => `
    <div class="ti">
      <div class="rk ${i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : 'ro'}">#${i + 1}</div>
      <div class="ti-info">
        <div class="ti-title">${iss.title}</div>
        <div class="ti-meta">
          <span class="tag t-cat">${iss.cat}</span>
          ${stag(iss.status)}
          ${iss.merged.length ? `<span class="tag t-mg">Merged ×${iss.merged.length}</span>` : ''}
          ${iss.votes >= ALARM && iss.status !== 'solved' ? `<span class="alarm-badge">URGENT</span>` : ''}
          <span>Loc: ${iss.loc}</span>
        </div>
        <div class="pb"><div class="pf" style="width:${Math.round(iss.votes / mx * 100)}%"></div></div>
      </div>
      <div class="tv-v"><div class="vn">${iss.votes}</div><div class="vw">votes</div></div>
    </div>`).join('');

  const alrm = issues.filter(i => i.votes >= ALARM && i.status !== 'solved');
  const ap = document.getElementById('apanel');
  if (alrm.length) {
    ap.classList.add('show');
    document.getElementById('aItems').innerHTML = alrm.map(i => `
      <div class="alarm-item">
        <div><div class="ai-title">${i.title}</div><div style="font-size:.72rem;color:var(--muted)">${i.cat} · ${i.loc}</div></div>
        <div class="ai-votes">${i.votes} votes</div>
      </div>`).join('');
  } else ap.classList.remove('show');
}

// ===== ISSUES =====
function setF(f, btn) {
  curFilter = f;
  document.querySelectorAll('.fc').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderIssues();
}

function renderIssues() {
  const q = (document.getElementById('srch')?.value || '').toLowerCase();
  let list = issues;
  if (['open', 'in-progress', 'solved'].includes(curFilter)) list = issues.filter(i => i.status === curFilter);
  else if (curFilter !== 'all') list = issues.filter(i => i.cat === curFilter);
  if (q) list = list.filter(i => (i.title + i.loc + i.desc).toLowerCase().includes(q));
  list = [...list].sort((a, b) => b.votes - a.votes);
  const el = document.getElementById('iList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="es-title">${q ? 'No Results' : 'No Issues'}</div><p class="es-text">${q ? 'Try different keywords.' : 'Post the first complaint!'}</p></div>`;
    return;
  }
  el.innerHTML = list.map(issCard).join('');
}

function issCard(iss) {
  const isStaff = cUser?.role === 'staff';
  const voted = iss.voters.includes(cUser?.id || '');
  const canVote = !isStaff && iss.status !== 'solved';
  const showRate = iss.status === 'solved' && !isStaff && voted && !iss.myRated?.includes(cUser?.id);
  return `<div class="ic" id="ic-${iss.id}">
    <div class="ic-inner">
      <div class="vote-col">
        <button class="vbtn ${voted ? 'voted' : ''}" onclick="doVote(${iss.id})" ${canVote ? '' : 'disabled'} title="${voted ? 'Remove vote' : 'Vote'}">▲</button>
        <div class="vcnt">${iss.votes}</div>
        <div class="vlbl">votes</div>
      </div>
      <div class="ibody">
        <div class="itags">
          <span class="tag t-cat">${iss.cat}</span>
          ${stag(iss.status)}
          ${iss.votes >= ALARM && iss.status !== 'solved' ? '<span class="alarm-badge">URGENT</span>' : ''}
          ${iss.merged.length ? `<span class="tag t-mg">×${iss.merged.length} merged</span>` : ''}
        </div>
        <div class="ititle">${iss.title}</div>
        ${iss.merged.length ? `<div class="mg-bar">Merged: <em>${iss.merged.join(', ')}</em></div>` : ''}
        <div class="idesc">${iss.desc.length > 180 ? iss.desc.slice(0, 180) + '…' : iss.desc}</div>
        ${iss.rating ? `<div class="rating-display">★ ${iss.rating.avg.toFixed(1)}/5 (${iss.rating.count} ratings)</div>` : ''}
        ${showRate ? `<button class="bsm b-ok" style="margin-bottom:.5rem" onclick="openRat(${iss.id})">Rate Resolution</button>` : ''}
        <div class="ifoot">
          <span>Loc: ${iss.loc}</span>
          <span>By: ${iss.author}</span>
          <span>Date: ${iss.date}</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ===== VOTE =====
function doVote(id) {
  if (!cUser || cUser.role === 'staff') { toast('Staff cannot vote.', 'err'); return; }
  const iss = issues.find(i => i.id === id);
  if (!iss || iss.status === 'solved') return;
  const idx = iss.voters.indexOf(cUser.id);
  if (idx >= 0) { iss.voters.splice(idx, 1); iss.votes--; toast('Vote removed.', 'info'); }
  else {
    iss.voters.push(cUser.id); iss.votes++;
    toast('Vote counted!', 'ok');
    if (iss.votes === ALARM) toast('Issue is now HIGH PRIORITY!', 'alarm');
  }
  renderIssues(); renderDash();
}

// ===== CHAR BAR =====
function updateCharBar() {
  const v = document.getElementById('pD')?.value.length || 0;
  const fill = document.getElementById('charFill');
  if (!fill) return;
  const pct = Math.round(v / 280 * 100);
  fill.style.width = pct + '%';
  fill.style.background = pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#00b87c';
}

// ===== POST ISSUE =====
function postIssue() {
  if (cUser?.role === 'staff') { toast('Staff cannot post issues.', 'err'); return; }
  const t = document.getElementById('pT').value.trim();
  const c = document.getElementById('pC').value;
  const l = document.getElementById('pL').value.trim();
  const d = document.getElementById('pD').value.trim();
  if (!t || !c || !l || !d) { toast('Please fill all required fields.', 'err'); return; }

  const btn = document.getElementById('subBtn');
  btn.textContent = 'Submitting...'; btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Submit Issue'; btn.disabled = false;
    const kw = [...t.toLowerCase().split(' '), ...d.toLowerCase().split(' ')].filter(w => w.length > 3);
    let merged = null;
    for (const iss of issues) {
      if (iss.status === 'solved') continue;
      const txt = (iss.title + ' ' + iss.desc).toLowerCase();
      if (kw.filter(w => txt.includes(w)).length >= 3) { merged = iss; break; }
    }

    if (merged) {
      merged.merged.push(t);
      if (!merged.voters.includes(cUser.id)) { merged.votes++; merged.voters.push(cUser.id); }
      document.getElementById('merT').textContent = merged.title;
      document.getElementById('merV').textContent = merged.votes;
      const aiN = document.getElementById('aiN');
      aiN.classList.add('show');
      toast('AI detected similar issue — merged!', 'info');
      setTimeout(() => aiN.classList.remove('show'), 7000);
    } else {
      issues.unshift({
        id: nxtId++, title: t, cat: c, loc: l, desc: d,
        author: cUser.id, date: new Date().toISOString().slice(0, 10),
        votes: 1, voters: [cUser.id], status: 'open', merged: [], rating: null
      });
      toast('Issue posted successfully!', 'ok');
    }
    document.getElementById('pT').value = '';
    document.getElementById('pC').value = '';
    document.getElementById('pL').value = '';
    document.getElementById('pD').value = '';
    document.getElementById('ccnt').textContent = '0';
    updateCharBar();
    setTimeout(() => gTab('issues'), 900);
  }, 700);
}

// ===== STAFF PANEL =====
function renderStaff() {
  const alrm = issues.filter(i => i.votes >= ALARM && i.status !== 'solved');
  const sp = document.getElementById('sapanel');
  if (alrm.length) {
    sp.classList.add('show');
    document.getElementById('saItems').innerHTML = alrm.map(i => `
      <div class="alarm-item">
        <div><div class="ai-title">${i.title}</div><div style="font-size:.72rem;color:var(--muted)">${i.cat} · ${i.loc}</div></div>
        <div class="ai-votes">${i.votes} votes</div>
      </div>`).join('');
  } else sp.classList.remove('show');

  const sorted = [...issues].sort((a, b) => b.votes - a.votes);
  const sIList = document.getElementById('sIList');
  if (!sorted.length) {
    sIList.innerHTML = `<div class="empty-state"><div class="es-title">No Issues Yet</div></div>`;
    return;
  }
  sIList.innerHTML = sorted.map(iss => `
    <div class="sic">
      <div class="sih">
        <div>
          <div class="si-title">${iss.title}</div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:.25rem">${iss.cat} · ${iss.loc} · ${iss.votes} votes</div>
          <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.45rem">${stag(iss.status)}${iss.votes >= ALARM && iss.status !== 'solved' ? '<span class="alarm-badge">URGENT</span>' : ''}</div>
        </div>
        <div class="sa">
          ${iss.status !== 'in-progress' && iss.status !== 'solved' ? `<button class="bsm b-prog" onclick="sUpdate(${iss.id},'in-progress')">Mark In Progress</button>` : ''}
          ${iss.status !== 'solved' ? `<button class="bsm b-ok" onclick="sUpdate(${iss.id},'solved')">Mark Solved</button>` : `<span style="color:var(--ok);font-size:.8rem;font-weight:700">Resolved${iss.rating ? ' · ★' + iss.rating.avg.toFixed(1) + '/5' : ''}</span>`}
        </div>
      </div>
      <div style="color:var(--text2);font-size:.83rem;line-height:1.65">${iss.desc}</div>
    </div>`).join('');
}

function sUpdate(id, status) {
  const iss = issues.find(i => i.id === id);
  if (iss) {
    iss.status = status;
    toast(status === 'solved' ? 'Marked Solved!' : 'Marked In Progress', 'ok');
    renderStaff(); renderDash();
  }
}

// ===== RATING =====
const starLabels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
function openRat(id) {
  const iss = issues.find(i => i.id === id); if (!iss) return;
  ratIssueId = id; curStar = 0;
  document.getElementById('ratTitle').textContent = iss.title;
  document.querySelectorAll('.star').forEach(s => s.classList.remove('on'));
  document.getElementById('starLabel').textContent = 'Tap to rate';
  document.getElementById('ratCmt').value = '';
  document.getElementById('ratOv').classList.add('open');
}
function setStar(n) {
  curStar = n;
  document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('on', i < n));
  document.getElementById('starLabel').textContent = starLabels[n] || '';
}
function closeRat() { document.getElementById('ratOv').classList.remove('open'); }
function submitRat() {
  if (!curStar) { toast('Please pick a star rating.', 'err'); return; }
  const iss = issues.find(i => i.id === ratIssueId);
  if (iss) {
    if (iss.rating) {
      const t = iss.rating.avg * iss.rating.count + curStar;
      iss.rating = { avg: t / (iss.rating.count + 1), count: iss.rating.count + 1 };
    } else iss.rating = { avg: curStar, count: 1 };
    if (!iss.myRated) iss.myRated = [];
    iss.myRated.push(cUser.id);
  }
  closeRat();
  toast(`Rated ${curStar}/5. Thank you.`, 'ok');
  renderIssues(); renderDash();
}
document.getElementById('ratOv')?.addEventListener('click', function (e) { if (e.target === this) closeRat(); });

// ===== TOAST =====
function toast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast t-${type} show`;
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 3800);
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('pg-public').classList.add('on');
  document.getElementById('pg-app').classList.remove('on');
  gLoginTab('login');
});
