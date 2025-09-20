export function initTerminal() {
  /* ============== Retro Terminal (modal + CRT effects) ============== */
  (() => {
    const modal = document.getElementById('terminal-modal');
    const screen = document.getElementById('term-screen');
    const form = document.getElementById('term-form');
    const input = document.getElementById('term-input');
    const userEl = document.getElementById('term-user');
    const hostEl = document.getElementById('term-host');
    const windowEl = modal?.querySelector('.term-window');
    const rainToggle = document.getElementById('toggle-rain');
    const pulseToggle = document.getElementById('cycle-accent');

    if (!modal || !screen || !form || !input || !windowEl) return;

    function slugify(str) {
      return String(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // derive a short key from a URL host
    function keyFromHost(u) {
      try {
        const h = new URL(u, location.href).hostname.replace(/^www\./, '');
        if (h.includes('github.com')) return 'gh';
        if (h.includes('twitter.com') || h.includes('x.com')) return 'tw';
        if (h.includes('linkedin.com')) return 'in';
        if (h.includes('itch.io')) return 'itch';
        if (h.includes('youtube.com') || h.includes('youtu.be')) return 'yt';
        return h.split('.').slice(0, -1).join('.') || 'site';
      } catch { return 'link'; }
    }

    // normalize
    function cleanText(node) {
      return (node?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function scrapeSiteData() {
      // --- ABOUT ---
      const heroLead = cleanText(document.querySelector('.hero .lead'));
      const heroDescs = [...document.querySelectorAll('.hero .top-desc')]
        .map(cleanText)
        .filter(Boolean);
      const aboutSection = cleanText(document.querySelector('#about .container')) || '';

      const about = heroDescs.length ? heroDescs.join('\n') : (heroLead || aboutSection || 'No about text found.');


      // --- SKILLS ---
      const skillsCards = [...document.querySelectorAll('#skills .card')];
      const skills = skillsCards.map(c => {
        const h = cleanText(c.querySelector('h3'));
        const m = cleanText(c.querySelector('.meta'));
        return [h, m].filter(Boolean).join(': ');
      });

      // --- PROJECTS ---
      const projectCards = [...document.querySelectorAll('#projects .card')];
      const projects = projectCards.map(card => {
        const name = cleanText(card.querySelector('h3')) || 'Untitled';
        const desc = cleanText(card.querySelector('.meta')) || '';
        const primaryLink = card.querySelector('.actions a');
        const href = primaryLink?.getAttribute('href') || '#';
        return {
          key: slugify(card.getAttribute('data-project') || name),
          name, desc, url: href
        };
      });

      // --- CONTACT ---
      const contactWrap = document.querySelector('#contact');
      let email = '';
      const emailInput = contactWrap?.querySelector('input[type="email"]');
      if (emailInput?.value || emailInput?.placeholder) {
        email = emailInput.value || emailInput.placeholder;
      }
      const locationGuess = 'Cyberspace';
      // --- LINKS ---
      const linkSet = new Map();
      linkSet.set('site', { key: 'site', label: 'Website', url: location.origin });

      const resumeA = document.querySelector('a[download]');
      if (resumeA?.href) {
        linkSet.set('resume', { key: 'resume', label: 'Resume', url: resumeA.href });
      }

      document.querySelectorAll('#projects .actions a[href]').forEach(a => {
        const url = a.getAttribute('href');
        if (!url || url === '#') return;
        const key = keyFromHost(url);
        if (!linkSet.has(key)) linkSet.set(key, { key, label: key.toUpperCase(), url });
      });

      return {
        about,
        skills,
        projects,
        contact: { email, location: locationGuess },
        links: [...linkSet.values()]
      };
    }

    /* ---------- tiny state ---------- */
    const LS_KEY = 'info-daemon.term.history';
    const persistedHistory = (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
    })();

    const state = {
      user: 'info-daemon',
      host: (location.hostname || 'localhost') || 'localhost',
      cwd: '~',
      history: persistedHistory.slice(-200), // keep last 200
      histIndex: persistedHistory.length,
      effects: { flicker: true, warp: true },
      files: [
        'README.md',
        'about.txt',
        'skills.txt',
        'contact.txt',
        'projects',      // dir
        'links'          // pseudo file
      ],
      data: {
        about: `Placeholder`,
        skills: [
          'Placeholder'
        ],
        projects: [
          { key: 'key', name: 'name', desc: 'placeholder', url: '#' }
        ],
        contact: { email: 'you@example.com', location: 'Night City, Net' },
        links: [
          { key: 'site', label: 'Website', url: 'https://google.com' },
          { key: 'gh', label: 'GitHub', url: '#' },
        ]
      }
    };

    userEl.textContent = state.user;
    hostEl.textContent = state.host;

    /* ---------- modal open/close & focus trap ---------- */
    const focusablesSel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let lastFocus = null;

    function applyEffects() {
      windowEl.classList.toggle('fx-warp', !!state.effects.warp);
      screen.classList.toggle('fx-flicker', !!state.effects.flicker);
    }

    function openModal(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyGlobal);
      modal.addEventListener('keydown', trapFocus);

      // populate terminal from live DOM
      try { state.data = scrapeSiteData(); } catch { }

      setTimeout(() => input.focus(), 0);
      printMotd();
      applyEffects();
      updateOpenersExpanded(true);
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyGlobal);
      modal.removeEventListener('keydown', trapFocus);
      updateOpenersExpanded(false);
      lastFocus && lastFocus.focus();
    }
    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      const focusables = modal.querySelectorAll(focusablesSel);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function onKeyGlobal(e) {
      if (e.key === 'Escape') closeModal();
      if (document.activeElement === input) {
        if (e.key === 'ArrowUp') { e.preventDefault(); histPrev(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); histNext(); }
        if (e.key === 'Tab') { e.preventDefault(); doAutocomplete(); }
      }

      // alt ~ handler, open anywhere via "~"
      if (e.key === '`' || e.key === '~') {
        const isOpen = modal.getAttribute('aria-hidden') === 'false';
        if (isOpen) closeModal(); else openModal();
      }
    }

    modal.querySelectorAll('[data-term-close]').forEach(b => b.addEventListener('click', closeModal));
    modal.addEventListener('click', (e) => { if (e.target.classList.contains('term-backdrop')) closeModal(); });

    function updateOpenersExpanded(expanded) {
      document.querySelectorAll('[aria-controls="terminal-modal"]').forEach(btn => {
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    }
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[aria-controls="terminal-modal"]');
      if (opener) { e.preventDefault(); openModal(); }
    });

    const el = (tag, cls, html) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (html != null) n.innerHTML = html;
      return n;
    };
    function echo(html, cls = 'term-line') {
      const line = el('div', cls, html);
      screen.appendChild(line);
      screen.scrollTop = screen.scrollHeight;
    }
    function promptLine(cmd) {
      const p = `<span class="dim">${state.user}@${state.host}</span>:<span class="path">${state.cwd}</span>$ <span class="cmd">${escapeHtml(cmd)}</span>`;
      echo(p);
    }
    function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

    function printMotd() {
      if (screen.dataset.booted) return;
      echo(`Welcome, <span class="hl">${state.user}</span>. Old-school terminal engaged.`, 'term-line boot');
      echo(`Type <span class="hl">help</span> for commands. Use <span class="hl">↑</span>/<span class="hl">↓</span> for history, <span class="hl">Tab</span> to autocomplete.`, 'term-line boot');
      screen.dataset.booted = '1';
    }

    /* ---------- history ---------- */
    function persistHistory() {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state.history.slice(-200))); } catch { }
    }
    function pushHistory(cmd) {
      if (!cmd) return;
      if (state.history[state.history.length - 1] !== cmd) state.history.push(cmd);
      state.histIndex = state.history.length;
      persistHistory();
    }
    function histPrev() {
      if (!state.history.length) return;
      state.histIndex = Math.max(0, state.histIndex - 1);
      input.value = state.history[state.histIndex] || '';
      setTimeout(() => input.setSelectionRange(9999, 9999), 0);
    }
    function histNext() {
      if (!state.history.length) return;
      state.histIndex = Math.min(state.history.length, state.histIndex + 1);
      input.value = state.history[state.histIndex] || '';
    }

    /* ---------- autocomplete ---------- */
    const COMMANDS = [
      'help', 'clear', 'history',
      'ls', 'cat', 'echo',
      'whoami', 'about', 'skills', 'projects', 'contact', 'links',
      'open', 'date', 'pwd', 'cd',
      'flicker', 'warp',
      'rain', 'pulse'
    ];

    function tokenise(raw) {
      // simple shell-ish parse
      const out = [];
      let cur = '', inQ = false, q = '';
      for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (!inQ && /\s/.test(c)) { if (cur) { out.push(cur); cur = ''; } continue; }
        if ((c === '"' || c === "'")) {
          if (!inQ) { inQ = true; q = c; continue; }
          if (q === c) { inQ = false; continue; }
        }
        cur += c;
      }
      if (cur) out.push(cur);
      return out;
    }

    function doAutocomplete() {
      const raw = input.value;
      const parts = tokenise(raw);
      if (!parts.length) return;
      const [cmd, ...rest] = parts;

      // command name completion
      if (parts.length === 1) {
        const matches = COMMANDS.filter(c => c.startsWith(cmd));
        if (matches.length === 1) input.value = matches[0] + ' ';
        else if (matches.length > 1) echo(matches.join('  '));
        return;
      }

      // argument completion pools
      const pool = [
        ...state.files,                                    // files / pseudo files
        ...state.data.links.map(l => l.key),               // site link keys
        ...state.data.projects.map(p => 'projects/' + p.key), // project pseudo-paths
        'on', 'off'
      ];
      const arg = rest[rest.length - 1];
      const matches = pool.filter(x => x.startsWith(arg));
      if (matches.length === 1) {
        input.value = cmd + ' ' + [...rest.slice(0, -1), matches[0]].join(' ');
      } else if (matches.length > 1) {
        echo(matches.join('  '));
      }
    }

    /* ---------- command helpers ---------- */
    function fmtList(arr) { return arr.join('  '); }
    function ensureUrl(u) {
      if (/^https?:\/\//i.test(u)) return u;
      return 'https://' + u;
    }

    /* ---------- command handlers, cd is aestehtics only ---------- */
    const handlers = {
      help() {
        echo([
          '<span class="v">Available commands</span>',
          `  help, clear, history`,
          `  ls [dir], cat ${escapeHtml('<file|projects/key>')}`,
          `  whoami, about, skills, projects, contact, links`,
          `  echo ${escapeHtml('<text>')}`,
          `  open ${escapeHtml('<key|url>')}`,
          `  pwd, cd (cd is cosmetic)`,
          `  date`,
          `  flicker ${escapeHtml('<on|off>')}   # toggle text flicker`,
          `  warp ${escapeHtml('<on|off>')}      # toggle CRT fisheye`,
          `  rain ${escapeHtml('<on|off>')}      # toggle site wide rain`,
          `  pulse ${escapeHtml('<on|off>')}     # toggle site wide pulse`
        ].join('\n'));
      },

      clear() { screen.innerHTML = ''; },

      history() { echo(state.history.map((h, i) => `${String(i + 1).padStart(3, ' ')}  ${escapeHtml(h)}`).join('\n') || '(empty)'); },

      ls(arg) {
        if (!arg || arg === '.') {
          const files = state.files.map(f => (/\./.test(f) ? f : f + '/'));
          echo(fmtList(files));
          return;
        }
        if (arg === 'projects' || arg === 'projects/') {
          const names = state.data.projects.map(p => p.key + '/');
          echo(fmtList(names));
          return;
        }
        echo(`ls: cannot access '${escapeHtml(arg)}': No such file or directory`, 'err');
      },

      cat(arg) {
        if (!arg) return echo('cat: missing file operand', 'err');

        // projects/<key> support
        if (arg.startsWith('projects/')) {
          const key = arg.split('/')[1];
          const p = state.data.projects.find(x => x.key === key);
          if (!p) return echo(`cat: ${escapeHtml(arg)}: No such file or directory`, 'err');
          const url = p.url && p.url !== '#' ? p.url : '(no url)';
          echo(`== ${p.name} ==\n${p.desc}\nURL: ${url}`);
          return;
        }

        switch (arg) {
          case 'README.md':
            echo(`# Info•Daemon Terminal
Use 'help' to see commands.
Try: about, projects, contact`); break;
          case 'about.txt':
            echo(escapeHtml(state.data.about)); break;
          case 'skills.txt':
            echo(state.data.skills.map(s => ` - ${escapeHtml(s)}`).join('\n')); break;
          case 'contact.txt':
            echo(`Email: bcfrx2168@mozmail.com (relay masked) Location: Night City`); break;
          case 'projects':
          case 'projects/':
            echo('cat: projects: Is a directory'); break;
          case 'links':
            echo(state.data.links.map(l => `${l.key}  ${l.label}  ${l.url}`).join('\n')); break;
          default:
            echo(`cat: ${escapeHtml(arg)}: No such file or directory`, 'err');
        }
      },

      echo(...args) { echo(escapeHtml(args.join(' '))); },

      whoami() { echo(`${escapeHtml(state.user)}`); },

      about() { echo(escapeHtml(state.data.about)); },

      skills() { echo(state.data.skills.map(s => ' - ' + escapeHtml(s)).join('\n')); },

      projects() {
        echo(state.data.projects.map(p => `* ${p.name} — ${p.desc}${p.url && p.url !== '#' ? ' [' + p.url + ']' : ''}`).join('\n'));
      },

      contact() {
        echo(`Email: bcfrx2168@mozmail.com (relay mask) Location: Night City}`);
        echo('Tip: open site | gh | tw')
      },

      links() {
        const w = Math.max(...state.data.links.map(l => l.key.length));
        echo(state.data.links.map(l => `${l.key.padEnd(w)} -> ${l.url}`).join('\n'));
      },

      open(target) {
        if (!target) return echo('open: missing operand', 'err');
        const link = state.data.links.find(l => l.key === target);
        const url = link ? link.url : (/^https?:\/\//i.test(target) ? target : ensureUrl(target));
        if (!url || url === '#') return echo(`open: cannot open '${escapeHtml(target)}'`, 'err');
        try { window.open(url, '_blank', 'noopener,noreferrer'); } catch { }
        echo(`opening ${escapeHtml(url)} …`);
      },

      date() {
        const d = new Date();
        // pretty RFC-ish output
        echo(d.toString());
      },

      pwd() {
        const path = `/home/${state.user}/${state.cwd === '~' ? '' : state.cwd}`.replace(/\/$/, '');
        echo(path);
      },

      // cd is cosmetic
      cd(arg) {
        if (!arg || arg === '~' || arg === '/') { state.cwd = '~'; }
        else if (arg === '..') { state.cwd = '~'; }
        else { state.cwd = String(arg).replace(/\/+/g, ''); }
      },

      flicker(arg) {
        if (!arg) return echo(`flicker is ${state.effects.flicker ? 'on' : 'off'} (try "flicker on" or "flicker off")`);
        const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
        if (!val) return echo(`flicker: expected 'on' or 'off'`, 'err');
        state.effects.flicker = (val === 'on');
        applyEffects();
        echo(`flicker ${val}`);
      },

      warp(arg) {
        if (!arg) return echo(`warp is ${state.effects.warp ? 'on' : 'off'} (try "warp on" or "warp off")`);
        const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
        if (!val) return echo(`warp: expected 'on' or 'off'`, 'err');
        state.effects.warp = (val === 'on');
        applyEffects();
        echo(`warp ${val}`);
      },

      rain(arg) {
        if (!rainToggle) return echo('rain: toggle not found', 'err');
        if (!arg) return echo(`rain is ${rainToggle.checked ? 'on' : 'off'} (try "rain on" or "rain off")`);
        const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
        if (!val) return echo(`rain: expected 'on' or 'off'`, 'err');
        setToggle(rainToggle, val === 'on');
        echo(`rain ${val}`);
      },

      pulse(arg) {
        if (!pulseToggle) return echo('pulse: toggle not found', 'err');
        if (!arg) return echo(`pulse is ${pulseToggle.checked ? 'on' : 'off'} (try "pulse on" or "pulse off")`);
        const val = /^(on|off)$/i.test(arg) ? arg.toLowerCase() : null;
        if (!val) return echo(`pulse: expected 'on' or 'off'`, 'err');
        setToggle(pulseToggle, val === 'on');
        echo(`pulse ${val}`);
      },
    };

    /* ---------- toggles ---------- */
    function setToggle(el, on) {
      if (!el) return false;
      el.checked = !!on;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    /* ---------- form submit ---------- */
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = input.value;
      const parts = tokenise(raw.trim());
      if (!parts.length) return;

      const cmd = parts[0];
      const args = parts.slice(1);

      promptLine(raw);
      pushHistory(raw);
      input.value = '';

      if (handlers[cmd]) {
        try { handlers[cmd](...args); }
        catch (err) { echo(`error: ${escapeHtml(err.message)}`, 'err'); }
      } else {
        echo(`${escapeHtml(cmd)}: command not found`, 'err');
        echo(`Type 'help' to see available commands.`);
      }
    });

    /* ================= micro “pop” flicker ================= */
    function randomFlickerTick() {
      if (!state.effects.flicker) return;
      const lines = screen.querySelectorAll('.term-line');
      if (!lines.length) return;
      const idx = Math.max(0, lines.length - 1 - Math.floor(Math.random() * 6));
      const el = lines[idx];
      if (!el) return;
      el.style.transition = 'filter .05s ease, opacity .05s ease';
      el.style.filter = 'blur(.2px) brightness(1.25)';
      el.style.opacity = '0.92';
      setTimeout(() => { el.style.filter = ''; el.style.opacity = ''; }, 65 + Math.random() * 120);
    }
    setInterval(randomFlickerTick, 500 + Math.random() * 1200);
    applyEffects();
  })();
}