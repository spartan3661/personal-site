(() => {
  const header = document.querySelector('header');
  const island = document.querySelector('.nav-island');
  if (!header || !island) return;

  // Clone nav into island once
  const headerNav = header.querySelector('.nav');
  if (headerNav && !island.querySelector('.nav')) {
    const clone = headerNav.cloneNode(true);
    clone.querySelectorAll('#open-terminal').forEach(el => el.removeAttribute('id'));
    island.appendChild(clone);
  }

  // Observer: show island when header leaves viewport
  const io = new IntersectionObserver(([entry]) => {
    const showIsland = !entry.isIntersecting;
    island.classList.toggle('active', showIsland);
    island.setAttribute('aria-hidden', showIsland ? 'false' : 'true');
  }, {
    threshold: 0,           // fires as soon as any pixel crosses
    rootMargin: '0px 0px 0px 0px'
  });

  io.observe(header);
})();
