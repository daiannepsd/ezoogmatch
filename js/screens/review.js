Screens.review = async function({ species }) {
  const el = document.createElement('div');
  el.className = 'review-screen';

  el.innerHTML = `
    <div class="review-topbar">
      <button class="back-btn" id="review-back">←</button>
      <h2>REVISÃO ${species.nome.toUpperCase()}</h2>
    </div>
    <div class="review-tabs">
      <div class="review-tab active" data-type="raca">🐴 Raças</div>
      <div class="review-tab" data-type="pelagem">🎨 Pelagens</div>
      <div class="review-tab" data-type="marca">🔖 Marcas</div>
    </div>
    <div class="review-grid" id="review-grid">
      <div class="loading-wrap" style="grid-column:1/-1;"><div class="spinner"></div></div>
    </div>
  `;

  el.querySelector('#review-back').addEventListener('click', () => Router.go('hub', { species }));

  let currentType = 'raca';
  let allFichas = [];

  // Load all fichas for this species
  const { data: fichas } = await db.from('fichas').select('*').eq('especie_id', species.id);
  allFichas = fichas || [];

  // Update tab color to species color
  el.querySelectorAll('.review-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.review-tab').forEach(t => {
        t.classList.remove('active');
        t.style.color = '';
        t.style.borderBottomColor = '';
      });
      tab.classList.add('active');
      tab.style.color = species.cor_hex;
      tab.style.borderBottomColor = species.cor_hex;
      currentType = tab.dataset.type;
      renderGrid();
    });
  });
  // Set initial active tab color
  const firstTab = el.querySelector('.review-tab.active');
  firstTab.style.color = species.cor_hex;
  firstTab.style.borderBottomColor = species.cor_hex;

  function renderGrid() {
    const grid = el.querySelector('#review-grid');
    const filtered = allFichas.filter(f => f.tipo === currentType);
    if (!filtered.length) {
      grid.innerHTML = '<p class="review-empty">Nenhum conteúdo cadastrado ainda.</p>';
      return;
    }
    grid.innerHTML = filtered.map(f => {
      const img = (f.imagens && f.imagens[0]) ? f.imagens[0] : 'https://placehold.co/300x400/4A7C59/white?text=' + encodeURIComponent(f.titulo);
      return `
        <div class="review-card" data-id="${f.id}">
          <img src="${img}" alt="${f.titulo}" loading="lazy" />
          <div class="review-card-footer">
            <h3>${f.titulo}</h3>
            <span>${f.tag_curta || ''}</span>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.review-card').forEach(card => {
      card.addEventListener('click', () => {
        const ficha = allFichas.find(f => f.id == card.dataset.id);
        Router.go('detail', { ficha, species });
      });
    });
  }

  renderGrid();
  return el;
};
