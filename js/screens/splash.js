Screens.splash = function() {
  const el = document.createElement('div');
  el.className = 'splash-screen';

  el.innerHTML = `
    <div class="splash-logo-icon">
      ${SVG.horse}
    </div>
    <h1 class="splash-title">EzoogMatch</h1>
    <p class="splash-subtitle">Treine seus conhecimentos<br>em Ezoognosia.</p>
    <div class="splash-btn-wrap">
      <button class="btn btn-primary" id="splash-start">COMEÇAR →</button>
    </div>
    <p class="splash-footer">
      Projeto desenvolvido por Daianne Souza, Monitora<br>
      da professora Carla Aparecida em Ezoognosia,<br>
      no ano de 2026 — Medicina Veterinária UFF
    </p>
  `;

  el.querySelector('#splash-start').addEventListener('click', () => {
    if (State.playerName) {
      Router.go('species');
    } else {
      showNameModal(() => Router.go('species'));
    }
  });

  return el;
};

function showNameModal(onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal-box">
      <h2 style="font-size:1.3rem;font-weight:900;margin-bottom:8px;">Como gostaria de ser chamado?</h2>
      <p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:20px;line-height:1.5;">
        Seu nome poderá aparecer no ranking caso você esteja entre as 5 melhores pontuações da espécie jogada.
      </p>
      <input class="input-field" id="name-input" type="text" placeholder="Digite seu nome..." maxlength="30" autocomplete="off" />
      <p style="color:var(--text-secondary);font-size:0.75rem;margin-top:8px;margin-bottom:20px;">
        Mínimo 3 caracteres.
      </p>
      <button class="btn btn-primary btn-disabled" id="name-confirm">→</button>
    </div>
  `;

  const input = overlay.querySelector('#name-input');
  const btn = overlay.querySelector('#name-confirm');

  input.addEventListener('input', () => {
    if (input.value.trim().length >= 3) {
      btn.classList.remove('btn-disabled');
    } else {
      btn.classList.add('btn-disabled');
    }
  });

  btn.addEventListener('click', () => {
    const name = input.value.trim();
    if (name.length < 3) return;
    State.setName(name);
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    onConfirm();
  });

  input.focus();
}
