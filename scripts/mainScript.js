// ================================
// Neon Utilities + Interactions
// ================================
const $ = (sel, ctx=document)=> ctx.querySelector(sel);
const $$ = (sel, ctx=document)=> [...ctx.querySelectorAll(sel)];
const nav = document.querySelector("header");
// Accent cycling
const accents = ["#00eaff","#ff2bd6","#67ff85","#ffe359"];
let accentIndex = 0;
function setAccent(color){
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--link', color);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', color);
}
setAccent(accents[0]);


// Console boot messages
const bootLines = [
  "querying ChatGPT... [OK]",
  "./neon_init.sh --verbose",
  ">>> initializing subsystems...",
  ">>> loaded 12/12 modules [OK]",
  "WARNING! You are logged in as root.",
  "press \"~\" for more info",
];
function runBootSequence() {
  const log = document.querySelector("#console-log");
  if (!log) return;

  let i = 0;

  const tick = () => {
    log.textContent = bootLines[i];
    i++;

    if (i < bootLines.length) {
      // continue stepping through
      setTimeout(tick, 950);
    } else {
      // reset after a delay
      i = 0;
      setTimeout(tick, 20000); // wait 4s before looping again
    }
  };

  // kick off initial delay
  setTimeout(tick, 700);
}
// Wait until footer/console comes into view
const consoleEl = document.querySelector("footer .console");
if (consoleEl) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runBootSequence();
        obs.disconnect(); // only run once
      }
    });
  }, {
    threshold: 0.25 // 25% visible
  });

  observer.observe(consoleEl);
}

// Toast
function toast(msg){
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
  t._h = setTimeout(()=> { t.classList.add("visually-hidden") }, 2000);
}
window.toast = toast; // expose for inline links

// Matrix Rain — original look, just slower/faster via SPEED
const rain = $("#rain");
const ctx = rain.getContext("2d");

let rainActive = true;
let columns, drops;
let fontSize = 16;
const SPEED = 0.8;
const chars = "アイウエオカキクケコｱｲｳｴｵｶｷｸｹｺ01░▒▓█#<>/*";

function resizeCanvas(){
  rain.width  = Math.floor(window.innerWidth  * devicePixelRatio);
  rain.height = Math.floor(window.innerHeight * devicePixelRatio);
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);

  columns = Math.floor(window.innerWidth / fontSize);
  drops   = Array(columns).fill(1 + Math.random()*20);
}

function drawRain(){
  if (!rainActive) return;

  // trail wipe (raise to .12 for quicker fade = calmer look)
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, rain.width, rain.height);

  // glyphs (lower alpha = softer)
  ctx.fillStyle = "rgba(0,234,255,0.2)";
  ctx.font = `${fontSize}px Consolas, monospace`;

  for (let i = 0; i < drops.length; i++){
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    ctx.fillText(text, x, y);

    if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
    drops[i] += SPEED;
  }

  requestAnimationFrame(drawRain);
}

window.addEventListener('resize', resizeCanvas, { passive:true });
resizeCanvas();
drawRain();

// Controls
$("#toggle-rain")?.addEventListener('change', (e)=>{
  rainActive = e.target.checked;
  if(rainActive) drawRain();
});
$("#cycle-accent")?.addEventListener('change', (e)=>{
  if(e.target.checked){
    e.target._int = setInterval(()=>{
      accentIndex = (accentIndex+1)%accents.length;
      setAccent(accents[accentIndex]);
    }, 1800);
  } else {
    clearInterval(e.target._int);
  }
});

// Custom cursor
const cursor = $(".cursor");
const dot = $(".cursor-dot");
let cx = 0, cy = 0, tx = 0, ty = 0;

window.addEventListener('mousemove', (e)=>{
  cx = e.clientX; cy = e.clientY;
  if (dot) dot.style.transform = `translate(${cx-3}px, ${cy-3}px)`;
}, {passive:true});

function moveCursor(){
  tx += (cx - tx) * 0.18;
  ty += (cy - ty) * 0.18;
  if (cursor) cursor.style.transform = `translate(${tx-13}px, ${ty-13}px)`;
  requestAnimationFrame(moveCursor);
}
moveCursor();

// Accent on hover targets
/*
$$('a,button,.chip,.card').forEach(el=>{
  el.addEventListener('mouseenter', ()=> document.documentElement.style.setProperty('--accent', '#ff2bd6'));
  el.addEventListener('mouseleave', ()=> document.documentElement.style.setProperty('--accent', accents[accentIndex]));
});
*/


// Contact form mailto enhancement (subject/body formatting)
$("#contact-form")?.addEventListener('submit', (e)=>{
  const fd = new FormData(e.target);
  const name = encodeURIComponent(fd.get('name'));
  const email = encodeURIComponent(fd.get('email'));
  const msg = encodeURIComponent(fd.get('message'));
  const subject = `Neon transmission from ${name}`;
  const body = `From: ${name} <${email}>\n\n${msg}`;
  e.target.action = `mailto:you@example.com?subject=${subject}&body=${body}`;
});

// Respect reduced motion users
const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const handleMotion = () => {
  const reduced = mediaMotion.matches;
  const grid = document.querySelector('.grid');
  if (grid) grid.style.animationPlayState = reduced ? 'paused' : 'running';
  const rainToggle = $("#toggle-rain");
  if (rainToggle) rainToggle.checked = !reduced;
  rainActive = !reduced;
  if(rainActive) drawRain();
};
mediaMotion.addEventListener('change', handleMotion);
handleMotion();


// Footer "bash" launcher -> opens the modal terminal
(() => {
  const input  = document.getElementById('footer-bash');
  const opener = document.getElementById('open-terminal');
  if (!input || !opener) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = input.value.trim().toLowerCase();
      if (v === 'bash') {
        opener.click();             // reuse existing terminal opener
        setTimeout(() => input.blur(), 0);
      } else {
        toast?.('Hint: type bash');
      }
    }
  });

  // global hotkey: ~ opens terminal (unless typing in another field)
  window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (typing && active !== input) return;
    if (e.key === '`' || e.key === '~') { e.preventDefault(); opener.click(); }
  });
})();

const card = document.querySelector('.holo-frame');
if (card) {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const dx = (e.clientX - cx) / (r.width/2);
    const dy = (e.clientY - cy) / (r.height/2);
    card.style.transform = `rotateX(${(-dy*8).toFixed(2)}deg) rotateY(${(dx*8).toFixed(2)}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}