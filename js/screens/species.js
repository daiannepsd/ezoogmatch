Screens.species = async function() {
  const el = document.createElement('div');
  el.className = 'species-screen';

  el.innerHTML = `
    <div class="species-header">
      <h2>Olá, ${State.playerName || 'Estudante'}! 👋</h2>
      <p>Escolha uma espécie</p>
    </div>
    <div class="species-grid" id="species-grid">
      <div class="loading-wrap"><div class="spinner"></div></div>
    </div>
  `;

  // Load species from DB
  const { data: species, error } = await db.from('especies').select('*').order('id');

  const grid = el.querySelector('#species-grid');

  if (error || !species) {
    grid.innerHTML = '<p style="padding:20px;color:var(--coral);">Erro ao carregar espécies.</p>';
    return el;
  }

  const silhouettes = { 1: SVG.horse, 2: SVG.cow, 3: SVG.goat, 4: SVG.sheep };

  grid.innerHTML = species.map(sp => {
    const locked = !sp.desbloqueada;
    const bg = locked ? 'var(--locked)' : sp.cor_hex;
    return `
      <div class="species-card ${locked ? 'locked' : ''}" data-id="${sp.id}" style="background:${bg};">
        <span class="species-card-name">${sp.nome}</span>
        <div class="species-card-silhouette">${silhouettes[sp.id] || ''}</div>
        ${locked ? `
          <div class="species-lock-overlay">
            <span class="lock-icon">🔒</span>
            <span>Em breve</span>
          </div>` : ''}
      </div>
    `;
  }).join('');

  // Click handlers
  grid.querySelectorAll('.species-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const sp = species.find(s => s.id == card.dataset.id);
      State.currentSpecies = sp;
      Router.go('hub', { species: sp });
    });
  });

  return el;
};
