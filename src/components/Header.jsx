import { useEffect, useRef, useState } from "react";

/** Observe when the header leaves/enters the viewport */
function useStickyIsland() {
  const headerRef = useRef(null);
  const [showIsland, setShowIsland] = useState(false);

  useEffect(() => {
    if (!headerRef.current) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setShowIsland(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    io.observe(headerRef.current);
    return () => io.disconnect();
  }, []);

  return { headerRef, showIsland };
}

/** Your nav, reused in both header and island */
function PrimaryNav({ includeTerminalId = false }) {
  return (
    <nav aria-label="Primary">
      <a href="#">About</a>
      <a href="#projects">Projects</a>
      <a href="#skills">Skills</a>
      <a href="#contact">Contact</a>
      <a
        href="#"
        id={includeTerminalId ? "open-terminal" : undefined}
        aria-haspopup="dialog"
        aria-controls="terminal-modal"
        aria-label="Open retro terminal"
      >
        Terminal
      </a>
    </nav>
  );
}

export default function HeaderWithIsland() {
  const { headerRef, showIsland } = useStickyIsland();

  return (
    <>
      {/* header / nav */}
      <header ref={headerRef}>
        <div className="nav">
          <a className="brand" href="#top" aria-label="Go to top">
            <svg
              width="34"
              height="34"
              viewBox="0 0 64 64"
              role="img"
              aria-label="logo"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop stopColor="#ff2bd6" offset="0" />
                  <stop stopColor="#00eaff" offset="1" />
                </linearGradient>
              </defs>
              <rect
                x="2"
                y="2"
                width="60"
                height="60"
                rx="12"
                fill="none"
                stroke="url(#g)"
                strokeWidth="3"
              />
              <path
                d="M16 40 L32 16 L48 40"
                fill="none"
                stroke="#ffe359"
                strokeWidth="3"
              />
              <circle cx="32" cy="44" r="4" fill="#67ff85" />
            </svg>
            BEN•CARNES
          </a>

          {/* In header we include the #open-terminal id */}
          <PrimaryNav includeTerminalId />
        </div>
      </header>

      {/* sticky island that mirrors the header nav */}
      <div
        className={`nav-island${showIsland ? " active" : ""}`}
        aria-hidden={showIsland ? "false" : "true"}
      >
        <div className="nav">
          {/* No duplicate id in the island copy */}
          <PrimaryNav />
        </div>
      </div>
    </>
  );
}
