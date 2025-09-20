// src/hooks/useSiteChrome.js
import { useEffect } from "react";

export default function useSiteChrome() {
  useEffect(() => {
    // ---------- helpers ----------
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    // ---------- Accent cycle ----------
    const accents = [
      "#00eaff","#67ff85","#ffe359","#ff2bd6","#9d4bff","#ff6b00","#ccff00","#ff1744"
    ];
    let accentIndex = 0;
    let accentTimer = null;

    const setAccent = (c) => {
      const root = document.documentElement;
      root.style.setProperty("--accent", c);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", c);
    };
    const startAccentCycle = () => {
      stopAccentCycle();
      accentTimer = setInterval(() => {
        accentIndex = (accentIndex + 1) % accents.length;
        setAccent(accents[accentIndex]);
      }, 1800);
    };
    const stopAccentCycle = () => {
      if (accentTimer) { clearInterval(accentTimer); accentTimer = null; }
    };

    setAccent(accents[accentIndex]);
    const cycleBox = $("#cycle-accent");
    if (cycleBox) {
      cycleBox.checked = true;
      cycleBox.addEventListener("change", (e) =>
        e.target.checked ? startAccentCycle() : stopAccentCycle()
      );
      startAccentCycle();
    }

    // ---------- Console boot messages ----------
    const bootLines = [
      'querying ChatGPT... [OK]',
      './neon_init.sh --verbose',
      '>>> initializing subsystems...',
      '>>> loaded 12/12 modules [OK]',
      'WARNING! You are logged in as root.',
      'press "~" for more info',
    ];
    let bootTimeouts = [];
    const runBootSequence = () => {
      const log = $("#console-log");
      if (!log) return;
      let i = 0;
      const tick = () => {
        log.textContent = bootLines[i];
        i++;
        if (i < bootLines.length) {
          bootTimeouts.push(setTimeout(tick, 950));
        } else {
          i = 0;
          bootTimeouts.push(setTimeout(tick, 20000));
        }
      };
      bootTimeouts.push(setTimeout(tick, 700));
    };

    const consoleEl = $("footer .console");
    let consoleObserver;
    if (consoleEl) {
      consoleObserver = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) {
          runBootSequence();
          obs.disconnect();
        }
      }, { threshold: 0.25 });
      consoleObserver.observe(consoleEl);
    }

    // ---------- Toast ----------
    const toast = (msg) => {
      const t = $("#toast");
      if (!t) return;
      t.classList.remove("visually-hidden");
      Object.assign(t.style, {
        position:"fixed", left:"50%", bottom:"28px", transform:"translateX(-50%)",
        padding:"12px 16px", borderRadius:"12px", border:"1px solid var(--glass-stroke)",
        background:"rgba(5,10,20,.8)", color:"var(--text-0)", boxShadow:"0 0 18px rgba(0,234,255,.3)"
      });
      t.textContent = msg;
      clearTimeout(t._h);
      t._h = setTimeout(() => t.classList.add("visually-hidden"), 2000);
    };
    // expose for other scripts if needed
    window.toast = toast;

    // ---------- Custom cursor ----------
    const cursor = $(".cursor");
    const dot = $(".cursor-dot");
    let cx = 0, cy = 0, tx = 0, ty = 0;
    const onMouseMove = (e) => {
      cx = e.clientX; cy = e.clientY;
      if (dot) dot.style.transform = `translate(${cx - 3}px, ${cy - 3}px)`;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    let cursorRaf = 0;
    const moveCursor = () => {
      tx += (cx - tx) * 0.18;
      ty += (cy - ty) * 0.18;
      if (cursor) cursor.style.transform = `translate(${tx - 13}px, ${ty - 13}px)`;
      cursorRaf = requestAnimationFrame(moveCursor);
    };
    moveCursor();

    // ---------- Contact form ----------
    const contactForm = $("#contact-form");
    const onContactSubmit = (e) => {
      const fd = new FormData(e.target);
      const name = encodeURIComponent(fd.get("name"));
      const email = encodeURIComponent(fd.get("email"));
      const msg = encodeURIComponent(fd.get("message"));
      const subject = `Neon transmission from ${name}`;
      const body = `From: ${name} <${email}>\n\n${msg}`;
      e.target.action = `mailto:you@example.com?subject=${subject}&body=${body}`;
    };
    contactForm?.addEventListener("submit", onContactSubmit);

    // ---------- Reduced motion ----------
    const mediaMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => {
      const reduced = mediaMotion.matches;
      const grid = $(".grid");
      if (grid) grid.style.animationPlayState = reduced ? "paused" : "running";
    };
    mediaMotion.addEventListener("change", handleMotion);
    handleMotion();

    // ---------- Footer “bash” launcher & hotkey ----------
    const footerInput = $("#footer-bash");
    const opener = $("#open-terminal");

    const onFooterKey = (e) => {
      if (e.key !== "Enter") return;
      const v = footerInput.value.trim().toLowerCase();
      if (v === "bash") {
        opener?.click();
        setTimeout(() => footerInput.blur(), 0);
      } else {
        toast?.("Hint: type bash");
      }
    };
    footerInput?.addEventListener("keydown", onFooterKey);

    const onGlobalKey = (e) => {
      const active = document.activeElement;
      const typing =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);
      if (typing && active !== footerInput) return;
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        opener?.click();
      }
    };
    window.addEventListener("keydown", onGlobalKey);

    // ---------- Holographic card tilt ----------
    const card = $(".holo-frame");
    const onCardMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      card.style.transform = `rotateX(${(-dy * 8).toFixed(2)}deg) rotateY(${(dx * 8).toFixed(2)}deg)`;
    };
    const onCardLeave = () => { card.style.transform = "rotateX(0deg) rotateY(0deg)"; };
    if (card) {
      card.addEventListener("mousemove", onCardMove);
      card.addEventListener("mouseleave", onCardLeave);
    }

    // ---------- cleanup ----------
    return () => {
      stopAccentCycle();
      bootTimeouts.forEach(clearTimeout);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(cursorRaf);
      contactForm?.removeEventListener("submit", onContactSubmit);
      mediaMotion.removeEventListener?.("change", handleMotion);
      footerInput?.removeEventListener("keydown", onFooterKey);
      window.removeEventListener("keydown", onGlobalKey);
      if (card) {
        card.removeEventListener("mousemove", onCardMove);
        card.removeEventListener("mouseleave", onCardLeave);
      }
      if (consoleObserver) consoleObserver.disconnect();
      try { delete window.toast; } catch { /* ignore in strict mode */ }
    };
  }, []);
}
