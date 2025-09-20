// src/App.jsx
import React, { useEffect, useRef } from 'react';

import HeaderWithIsland from "./components/Header.jsx";
import useSiteChrome from './hooks/useSiteChrome';
import useRain from "./hooks/useRain.js";
import { initSiteChrome } from './legacy/index.js';
import { initTerminal } from './legacy/terminal.js';
import { initProjects } from './legacy/project.js';
import { initMLCorner } from './legacy/mlcorner.js';

export default function App() {

  const initialized = useRef(false);
  useSiteChrome();
  useRain();
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initProjects();
    initTerminal();
    initMLCorner();
  }, []);

  return (
    <>
      {/* background */}
      <canvas id="rain" aria-hidden="true"></canvas>
      <div className="grid" aria-hidden="true"></div>
      <div className="scanlines" aria-hidden="true"></div>

      {/* custom cursor */}
      <div className="cursor" aria-hidden="true"></div>
      <div className="cursor-dot" aria-hidden="true"></div>

      <HeaderWithIsland />

      {/* main */}
      <main id="top">
        <section className="container hero" aria-label="Intro">
          <div>
            <span className="badge">// Human Interface 0x01</span>
            <h1 className="glitch" data-text="Developer Online">
              Developer Online
            </h1>
            <p className="lead">Coding at unholy hours.</p>
            <p className="top-desc">
              Identity: Subject 2077 - Ben Carnes software developer - Creative
              Computing & Systems Integration.
            </p>
            <p className="top-desc">
              Role: Software developer - Software & Systems Integration.
            </p>
            <p className="top-desc">
              Report: As of now, Subject 2077&apos;s work spans from across the
              stack from user applications, to full stack development and a
              touch of lower level systems.
            </p>
            <div className="cta">
              <a
                className="btn is-accented"
                href="#projects"
                aria-label="View Projects"
              >
                View Projects
              </a>
              <a
                className="btn is-accented"
                href="#contact"
                aria-label="Contact Me"
              >
                Contact
              </a>
              <a
                className="btn is-accented"
                href="/assets/ZONGYU_CARNES_V3.pdf"
                download
                aria-label="Download Resume"
              >
                Resume
              </a>
            </div>
            <div className="stats" role="list" aria-label="Quick stats">
              <div className="stat" role="listitem">
                <b>2</b> Side Projects in Progress
              </div>
              <div className="stat" role="listitem">
                <b>3AM</b> Peak Creativity
              </div>
              <div className="stat" role="listitem">
                <b>411+</b> Cups of Coffee Consumed
              </div>
            </div>
          </div>

          {/* ID card */}
          <div
            className="portrait holo-id"
            aria-label="Holographic ID for Ben Carnes"
          >
            <div className="holo-frame">
              <div className="holo-foil"></div>
              <div className="holo-noise"></div>
              <div className="holo-scan"></div>

              <div className="holo-content">
                <div className="holo-chip" aria-hidden="true"></div>
                <div className="holo-top">
                  <span className="holo-label">IDENTITY: Subject 2077</span>
                  <span className="holo-badge">PENDING</span>
                </div>
                <div className="holo-name">
                  <span className="holo-first">BEN</span>
                  <span className="holo-last">CARNES</span>
                </div>
                <div className="holo-meta">
                  <span className="meta-line">
                    creative computing • systems &amp; AI integration
                  </span>
                  <span className="meta-line microtext" aria-hidden="true">
                    BC • prototype • non-transferable
                  </span>
                </div>

                {/* guilloché */}
                <svg
                  className="holo-guilloche"
                  viewBox="0 0 300 150"
                  aria-hidden="true"
                  focusable="false"
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stopColor="#0ff" stopOpacity="0.9" />
                      <stop offset="1" stopColor="#f0f" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,75 C40,20 80,130 120,75 160,20 200,130 240,75 270,45 300,75 300,75"
                    fill="none"
                    stroke="url(#g1)"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                  <path
                    d="M0,75 C40,130 80,20 120,75 160,130 200,20 240,75 270,105 300,75 300,75"
                    fill="none"
                    stroke="url(#g1)"
                    strokeWidth="1"
                    opacity="0.35"
                  />
                </svg>

                {/* tiny QR-ish glyph */}
                <div className="holo-qr" aria-hidden="true">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i}></span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <section id="about">
            <div className="container">
              <h2 className="section-title">/ Work History</h2>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="year">2025</div>
                  <div>
                    <h3>AI Applications Development Intern @ LCI</h3>
                    <p className="meta">
                      Design and implement a full stack end-to-end RAG chatbot
                      pipeline hosted on Azure
                    </p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="year">2023</div>
                  <div>
                    <h3>Team Member @ WeAccelerate</h3>
                    <p className="meta">
                      Prototyped a chatbot designed for giving users health
                      advice and potential triage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section id="projects">
            <div className="container">
              <h2 className="section-title">/ Projects</h2>
              <div className="grid-cards" role="list">
                <article
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-controls="project-modal"
                  data-project="gamegrab"
                >
                  <span className="tag">Python/C++</span>
                  <h3>Gamegrab</h3>
                  <p className="meta">
                    Desktop OCR + translation for PC games built with PySide6
                    GUI, EasyOCR, and a C++ capture backend.
                  </p>
                  <div className="actions">
                    <a
                      href="https://github.com/spartan3661/Gamegrab"
                      target="_blank"
                      rel="noreferrer"
                      className="icon"
                      title="Go to GitHub"
                    >
                      <img
                        src="/icons/github.svg"
                        alt="Go to GitHub"
                        width="32"
                        height="32"
                        style={{ verticalAlign: 'middle' }}
                      />
                    </a>
                  </div>
                </article>

                <article
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-controls="project-modal"
                  data-project="wgcapture"
                >
                  <span className="tag">Python/C++</span>
                  <h3>WGCapture</h3>
                  <p className="meta">
                    PyPI package enabling highly consistent per-window screen
                    capture via GPU-backed frame pooling.
                  </p>
                  <div className="actions">
                    <a
                      href="https://github.com/spartan3661/WGCapture"
                      target="_blank"
                      rel="noreferrer"
                      className="icon"
                      title="Go to GitHub"
                    >
                      <img
                        src="../public/icons/github.svg"
                        alt="Go to GitHub"
                        width="32"
                        height="32"
                        style={{ verticalAlign: 'middle' }}
                      />
                    </a>
                  </div>
                </article>

                <article
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-controls="project-modal"
                  data-project="cck3"
                >
                  <span className="tag">C++</span>
                  <h3>Chamber Crawler 3000+</h3>
                  <p className="meta">
                    A console driven rogue like dungeon crawler.
                  </p>
                  <div className="actions">
                    <a
                      href="https://github.com/spartan3661/cck3"
                      target="_blank"
                      rel="noreferrer"
                      className="icon"
                      title="Go to GitHub"
                    >
                      <img
                        src="../public/icons/github.svg"
                        alt="Go to GitHub"
                        width="32"
                        height="32"
                        style={{ verticalAlign: 'middle' }}
                      />
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section id="skills">
            <div className="container">
              <h2 className="section-title">/ Skills</h2>
              <div className="skills">
                <article className="card">
                  <h3>Languages</h3>
                  <p className="meta">Python, C++, C, JavaScript, HTML, CSS</p>
                  <div className="bar" style={{ '--pct': '95%' }}>
                    <span aria-hidden="true"></span>
                  </div>
                </article>
                <article className="card">
                  <h3>Frameworks & Libraries</h3>
                  <p className="meta">PyTorch, PySide6, React, WordPress (JS/PHP)</p>
                  <div className="bar" style={{ '--pct': '88%' }}>
                    <span aria-hidden="true"></span>
                  </div>
                </article>
                <article className="card">
                  <h3>Tools & Systems</h3>
                  <p className="meta">Git, Bash, Linux, Docker, Jupyter, DLL Dev, Direct3D</p>
                  <div className="bar" style={{ '--pct': '40%' }}>
                    <span aria-hidden="true"></span>
                  </div>
                </article>
                <article className="card">
                  <h3>Cloud & Platforms</h3>
                  <p className="meta">Microsoft Azure, Qdrant</p>
                  <div className="bar" style={{ '--pct': '80%' }}>
                    <span aria-hidden="true"></span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="contact">
            <div className="container">
              <h2 className="section-title">/ Contact</h2>
              <form
                id="contact-form"
                action="https://formspree.io/f/mldwvkao"
                method="POST"
              >
                <label>
                  <input
                    name="name"
                    required
                    placeholder="Your Name"
                    autoComplete="name"
                  />
                </label>
                <label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Your email..."
                    autoComplete="email"
                  />
                </label>
                <label>
                  <textarea
                    name="message"
                    required
                    placeholder="Transmit a message…"
                  ></textarea>
                </label>
                <button className="btn is-accented" type="submit">
                  Send Transmission
                </button>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="small">Psst! I am not evil :) </span>
                </div>
              </form>
            </div>
          </section>
        </section>
      </main>

      {/* ML Corner */}
      <section className="ml-corner" aria-label="ML Corner">
        <div className="ml-module">
          <h3 className="ml-title">// ML Corner</h3>
          <div id="ml-feed" className="ml-feed">
            <p className="ml-line">[sys] Loading ML modules…</p>
          </div>
        </div>
      </section>

      {/* footer / console */}
      <footer>
        <div className="console" aria-live="polite" aria-atomic="true">
          <div className="console-line">
            <span>
              <b>info-daemon@unknown</b>:~$ <span id="console-log">ready</span>
              <span className="blink">▮</span>
            </span>
            <label htmlFor="footer-bash" className="sr-only"></label>
            <input
              id="footer-bash"
              type="text"
              placeholder='type "bash" and press Enter'
              aria-label='Type "bash" and press Enter to open the terminal'
            />
            <small className="hint">
              press <kbd>~</kbd> to open anywhere
            </small>
          </div>
        </div>

        <div className="site-controls">
          <label className="chip" title="Toggle matrix rain">
            <input type="checkbox" id="toggle-rain" defaultChecked />
            <span className="switch" aria-hidden="true"></span>
            <span className="label">Rain</span>
          </label>

          <label className="chip" title="Cycle accent color">
            <input type="checkbox" id="cycle-accent" defaultChecked />
            <span className="switch" aria-hidden="true"></span>
            <span className="label">Pulse</span>
          </label>
        </div>
      </footer>

      {/* Toast */}
      <div id="toast" className="visually-hidden" role="status" aria-live="polite"></div>

      {/* Terminal modal */}
      <div
        className="term-modal"
        id="terminal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terminal-title"
        aria-hidden="true"
      >
        <div className="term-backdrop" data-term-close=""></div>
        <div className="term-window" role="document">
          <header className="term-chrome">
            <div className="term-dots">
              <button
                className="dot dot--close"
                title="Close (Esc)"
                aria-label="Close terminal"
                data-term-close=""
              ></button>
              <button
                className="dot dot--min"
                title="Minimize"
                aria-label="Minimize"
                data-term-close=""
              ></button>
              <button
                className="dot dot--max"
                title="Maximize"
                aria-label="Maximize"
              ></button>
            </div>
            <h2 id="terminal-title">/bin/bash — Retro Terminal</h2>
          </header>

          <section
            className="term-screen"
            id="term-screen"
            aria-live="polite"
            aria-atomic="false"
          >
            <div className="term-line boot">[sys] loading shell…</div>
            <div className="term-line boot">
              [sys] motd: type <span className="hl">help</span> to begin
            </div>
          </section>

          <form className="term-inputbar" id="term-form" autoComplete="on">
            <label htmlFor="term-input" className="sr-only">
              Command
            </label>
            <div className="prompt" aria-hidden="true">
              <span id="term-user">guest</span>@<span id="term-host">cyberyou</span>:
              <span className="cwd">~</span>$
            </div>
            <input
              id="term-input"
              name="cmd"
              type="text"
              inputMode="text"
              spellCheck={false}
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* CRT warp filter defs (hidden) */}
      <svg
        width="0"
        height="0"
        className="sr-only"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="crtWarp" x="-20%" y="-20%" width="140%" height="140%">
            <feImage
              preserveAspectRatio="none"
              x="0"
              y="0"
              width="100%"
              height="100%"
              xlinkHref={
                "data:image/svg+xml;utf8," +
                "<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000'>" +
                "<defs><radialGradient id='g' cx='50%%' cy='50%%' r='70%%'>" +
                "<stop offset='0%%'  stop-color='rgb(255,255,255)'/>" +
                "<stop offset='60%%' stop-color='rgb(180,180,180)'/>" +
                "<stop offset='100%%' stop-color='rgb(80,80,80)'/>" +
                "</radialGradient></defs>" +
                "<rect width='100%%' height='100%%' fill='url(%23g)'/></svg>"
              }
              result="map"
            />
            <feGaussianBlur in="map" stdDeviation="20" result="blur" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blur"
              scale="35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Project modal root */}
      <div
        className="project-modal"
        id="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        aria-hidden="true"
      >
        <div className="project-backdrop" data-project-close=""></div>
        <div className="project-window" role="document">
          {/* project.js will inject content */}
        </div>
        <link rel="preload" href="../public/icons/github.svg" as="image" />
      </div>
    </>
  );
}
