/* ============== Retro Terminal (modal + faux bash + CRT effects) ============== */
(() => {
  const modal    = document.getElementById('terminal-modal');
  const screen   = document.getElementById('term-screen');
  const form     = document.getElementById('term-form');
  const input    = document.getElementById('term-input');
  const openBtn  = document.getElementById('open-terminal');
  const userEl   = document.getElementById('term-user');
  const hostEl   = document.getElementById('term-host');
  const windowEl = modal?.querySelector('.term-window');
  const rainToggle  = document.getElementById('toggle-rain');
  const pulseToggle = document.getElementById('cycle-accent');

  if (!modal || !screen || !form || !input || !openBtn || !windowEl) return;

  /* ---------- tiny state ---------- */
  const state = {
    user: 'info-daemon',
    host: '_____',
    cwd: '~',
    history: [],
    histIndex: -1,
    effects: {
      flicker: true,
      warp: true
    },
    files: [
      'README.md',
      'about.txt',
      'skills.txt',
      'projects',
      'contact.txt',
      'links'
    ],
    data: {
      about: `Hi, I’m Neon You — a frontend engineer who loves micro-interactions and performance. I build reactive UIs, motion systems, and WebGL toys.`,
      skills: [
        'Frontend: TypeScript, React, Svelte, Web Components',
        'Motion/3D: GSAP, Three.js, WebGL',
        'Perf: Web Vitals, RUM, code-splitting, CDN',
        'Tooling: Vite, Playwright, Storybook'
      ],
      projects: [
        { name: 'GhostGrid', desc: 'WebGL neon grid renderer (parallax + glow)', url: '#' },
        { name: 'HoloUI', desc: 'Holographic component kit (bloom & layers)', url: '#' },
        { name: 'PhotonOps', desc: 'RUM budget enforcer + anomaly detection', url: '#' }
      ],
      contact: { email: 'you@example.com', location: 'Night City, Net' },
      links: [
        { key: 'site', label: 'Website', url: 'google.com' },
        { key: 'gh', label: 'GitHub', url: '#' },
        { key: 'tw', label: 'Twitter', url: '#' }
      ]
    }
  };

  userEl.textContent = state.user;
  hostEl.textContent = state.host;

  /* ---------- modal open/close & focus trap ---------- */
  const focusablesSel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let lastFocus = null;

  function applyEffects(){
    windowEl.classList.toggle('fx-warp', !!state.effects.warp);
    screen.classList.toggle('fx-flicker', !!state.effects.flicker);
  }

  function openModal(e) {
    e && e.preventDefault();
    lastFocus = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', onKeyGlobal);
    modal.addEventListener('keydown', trapFocus);
    setTimeout(() => input.focus(), 0);
    printMotd();
    applyEffects();
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeyGlobal);
    modal.removeEventListener('keydown', trapFocus);
    lastFocus && lastFocus.focus();
  }
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll(focusablesSel);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function onKeyGlobal(e){
    if (e.key === 'Escape') closeModal();
    // history
    if (document.activeElement === input) {
      if (e.key === 'ArrowUp') { e.preventDefault(); histPrev(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); histNext(); }
      if (e.key === 'Tab') { e.preventDefault(); doAutocomplete(); }
    }
  }

  modal.querySelectorAll('[data-term-close]').forEach(b => b.addEventListener('click', closeModal));
  openBtn.addEventListener('click', openModal);

  /* ---------- helpers ---------- */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  function echo(html, cls='term-line'){
    const line = el('div', cls, html);
    screen.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
  }
  function promptLine(cmd){
    const p = `<span class="dim">${state.user}@${state.host}</span>:<span class="path">${state.cwd}</span>$ <span class="cmd">${escapeHtml(cmd)}</span>`;
    echo(p);
  }
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function printMotd(){
    if (screen.dataset.booted) return;
    echo(`Welcome, <span class="hl">${state.user}</span>. Old-school terminal engaged.`, 'term-line');
    echo(`Type <span class="hl">help</span> for commands. Use <span class="hl">↑</span>/<span class="hl">↓</span> for history, <span class="hl">Tab</span> to autocomplete.`, 'term-line');
    screen.dataset.booted = '1';
  }

  /* ---------- history ---------- */
  function pushHistory(cmd){
    if (!cmd) return;
    if (state.history[state.history.length-1] !== cmd) state.history.push(cmd);
    state.histIndex = state.history.length;
  }
  function histPrev(){
    if (!state.history.length) return;
    state.histIndex = Math.max(0, state.histIndex - 1);
    input.value = state.history[state.histIndex] || '';
    setTimeout(()=>input.setSelectionRange(9999,9999),0);
  }
  function histNext(){
    if (!state.history.length) return;
    state.histIndex = Math.min(state.history.length, state.histIndex + 1);
    input.value = state.history[state.histIndex] || '';
  }

  /* ---------- autocomplete ---------- */
  const COMMANDS = [
    'help','clear','history',
    'ls','cat','echo',
    'whoami','about','skills','projects','contact','links',
    'open','date','pwd','cd',
    'flicker','warp',
    'rain','pulse'
  ];

  // toggles rain or pulse
  function setToggle(el, on){
    if (!el) return false;
    el.checked = !!on;
    el.dispatchEvent(new Event('change', { bubbles: true })); // triggers your existing listeners
    return true;
  }

  function doAutocomplete(){
    const raw = input.value.trim();
    const [cmd, ...rest] = raw.split(/\s+/);
    if (!cmd) return;

    if (rest.length === 0) {
      const matches = COMMANDS.filter(c => c.startsWith(cmd));
      if (matches.length === 1) { input.value = matches[0] + ' '; }
      else if (matches.length > 1) { echo(matches.join('  ')); }
      return;
    }

    // args: try file/keys
    const arg = rest[rest.length-1];
    const pool = [...state.files, ...state.data.links.map(l => l.key), 'on','off'];
    const matches = pool.filter(x => x.startsWith(arg));
    if (matches.length === 1) {
      input.value = cmd + ' ' + rest.slice(0,-1).join(' ') + (rest.length>1?' ':'') + matches[0];
    } else if (matches.length > 1) {
      echo(matches.join('  '));
    }
  }

  /* ---------- command handlers ---------- */
  const handlers = {
    help(){
      echo([
        'Available commands:',
        '  help, clear, history',
        '  ls, cat <file>',
        '  whoami, about, skills, projects, contact, links',
        '  echo <text>',
        '  open <key|url>',
        '  pwd, cd (cd is cosmetic)',
        '  date',
        '  flicker <on|off>   # toggle text flicker',
        '  warp <on|off>      # toggle CRT fisheye',
        '  rain <on|off>      # toggle site wide rain',
        '  pulse <on|off>     # toggle site wide pulse'

      ].join('\n'));
    },
    clear(){ screen.innerHTML = ''; },
    history(){ echo(state.history.map((h,i)=>`${i+1}  ${h}`).join('\n') || '(empty)'); },
    ls(){
      const files = state.files.map(f => /[.]/.test(f) ? f : f + '/');
      echo(files.join('  '));
    },
    cat(arg){
      if (!arg) return echo('cat: missing file operand', 'err');
      switch(arg){
        case 'README.md':
          echo(`# Info•Daemon Terminal\nUse 'help' to see commands.\nTry: about, projects, contact`); break;
        case 'about.txt':
          echo(state.data.about); break;
        case 'skills.txt':
          echo(state.data.skills.join('\n')); break;
        case 'contact.txt':
          echo(`Email: ${state.data.contact.email}\nLocation: ${state.data.contact.location}`); break;
        case 'projects':
          echo('cat: projects: Is a directory'); break;
        case 'links':
          echo(state.data.links.map(l=>`${l.key}  ${l.label}  ${l.url}`).join('\n')); break;
        default:
          echo(`cat: ${arg}: No such file or directory`, 'err');
      }
    },
    echo(...args){ echo(args.join(' ')); },
    whoami(){ echo(`${state.user}`); },
    about(){ echo(state.data.about); },
    skills(){ echo(state.data.skills.map(s=>' - '+s).join('\n')); },
    projects(){
      echo(state.data.projects.map(p=>`* ${p.name} — ${p.desc}${p.url && p.url!=='#' ? ' ['+p.url+']':''}`).join('\n'));
    },
    contact(){
      echo(`Email: ${state.data.contact.email}\nLocation: ${state.data.contact.location}\nTip: open site | gh | tw`);
    },
    links(){
      echo(state.data.links.map(l=>`${l.key.padEnd(6)} -> ${l.url}`).join('\n'));
    },
    open(target){
      if (!target) return echo('open: missing operand', 'err');
      const link = state.data.links.find(l=>l.key===target);
      const url = link ? link.url : (/^https?:\/\//.test(target) ? target : null);
      if (!url || url === '#') return echo(`open: cannot open '${target}'`, 'err');
      window.open(url, '_blank', 'noopener,noreferrer');
      echo(`opening ${url} …`);
    },
    date(){ echo(new Date().toString()); },
    pwd(){ echo(`/home/${state.user}/${state.cwd === '~' ? '' : state.cwd}`.replace(/\/$/,'')); },
    cd(arg){
      if (!arg || arg === '~' || arg === '/') { state.cwd='~'; }
      else if (arg === '..') { state.cwd='~'; }
      else { state.cwd = arg.replace(/\/+/g,''); }
    },
    flicker(arg){
      if (!arg) {
        return echo(`flicker is ${state.effects.flicker ? 'on' : 'off'} (try "flicker on" or "flicker off")`);
      }
      const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
      if (!val) return echo(`flicker: expected 'on' or 'off'`, 'err');
      state.effects.flicker = (val === 'on');
      applyEffects();
      echo(`flicker ${val}`);
    },
    warp(arg){
      if (!arg) {
        return echo(`warp is ${state.effects.warp ? 'on' : 'off'} (try "warp on" or "warp off")`)
      };
      const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
      if (!val) return echo(`warp: expected 'on' or 'off'`, 'err');
      state.effects.warp = (val === 'on');
      applyEffects();
      echo(`warp ${val}`);

      
    },
    rain(arg){
      if (!rainToggle) return echo('rain: toggle not found', 'err');
      if (!arg) {
        return echo(`rain is ${rainToggle.checked ? 'on' : 'off'} (try "rain on" or "rain off")`);
      }
      const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
      if (!val) return echo(`rain: expected 'on' or 'off'`, 'err');
      setToggle(rainToggle, val === 'on');
      echo(`rain ${val}`);
    },

    pulse(arg){
      if (!pulseToggle) return echo('pulse: toggle not found', 'err');
      if (!arg) {
        return echo(`pulse is ${pulseToggle.checked ? 'on' : 'off'} (try "pulse on" or "pulse off")`);
      }
      const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
      if (!val) return echo(`pulse: expected 'on' or 'off'`, 'err');
      setToggle(pulseToggle, val === 'on');
      echo(`pulse ${val}`);
    },

  };

  /* ---------- form submit ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value;
    const cmdline = raw.trim();
    if (!cmdline) return;

    promptLine(cmdline);
    pushHistory(cmdline);
    input.value = '';

    const parts = cmdline.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (handlers[cmd]) {
      try { handlers[cmd](...args); }
      catch(err){ echo(`error: ${err.message}`, 'err'); }
    } else {
      echo(`${cmd}: command not found`, 'err');
      echo(`Type 'help' to see available commands.`);
    }
  });

  /* accessibility: close on backdrop click */
  modal.addEventListener('click', (e)=>{
    if (e.target.classList.contains('term-backdrop')) closeModal();
  });

  /* ================= micro “pop” flicker =================
     Occasionally blip a random recent output line for extra CRT realism.
  -------------------------------------------------------- */
  function randomFlickerTick(){
    if (!state.effects.flicker) return;
    const lines = screen.querySelectorAll('.term-line');
    if (!lines.length) return;
    const idx = Math.max(0, lines.length - 1 - Math.floor(Math.random()*6)); // among last ~6 lines
    const el = lines[idx];
    if (!el) return;
    el.style.transition = 'filter .05s ease, opacity .05s ease';
    el.style.filter = 'blur(.2px) brightness(1.25)';
    el.style.opacity = '0.92';
    setTimeout(()=>{
      el.style.filter = '';
      el.style.opacity = '';
    }, 65 + Math.random()*120);
  }
  setInterval(randomFlickerTick, 500 + Math.random()*1200);

  // initialize applied classes on first load (in case opened immediately)
  applyEffects();

})();
