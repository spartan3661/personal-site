// scripts/project.js

// Simple project registry for modal content.
// Edit these details as you like; you can also fetch dynamically later.
const PROJECTS = {
  gamegrab: {
    title: "Gamegrab",
    blurb: `Gamegrab was born out of the frustration of trying to translate text in Japanese games using clunky workflows that 
    couldn’t keep up with fast-paced action titles. For example, using prtsc or windows+shift+s did not always work and often 
    caused games to lose focus. You then had to tab over to Google Translate, for the actual translation. And so, I made Gamegrab.\n
    Gamegrab captures a game window in with a simple button click. It runs OCR + translation, and overlays the translated text directly where the original appeared. Built with PySide6 and a custom C++ capture backend, it’s designed to be 
    reliable across different resolutions, DPIs and screen modes such as borderless or fullscreen. All the while, it is responsive enough for gameplay.\n
    Through this project I learned how to handle multithreading in PySide6 to prevent UI blocking, and gained experience integrating 
    GPU-based capture pipelines on Windows with high-level application code.`,
    tech: ["Python", "C++", "PySide6", "Direct3D"],
    links: [
      { label: "GitHub", href: "https://github.com/spartan3661/Gamegrab" },
    ],
    bullets: [
      "On-demand per-window capture with GPU-friendly pipeline.",
      "Real-time OCR with post-processing for noisy HUD text.",
      "Hotkeys, overlay indicators, and translation display.",
    ],
  },
  wgcapture: {
    title: "WGCapture",
    blurb:`WGCapture spawned out of the Gramegrab project and came out of my frustrations with Python screen capture libraries that broke down in real-world use. Tools like mss or pygetwindow struggled with fullscreen games, and windowed games. Even moving a game to a different monitor was enough to break capture. I wanted something that just worked.\n
  WGCapture provides a reliable per-window capture pipeline on Windows, powered by a C++ backend. We create a Direct3D device and expose it to WinRT. This allows us to create a framepool which the GPU can populate. This DLL file then hands off the image data to python for further processing. This fixes the stuttering or weird scaling issues. On top of that, I wrapped it up into a simple PyPI package, making it easy to drop into any Python project.\n
  Building this gave me a taste of lower level development, dealing with GPU-level APIs for grabbing frames, and package the whole thing cleanly for distribution. It was also a great exercise in making low-level systems code accessible to higher-level app developers.`,
    tech: ["Python", "C++", "WinRT", "Windows Graphics Capture"],
    links: [
      { label: "GitHub", href: "https://github.com/spartan3661/WGCapture" },
    ],
    bullets: [
      "Easy per-window capture targeting specific HWND as opposed to screen snipping.",
      "Consistent capture across different monitors.",
      "Easy installation using pip install wgcapture.",
    ],
  },
  cck3: {
    title: "Chamber Crawler 3000+",
    blurb:`Chamber Crawler 3000+ (CC3k+) was a course project where I built a simple console-based roguelike in C++. Players can explore chambers, fight enemies, and pick up items — all rendered as text in the terminal.\n
  While it’s incomplete and only coursework, it gave me solid practice with C++ fundamentals like OOP design, RAII, and C++ design patterns.`,
    tech: ["C++"],
    links: [{ label: "GitHub", href: "https://github.com/spartan3661/cck3" }],
    bullets: [
      "Turn-based movement and combat loop.",
      "Fixed floor generation.",
      "Implementing a variety of OOP principles.",
    ],
  },
};

const modal = document.getElementById("project-modal");
const win = modal?.querySelector(".project-window");

// Basic focus trap helpers
let lastFocused = null;
const getFocusable = (root) =>
  [...root.querySelectorAll(
    'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

  
function openModal(key) {
  const data = PROJECTS[key];
  if (!modal || !win || !data) return;

  lastFocused = document.activeElement;

  win.innerHTML = `
    <header class="pm-chrome">
      <h3 id="project-modal-title" class="pm-title">${escapeHtml(data.title)}</h3>
      <div class="pm-actions">
        <button class="pm-close" title="Close" aria-label="Close" data-project-close>✕</button>
      </div>
    </header>

    <section class="pm-body" id="project-modal-body" aria-describedby="project-modal-desc">
      <div class="pm-blurb" id="project-modal-desc">${escapeHtml(data.blurb)}</div>

      <div class="pm-meta">
        <strong>Tech:</strong>
        <span>${data.tech.map(escapeHtml).join(" • ")}</span>
      </div>

      ${data.bullets?.length ? `
      <ul class="pm-list">
        ${data.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>` : ""}
    </section>

    <footer class="pm-footer">
    <span class="pm-hint">Explore source & docs</span>
    ${data.links?.length ? `
        ${data.links.map(link => `
        <a class="pm-icon-link"
            href="${escapeAttr(link.href)}"
            target="_blank" rel="noopener noreferrer"
            title="${escapeHtml(link.label)}">
            <img src="/icons/github.svg" alt="${escapeHtml(link.label)}" />
        </a>
        `).join("")}
    ` : ""}
    </footer>
  `;

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const focusables = getFocusable(win);
  (focusables[0] || win).focus({ preventScroll: true });
}


function closeModal() {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  win.innerHTML = "";
  if (lastFocused && document.contains(lastFocused)) {
    lastFocused.focus({ preventScroll: true });
  }
}

// Click handling: open cards, ignore inside anchors
document.addEventListener("click", (e) => {
  // close if clicked on backdrop or element with [data-project-close]
  if (e.target.closest("[data-project-close]") || e.target === modal.querySelector(".project-backdrop")) {
    e.preventDefault();
    closeModal();
    return;
  }

  const card = e.target.closest(".card[data-project]");
  if (!card) return;

  // If the click originated on a link inside .actions, let it pass
  if (e.target.closest(".actions a")) return;

  const key = card.getAttribute("data-project");
  e.preventDefault();
  openModal(key);
});

// Keyboard: Enter/Space to open; Esc to close; Tab trap
document.addEventListener("keydown", (e) => {
  // Esc closes when modal open
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
    e.preventDefault();
    closeModal();
    return;
  }

  // Open when focused on a card
  const el = document.activeElement;
  if ((e.key === "Enter" || e.key === " ") && el?.matches?.('.card[data-project]')) {
    e.preventDefault();
    openModal(el.getAttribute("data-project"));
    return;
  }

  // Focus trap when open
  if (e.key === "Tab" && modal.getAttribute("aria-hidden") === "false") {
    const focusables = getFocusable(win);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus(); 
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
});

// Backdrop click (already handled with attribute check) — but guard if structure changes.
modal?.addEventListener("click", (e) => {
  if (e.target.classList.contains("project-backdrop")) {
    closeModal();
  }
});

// Helpers
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function escapeAttr(str) {
  return escapeHtml(str).replaceAll('"', "&quot;");
}
