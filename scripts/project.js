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
    images: [
      "assets/menu.png",
      "assets/menu_ocr.png",
      "assets/tevi1.png",
      "assets/tevi1_ocr.png",
    ]
  },
  wgcapture: {
    title: "WGCapture",
    blurb: `WGCapture spawned out of the Gramegrab project and came out of my frustrations with Python screen capture libraries that broke down in real-world use. Tools like mss or pygetwindow struggled with fullscreen games, and windowed games. Even moving a game to a different monitor was enough to break capture. I wanted something that just worked.\n
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
    blurb: `Chamber Crawler 3000+ (CC3k+) was a course project where I built a simple console-based roguelike in C++. Players can explore chambers, fight enemies, and pick up items — all rendered as text in the terminal.\n
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

function ghBase() {
  // Works for both user/organization pages (/) and project pages (/repo/)
  const parts = location.pathname.split('/').filter(Boolean);
  return parts.length ? `/${parts[0]}/` : '/';
}
function withBase(path) {
  // If already absolute or full URL, leave it
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return path; // you probably won't use this on project pages
  // If it already starts with 'assets/' or 'icons/', just prefix the base
  return ghBase() + path.replace(/^(\.\/)+/, '');
}



const modal = document.getElementById("project-modal");
const win = modal?.querySelector(".project-window");

let teardownCarousel = null;

// focus trap
let lastFocused = null;
const getFocusable = (root) =>
  [...root.querySelectorAll(
    'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
  )].filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));


function openModal(key) {
  const data = PROJECTS[key];
  if (!modal || !win || !data) return;

  lastFocused = document.activeElement;

  const hasImages = Array.isArray(data.images) && data.images.length > 0;
  const multipleImages = hasImages && data.images.length > 1;
  win.innerHTML = `
    <header class="pm-chrome">
      <h3 id="project-modal-title" class="pm-title">${escapeHtml(data.title)}</h3>
      <div class="pm-actions">
        <button class="pm-close" title="Close" aria-label="Close" data-project-close>✕</button>
      </div>
    </header>

    <section class="pm-body" id="project-modal-body" aria-describedby="project-modal-desc">
      ${hasImages ? `
        <div class="pm-media" role="group" aria-label="Project images">
          <div class="pm-carousel">
            <button class="pm-nav pm-nav-prev" data-carousel-prev aria-label="Previous image" ${multipleImages ? "" : "hidden"}>‹</button>
            <div class="pm-frame">
              <img
                class="pm-img"
                src="${data.images[0] || ''}"
                alt="${escapeHtml(data.title)} screenshot 1"
                loading="lazy"
                data-carousel-img
                data-index="0"
              />
            </div>
            <button class="pm-nav pm-nav-next" data-carousel-next aria-label="Next image" ${multipleImages ? "" : "hidden"}>›</button>
          </div>
          ${multipleImages ? `
            <div class="pm-dots" role="tablist" aria-label="Image selector">
              ${data.images.map((_, i) => `
                <button class="pm-dot ${i === 0 ? 'is-active' : ''}" role="tab"
                        aria-selected="${i === 0 ? 'true' : 'false'}"
                        aria-label="Show image ${i + 1}"
                        data-dot="${i}"></button>
              `).join("")}
            </div>
          ` : ""}
        </div>
      ` : ""}

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
              <img src="${withBase('icons/github.svg')}" alt="${escapeHtml(link.label)}" />
          </a>
        `).join("")}
      ` : ""}
    </footer>
  `;

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (hasImages) {
    initCarousel(win, data.images, data.title, { autoplay: true, interval: 3500 });
  }

  const focusables = getFocusable(win);
  (focusables[0] || win).focus({ preventScroll: true });
}

function initCarousel(root, images, title, opts = {}) {
  const {
    autoplay = true,
    interval = 3500,
    pauseOnHover = true,
    pauseOnFocus = true,
  } = opts;

  const imgEl = root.querySelector("[data-carousel-img]");
  const prevBtn = root.querySelector("[data-carousel-prev]");
  const nextBtn = root.querySelector("[data-carousel-next]");
  const dots = [...root.querySelectorAll("[data-dot]")];
  const media = root.querySelector(".pm-media") || root;

  let idx = 0;
  let timer = null;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(newIdx) {
    idx = (newIdx + images.length) % images.length;
    imgEl.setAttribute("src", images[idx]);
    imgEl.setAttribute("alt", `${title} screenshot ${idx + 1}`);
    imgEl.dataset.index = String(idx);
    // attach once (idempotent)
    if (!imgEl._errBound) {
      imgEl.addEventListener("error", () => {
        console.warn("Image failed to load:", imgEl.src);
        imgEl.alt = "Image failed to load";
      });
      imgEl._errBound = true;
    }
    if (dots.length) {
      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === idx);
        d.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
    }
  }

  function onPrev() { show(idx - 1); reset(); }
  function onNext() { show(idx + 1); reset(); }

  prevBtn?.addEventListener("click", onPrev);
  nextBtn?.addEventListener("click", onNext);
  dots.forEach(d =>
    d.addEventListener("click", () => { show(parseInt(d.dataset.dot, 10) || 0); reset(); })
  );

  // (←/→) only when modal is open
  const onKey = (e) => {
    if (modal.getAttribute("aria-hidden") === "true") return;

    // don't hijack typing
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

    if (e.key === "ArrowLeft" && images.length > 1) { e.preventDefault(); onPrev(); }
    if (e.key === "ArrowRight" && images.length > 1) { e.preventDefault(); onNext(); }
  };

  document.addEventListener("keydown", onKey, { passive: false });

  const cleanup = () => document.removeEventListener("keydown", onKey);
  if (typeof teardownCarousel === "function") teardownCarousel();
  teardownCarousel = cleanup;

  root.addEventListener("keydown", onKey);

  // === Autoplay bits ===
  function start() {
    if (!autoplay || images.length < 2 || prefersReducedMotion()) return;
    stop();
    timer = setInterval(onNext, interval);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function reset() { stop(); start(); }

  if (pauseOnHover) {
    media.addEventListener("mouseenter", stop);
    media.addEventListener("mouseleave", start);
  }
  if (pauseOnFocus) {
    media.addEventListener("focusin", stop);
    media.addEventListener("focusout", start);
  }

  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);

  const obs = new MutationObserver(() => {
    if (modal.getAttribute("aria-hidden") === "true") {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      root.removeEventListener("keydown", onKey);
      obs.disconnect();
    }
  });
  obs.observe(modal, { attributes: true, attributeFilter: ["aria-hidden"] });

  images.slice(1).forEach(src => { const i = new Image(); i.src = src; });

  show(0);
  start();
}


function closeModal() {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  win.innerHTML = "";

  if (typeof teardownCarousel === "function") {
    teardownCarousel();
    teardownCarousel = null;
  }

  if (lastFocused && document.contains(lastFocused)) {
    lastFocused.focus({ preventScroll: true });
  }
}


document.addEventListener("click", (e) => {
  if (e.target.closest("[data-project-close]") || e.target === modal.querySelector(".project-backdrop")) {
    e.preventDefault();
    closeModal();
    return;
  }

  const card = e.target.closest(".card[data-project]");
  if (!card) return;

  if (e.target.closest(".actions a")) return;

  const key = card.getAttribute("data-project");
  e.preventDefault();
  openModal(key);
});

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

// Backdrop click
modal?.addEventListener("click", (e) => {
  if (e.target.classList.contains("project-backdrop")) {
    closeModal();
  }
});

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
