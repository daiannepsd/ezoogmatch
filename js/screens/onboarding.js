Screens.onboarding = function({ species }) {
  const slides = [
    {
      bg: '#4A7C59',
      icon: '🐴',
      title: 'Avalie o animal!',
      desc: 'Você verá uma imagem de um animal e uma afirmação técnica. Analise os dois juntos!'
    },
    {
      bg: '#3D6B8E',
      icon: '👈 ✓ 👉',
      title: 'Swipe para decidir',
      desc: 'Deslize para a DIREITA se a afirmação for VERDADEIRA. Para a ESQUERDA se for FALSA. Ou use os botões abaixo.'
    },
    {
      bg: '#C9960C',
      icon: '⏱️🏆',
      title: 'Velocidade vale pontos!',
      desc: 'Você tem 10 segundos por questão. Quanto mais rápido responder corretamente, mais pontos ganha. Resposta errada = 0 pts.'
    }
  ];

  let current = 0;

  const el = document.createElement('div');
  el.className = 'onboarding-screen';

  function render() {
    const s = slides[current];
    const isLast = current === slides.length - 1;
    el.style.background = s.bg;
    el.innerHTML = `
      <span class="onboarding-skip" id="ob-skip">Pular →</span>
      <div class="onboarding-icon">${s.icon}</div>
      <div class="onboarding-content">
        <h2>${s.title}</h2>
        <p>${s.desc}</p>
      </div>
      <div>
        <div class="onboarding-dots">
          ${slides.map((_, i) => `<div class="onboarding-dot ${i === current ? 'active' : ''}"></div>`).join('')}
        </div>
        <button class="btn onboarding-btn" id="ob-next">
          ${isLast ? 'VAMOS LÁ! 🐴' : 'PRÓXIMO →'}
        </button>
      </div>
    `;

    el.querySelector('#ob-skip').addEventListener('click', () => startGame());
    el.querySelector('#ob-next').addEventListener('click', () => {
      if (isLast) startGame();
      else { current++; render(); }
    });
  }

  function startGame() {
    State.clearGame();
    Router.go('gameplay', { species });
  }

  render();
  return el;
};
