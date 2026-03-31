Screens.detail = function({ ficha, species }) {
  const el = document.createElement('div');
  el.className = 'detail-screen';

  const imgs = (ficha.imagens && ficha.imagens.length) ? ficha.imagens : ['https://placehold.co/480x260/4A7C59/white?text=' + encodeURIComponent(ficha.titulo)];
  const mainImg = imgs[0];

  const thumbsHtml = imgs.length > 1 ? imgs.map((img, i) =>
    `<img class="detail-thumb ${i === 0 ? 'active' : ''}" src="${img}" alt="foto ${i+1}" data-idx="${i}" loading="lazy" style="${i===0?'border-color:'+species.cor_hex:''}" />`
  ).join('') : '';

  // Build info rows based on ficha type
  let infoRows = '';
  if (ficha.tipo === 'raca') {
    if (ficha.origem) infoRows += infoRow('🌎', 'ORIGEM', ficha.origem);
    if (ficha.aptidao) infoRows += infoRow('🏇', 'APTIDÃO', ficha.aptidao);
    if (ficha.andamento) infoRows += infoRow('🦶', 'ANDAMENTO', ficha.andamento);
    if (ficha.pelagem_predominante) infoRows += infoRow('🎨', 'PELAGEM', ficha.pelagem_predominante);
    if (ficha.perfil_cefalico) infoRows += infoRow('🐴', 'PERFIL CEFÁLICO', ficha.perfil_cefalico);
    if (ficha.garupa) infoRows += infoRow('💪', 'GARUPA', ficha.garupa);
    if (ficha.caracteristicas_fisicas) infoRows += infoRow('📐', 'CARACTERÍSTICAS FÍSICAS', ficha.caracteristicas_fisicas);
  } else if (ficha.tipo === 'pelagem') {
    if (ficha.classificacao) infoRows += infoRow('🏷️', 'CLASSIFICAÇÃO', ficha.classificacao);
    if (ficha.descricao) infoRows += infoRow('📝', 'CARACTERÍSTICAS', ficha.descricao);
    if (ficha.racas_que_possuem) infoRows += infoRow('🐴', 'RAÇAS QUE POSSUEM', ficha.racas_que_possuem);
    if (ficha.variacoes) infoRows += infoRow('🎨', 'VARIAÇÕES', ficha.variacoes);
  } else if (ficha.tipo === 'marca') {
    if (ficha.localizacao_corpo) infoRows += infoRow('📍', 'LOCALIZAÇÃO', ficha.localizacao_corpo);
    if (ficha.descricao) infoRows += infoRow('📝', 'CARACTERÍSTICAS', ficha.descricao);
  }

  el.innerHTML = `
    <div class="detail-topbar">
      <button class="back-btn" id="detail-back">←</button>
    </div>
    <img class="detail-main-img" id="detail-main-img" src="${mainImg}" alt="${ficha.titulo}" />
    ${imgs.length > 1 ? `<div class="detail-gallery" id="detail-gallery">${thumbsHtml}</div>` : ''}
    <div class="detail-body">
      <h1 class="detail-title">${ficha.titulo}</h1>
      <div class="detail-badges">
        <span class="detail-badge" style="background:${species.cor_hex}22;color:${species.cor_hex};">${tipoLabel(ficha.tipo)}</span>
        ${ficha.tag_curta ? `<span class="detail-badge" style="background:${species.cor_hex}22;color:${species.cor_hex};">${ficha.tag_curta}</span>` : ''}
      </div>
      <div class="detail-divider"></div>
      ${infoRows}
      ${ficha.texto_revisao ? `
        <div class="detail-revisao">
          <div class="detail-revisao-label">📝 Texto de Revisão</div>
          <p>${ficha.texto_revisao}</p>
        </div>` : ''}
    </div>
  `;

  el.querySelector('#detail-back').addEventListener('click', () => Router.go('review', { species }));

  // Gallery interaction
  if (imgs.length > 1) {
    el.querySelector('#detail-gallery').addEventListener('click', e => {
      const thumb = e.target.closest('.detail-thumb');
      if (!thumb) return;
      const idx = parseInt(thumb.dataset.idx);
      el.querySelector('#detail-main-img').src = imgs[idx];
      el.querySelectorAll('.detail-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
        t.style.borderColor = i === idx ? species.cor_hex : 'transparent';
      });
    });
  }

  return el;
};

function infoRow(icon, label, value) {
  return `
    <div class="detail-row">
      <span class="detail-row-icon">${icon}</span>
      <div class="detail-row-content">
        <div class="detail-row-label">${label}</div>
        <div class="detail-row-value">${value}</div>
      </div>
    </div>
  `;
}

function tipoLabel(tipo) {
  return { raca: 'Raça', pelagem: 'Pelagem', marca: 'Marca' }[tipo] || tipo;
}
