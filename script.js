(() => {
  'use strict';
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const openButton = document.getElementById('openButton');
  const againButton = document.getElementById('againButton');
  const controls = document.getElementById('controls');
  const previous = document.getElementById('prevButton');
  const next = document.getElementById('nextButton');
  const dots = document.getElementById('dots');
  const petalHolder = document.getElementById('petals');
  let page = 0, opened = false, opening = false, openingTimer = null;

  scenes.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dots.appendChild(dot);
  });

  // Dynamic petals exist ONLY on the Nikah Ceremony scene.
  for (let i = 0; i < 15; i++) {
    const petal = document.createElement('i');
    petal.className = 'petal';
    petal.style.left = `${(i * 41 + 8) % 100}%`;
    petal.style.setProperty('--delay', `-${(i * 1.7) % 19}s`);
    petal.style.setProperty('--duration', `${12 + (i % 6) * 2.1}s`);
    petal.style.setProperty('--sway', `${(i % 2 ? 1 : -1) * (55 + i * 5)}px`);
    petalHolder.appendChild(petal);
  }

  function show(index) {
    if (index < 0 || index >= scenes.length || opening) return;
    page = index;
    scenes.forEach((scene, i) => {
      const active = i === index;
      scene.classList.toggle('active', active);
      scene.setAttribute('aria-hidden', String(!active));
    });
    previous.disabled = index === 1;
    next.disabled = index === scenes.length - 1;
    Array.from(dots.children).forEach((dot, i) =>
      dot.classList.toggle('selected', i === index)
    );
  }

  function openInvitation() {
    if (opening || opened) return;
    opening = true;
    opened = true;
    openButton.disabled = true;
    scenes[0].classList.add('opening');
    openingTimer = window.setTimeout(() => {
      opening = false;
      controls.hidden = false;
      show(1);
    }, 3700);
  }

  function replay() {
    window.clearTimeout(openingTimer);
    opening = false;
    opened = false;
    controls.hidden = true;
    scenes[0].classList.remove('opening');
    openButton.disabled = false;
    show(0);
  }

  // Count down to the START of January 1 in New York. The exact after-Maghrib
  // ceremony time is TBD and must not be guessed.
  const weddingDate = Date.parse('2027-01-01T00:00:00-05:00');
  function updateCountdown() {
    const remaining = Math.max(0, weddingDate - Date.now());
    const totalMinutes = Math.floor(remaining / 60000);
    document.getElementById('days').textContent = String(Math.floor(totalMinutes / 1440));
    document.getElementById('hours').textContent = String(Math.floor(totalMinutes % 1440 / 60)).padStart(2, '0');
    document.getElementById('minutes').textContent = String(totalMinutes % 60).padStart(2, '0');
  }
  updateCountdown();
  window.setInterval(updateCountdown, 15000);

  openButton.addEventListener('click', openInvitation);
  againButton.addEventListener('click', replay);
  previous.addEventListener('click', () => show(page - 1));
  next.addEventListener('click', () => show(page + 1));

  let startX = null;
  document.getElementById('invitation').addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
  }, {passive: true});
  document.getElementById('invitation').addEventListener('touchend', e => {
    if (startX === null || !opened || opening) return;
    const delta = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(delta) > 75) show(page + (delta < 0 ? 1 : -1));
  }, {passive: true});
  document.addEventListener('keydown', e => {
    if (!opened || opening) return;
    if (e.key === 'ArrowRight') show(page + 1);
    if (e.key === 'ArrowLeft') show(page - 1);
  });

  show(0);
})();