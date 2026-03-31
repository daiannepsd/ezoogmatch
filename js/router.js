const Router = {
  current: null,

  go(screenId, data = {}) {
    const app = document.getElementById('app');

    // Slide out current
    if (this.current) {
      const old = document.querySelector('.screen.active');
      if (old) {
        old.classList.add('slide-out');
        setTimeout(() => old.remove(), 300);
      }
    }

    // Build new screen
    const screenFn = Screens[screenId];
    if (!screenFn) { console.error('Screen not found:', screenId); return; }

    const el = screenFn(data);
    el.classList.add('screen');
    app.appendChild(el);

    // Trigger transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('active');
      });
    });

    this.current = screenId;

    // Handle hash for admin
    if (screenId === 'admin') {
      history.pushState({}, '', '#admin');
    } else if (screenId !== 'admin') {
      if (location.hash === '#admin') history.pushState({}, '', ' ');
    }
  }
};

const Screens = {};
