Screens.hub = function({ species }) {
  const el = document.createElement('div');
  el.className = 'hub-screen';
  const silhouettes = { 1: SVG.horse, 2: SVG.cow, 3: SVG.goat, 4: SVG.sheep };

  el.innerHTML = `
    <div class="hub-header" style="background:${species.cor_hex};">
      <button class="back-btn hub-back" id="hub-back" style="color:rgba(255,255,255,0.9);">←</button>
      <div class="hub-silhouette">${silhouettes[species.id] || ''}</div>
      <div style="margin-top:48px;"></div>
      <h1 class="hub-title">${species.nome.toUpperCase()}</h1>
    </div>
    <div class="hub-body">
      <button class="btn btn-outline" id="hub-review" style="color:${species.cor_hex};border-color:${species.cor_hex};">
        📖 ESTUDAR E REVISAR
      </button>
      <button class="btn btn-primary" id="hub-game" style="background:${species.cor_hex};">
        🎮 INICIAR DESAFIO
      </button>
    </div>
  `;

  el.querySelector('#hub-back').addEventListener('click', () => Router.go('species'));

  el.querySelector('#hub-review').addEventListener('click', () => {
    Router.go('review', { species });
  });

  el.querySelector('#hub-game').addEventListener('click', () => {
    if (!State.playerName) {
      showNameModal(() => Router.go('onboarding', { species }));
    } else {
      Router.go('onboarding', { species });
    }
  });

  return el;
};
