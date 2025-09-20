// src/hooks/useSiteChrome.js
import { useEffect } from "react";

export default function useRain() {
  useEffect(() => {
    // ---------- helpers ----------
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const rain = $("#rain");
    const ctx = rain?.getContext?.("2d");
    let rainActive = true;
    let columns = 0, drops = [];
    const fontSize = 16;
    const SPEED = 0.8;
    const chars = "アイウエオカキクケコｱｲｳｴｵｶｷｸｹｺ01░▒▓█#<>/*";
    let rafId = 0;

    const resizeCanvas = () => {
      if (!rain || !ctx) return;
      rain.width = Math.floor(window.innerWidth * devicePixelRatio);
      rain.height = Math.floor(window.innerHeight * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      columns = Math.floor(window.innerWidth / fontSize);
      drops = Array(columns).fill(1 + Math.random() * 20);
    };
    const drawRain = () => {
      if (!rainActive || !ctx) return;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, rain.width, rain.height);
      ctx.fillStyle = "rgba(0,234,255,0.2)";
      ctx.font = `${fontSize}px Consolas, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);
        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i] += SPEED;
      }
      rafId = requestAnimationFrame(drawRain);
    };
    const onResize = () => { resizeCanvas(); if (rainActive) drawRain(); };
    window.addEventListener("resize", onResize, { passive: true });
    resizeCanvas();
    drawRain();

    $("#toggle-rain")?.addEventListener("change", (e) => {
      rainActive = e.target.checked;
      if (rainActive) drawRain();
      else cancelAnimationFrame(rafId);
    });



    // ---------- cleanup ----------
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);
}
