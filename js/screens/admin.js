const ADMIN_PIN = '2026';
let adminAuthed = false;

Screens.admin = function() {
  const el = document.createElement('div');
  el.className = 'admin-screen';

  if (!adminAuthed) {
    renderAdminLogin(el);
  } else {
    renderAdminPanel(el);
  }
  return el;
};

function renderAdminLogin(el) {
  el.innerHTML = `
    <div class="admin-login">
      <h2>🔐 Admin EzoogMatch</h2>
      <input class="input-field" id="admin-pin" type="password" placeholder="PIN de acesso" maxlength="8" style="text-align:center;letter-spacing:0.3em;font-size:1.4rem;" />
      <button class="btn btn-primary" id="admin-enter">ENTRAR</button>
      <button class="btn btn-ghost" id="admin-back-home">← Voltar ao app</button>
      <p id="admin-error" style="color:var(--coral);font-size:0.85rem;font-weight:700;display:none;">PIN incorreto.</p>
    </div>
  `;
  el.querySelector('#admin-enter').addEventListener('click', () => {
    const pin = el.querySelector('#admin-pin').value;
    if (pin === ADMIN_PIN) {
      adminAuthed = true;
      renderAdminPanel(el);
    } else {
      el.querySelector('#admin-error').style.display = 'block';
    }
  });
  el.querySelector('#admin-pin').addEventListener('keydown', e => {
    if (e.key === 'Enter') el.querySelector('#admin-enter').click();
  });
  el.querySelector('#admin-back-home').addEventListener('click', () => Router.go('splash'));
}

function renderAdminPanel(el) {
  const tabs = ['Espécies', 'Fichas', 'Questões', 'Ranking', 'Estatísticas'];
  let activeTab = 0;

  el.innerHTML = `
    <div class="admin-topbar">
      <h2>Admin EzoogMatch</h2>
      <span class="admin-logout" id="admin-logout">Sair</span>
    </div>
    <div class="admin-nav">
      ${tabs.map((t, i) => `<div class="admin-nav-tab ${i===0?'active':''}" data-tab="${i}">${t}</div>`).join('')}
    </div>
    <div class="admin-content" id="admin-content">
      <div class="loading-wrap"><div class="spinner"></div></div>
    </div>
  `;

  el.querySelector('#admin-logout').addEventListener('click', () => {
    adminAuthed = false;
    Router.go('splash');
  });

  el.querySelectorAll('.admin-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.admin-nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = parseInt(tab.dataset.tab);
      loadAdminTab(el, activeTab);
    });
  });

  loadAdminTab(el, 0);
}

async function loadAdminTab(el, tab) {
  const content = el.querySelector('#admin-content');
  content.innerHTML = '<div class="loading-wrap"><div class="spinner"></div></div>';

  if (tab === 0) await adminSpecies(content);
  else if (tab === 1) await adminFichas(content);
  else if (tab === 2) await adminQuestoes(content);
  else if (tab === 3) await adminRanking(content);
  else if (tab === 4) await adminStats(content);
}

// ===== TAB: ESPÉCIES =====
async function adminSpecies(content) {
  const { data: species } = await db.from('especies').select('*').order('id');
  content.innerHTML = `<h3 class="admin-section-title">Espécies</h3>` +
    (species || []).map(sp => `
      <div class="admin-card">
        <div class="admin-card-row">
          <div class="admin-card-info">
            <h3>${sp.icone_emoji || ''} ${sp.nome}</h3>
            <p>${sp.desbloqueada ? '✅ Desbloqueada' : '🔒 Bloqueada'}</p>
          </div>
          <label class="toggle">
            <input type="checkbox" ${sp.desbloqueada ? 'checked' : ''} data-id="${sp.id}" class="species-toggle" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `).join('');

  content.querySelectorAll('.species-toggle').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      await db.from('especies').update({ desbloqueada: toggle.checked }).eq('id', toggle.dataset.id);
    });
  });
}

// ===== TAB: FICHAS =====
async function adminFichas(content) {
  const { data: species } = await db.from('especies').select('*').order('id');
  let filterSp = species?.[0]?.id || 1;
  let filterTipo = 'raca';

  async function render() {
    const { data: fichas } = await db.from('fichas').select('*')
      .eq('especie_id', filterSp).eq('tipo', filterTipo).order('titulo');

    content.innerHTML = `
      <h3 class="admin-section-title">Fichas de Revisão</h3>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <select class="input-field" id="f-sp" style="flex:1;min-width:120px;">
          ${(species||[]).map(s => `<option value="${s.id}" ${s.id==filterSp?'selected':''}>${s.nome}</option>`).join('')}
        </select>
        <select class="input-field" id="f-tipo" style="flex:1;min-width:100px;">
          <option value="raca" ${filterTipo==='raca'?'selected':''}>Raças</option>
          <option value="pelagem" ${filterTipo==='pelagem'?'selected':''}>Pelagens</option>
          <option value="marca" ${filterTipo==='marca'?'selected':''}>Marcas</option>
        </select>
      </div>
      <button class="btn admin-btn-sm btn-add" id="f-add">+ Nova Ficha</button>
      <div id="f-list">
        ${(fichas||[]).map(f => `
          <div class="admin-card">
            <div class="admin-card-row">
              <div class="admin-card-info">
                <h3>${f.titulo}</h3>
                <p>${f.tag_curta || ''}</p>
              </div>
              <div class="admin-actions">
                <button class="admin-btn-sm btn-edit" data-id="${f.id}">Editar</button>
                <button class="admin-btn-sm btn-delete" data-id="${f.id}">Excluir</button>
              </div>
            </div>
          </div>
        `).join('') || '<p style="color:var(--text-secondary);padding:12px 0;">Nenhuma ficha.</p>'}
      </div>
    `;

    content.querySelector('#f-sp').addEventListener('change', e => { filterSp = parseInt(e.target.value); render(); });
    content.querySelector('#f-tipo').addEventListener('change', e => { filterTipo = e.target.value; render(); });
    content.querySelector('#f-add').addEventListener('click', () => showFichaForm(null, filterSp, filterTipo, render));
    content.querySelectorAll('.btn-edit[data-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { data: f } = await db.from('fichas').select('*').eq('id', btn.dataset.id).single();
        showFichaForm(f, filterSp, filterTipo, render);
      });
    });
    content.querySelectorAll('.btn-delete[data-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Excluir esta ficha?')) {
          await db.from('fichas').delete().eq('id', btn.dataset.id);
          render();
        }
      });
    });
  }
  render();
}

function showFichaForm(ficha, spId, tipo, onSave) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  const isEdit = !!ficha;
  const t = ficha?.tipo || tipo;

  overlay.innerHTML = `
    <div class="modal-box" style="max-height:90vh;overflow-y:auto;">
      <h2 style="font-size:1.1rem;font-weight:900;margin-bottom:16px;">${isEdit ? 'Editar' : 'Nova'} Ficha</h2>
      <div class="admin-form">
        <div>
          <label>Tipo</label>
          <select class="input-field" id="ff-tipo">
            <option value="raca" ${t==='raca'?'selected':''}>Raça</option>
            <option value="pelagem" ${t==='pelagem'?'selected':''}>Pelagem</option>
            <option value="marca" ${t==='marca'?'selected':''}>Marca</option>
          </select>
        </div>
        <div><label>Título *</label><input class="input-field" id="ff-titulo" value="${ficha?.titulo||''}" /></div>
        <div><label>Tag curta</label><input class="input-field" id="ff-tag" value="${ficha?.tag_curta||''}" /></div>
        <div><label>Imagens (URLs separadas por vírgula)</label>
          <textarea class="input-field" id="ff-imgs">${(ficha?.imagens||[]).join(', ')}</textarea></div>
        <div><label>Origem</label><input class="input-field" id="ff-origem" value="${ficha?.origem||''}" /></div>
        <div><label>Aptidão</label><input class="input-field" id="ff-aptidao" value="${ficha?.aptidao||''}" /></div>
        <div><label>Andamento</label><input class="input-field" id="ff-andamento" value="${ficha?.andamento||''}" /></div>
        <div><label>Pelagem predominante</label><input class="input-field" id="ff-pelagem" value="${ficha?.pelagem_predominante||''}" /></div>
        <div><label>Perfil cefálico</label><input class="input-field" id="ff-perfil" value="${ficha?.perfil_cefalico||''}" /></div>
        <div><label>Garupa</label><input class="input-field" id="ff-garupa" value="${ficha?.garupa||''}" /></div>
        <div><label>Características físicas</label><textarea class="input-field" id="ff-caract">${ficha?.caracteristicas_fisicas||''}</textarea></div>
        <div><label>Classificação (pelagens)</label><input class="input-field" id="ff-class" value="${ficha?.classificacao||''}" /></div>
        <div><label>Raças que possuem (pelagens)</label><input class="input-field" id="ff-racas" value="${ficha?.racas_que_possuem||''}" /></div>
        <div><label>Variações (pelagens)</label><input class="input-field" id="ff-var" value="${ficha?.variacoes||''}" /></div>
        <div><label>Localização no corpo (marcas)</label><input class="input-field" id="ff-loc" value="${ficha?.localizacao_corpo||''}" /></div>
        <div><label>Descrição</label><textarea class="input-field" id="ff-desc">${ficha?.descricao||''}</textarea></div>
        <div><label>Texto de revisão</label><textarea class="input-field" id="ff-rev">${ficha?.texto_revisao||''}</textarea></div>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <button class="btn btn-ghost" id="ff-cancel" style="flex:1;">Cancelar</button>
          <button class="btn btn-primary" id="ff-save" style="flex:1;">Salvar</button>
        </div>
      </div>
    </div>
  `;

  overlay.querySelector('#ff-cancel').addEventListener('click', () => { overlay.classList.add('hidden'); overlay.innerHTML = ''; });
  overlay.querySelector('#ff-save').addEventListener('click', async () => {
    const titulo = overlay.querySelector('#ff-titulo').value.trim();
    if (!titulo) { alert('Título obrigatório.'); return; }
    const imgsRaw = overlay.querySelector('#ff-imgs').value;
    const imagens = imgsRaw.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      especie_id: spId,
      tipo: overlay.querySelector('#ff-tipo').value,
      titulo,
      tag_curta: overlay.querySelector('#ff-tag').value,
      imagens,
      origem: overlay.querySelector('#ff-origem').value,
      aptidao: overlay.querySelector('#ff-aptidao').value,
      andamento: overlay.querySelector('#ff-andamento').value,
      pelagem_predominante: overlay.querySelector('#ff-pelagem').value,
      perfil_cefalico: overlay.querySelector('#ff-perfil').value,
      garupa: overlay.querySelector('#ff-garupa').value,
      caracteristicas_fisicas: overlay.querySelector('#ff-caract').value,
      classificacao: overlay.querySelector('#ff-class').value,
      racas_que_possuem: overlay.querySelector('#ff-racas').value,
      variacoes: overlay.querySelector('#ff-var').value,
      localizacao_corpo: overlay.querySelector('#ff-loc').value,
      descricao: overlay.querySelector('#ff-desc').value,
      texto_revisao: overlay.querySelector('#ff-rev').value,
    };
    if (isEdit) await db.from('fichas').update(payload).eq('id', ficha.id);
    else await db.from('fichas').insert(payload);
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    onSave();
  });
}

// ===== TAB: QUESTÕES =====
async function adminQuestoes(content) {
  const { data: species } = await db.from('especies').select('*').order('id');
  let filterSp = species?.[0]?.id || 1;

  async function render() {
    const { data: questoes } = await db.from('questoes').select('*').eq('especie_id', filterSp).order('id');
    content.innerHTML = `
      <h3 class="admin-section-title">Questões do Minigame</h3>
      <select class="input-field" id="q-sp" style="margin-bottom:12px;">
        ${(species||[]).map(s => `<option value="${s.id}" ${s.id==filterSp?'selected':''}>${s.nome}</option>`).join('')}
      </select>
      <button class="btn admin-btn-sm btn-add" id="q-add">+ Nova Questão</button>
      <div id="q-list">
        ${(questoes||[]).map(q => `
          <div class="admin-card">
            <div class="admin-card-row">
              <div class="admin-card-info">
                <h3 style="font-size:0.85rem;">${q.afirmacao.substring(0,80)}${q.afirmacao.length>80?'...':''}</h3>
                <p>${q.gabarito ? '✅ Verdadeiro' : '❌ Falso'} · ${q.tipo}</p>
              </div>
              <div class="admin-actions">
                <button class="admin-btn-sm btn-edit" data-id="${q.id}">Editar</button>
                <button class="admin-btn-sm btn-delete" data-id="${q.id}">Excluir</button>
              </div>
            </div>
          </div>
        `).join('') || '<p style="color:var(--text-secondary);padding:12px 0;">Nenhuma questão.</p>'}
      </div>
    `;
    content.querySelector('#q-sp').addEventListener('change', e => { filterSp = parseInt(e.target.value); render(); });
    content.querySelector('#q-add').addEventListener('click', () => showQuestaoForm(null, filterSp, render));
    content.querySelectorAll('.btn-edit[data-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { data: q } = await db.from('questoes').select('*').eq('id', btn.dataset.id).single();
        showQuestaoForm(q, filterSp, render);
      });
    });
    content.querySelectorAll('.btn-delete[data-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Excluir esta questão?')) {
          await db.from('questoes').delete().eq('id', btn.dataset.id);
          render();
        }
      });
    });
  }
  render();
}

function showQuestaoForm(q, spId, onSave) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  let gabarito = q?.gabarito ?? true;

  overlay.innerHTML = `
    <div class="modal-box" style="max-height:90vh;overflow-y:auto;">
      <h2 style="font-size:1.1rem;font-weight:900;margin-bottom:16px;">${q ? 'Editar' : 'Nova'} Questão</h2>
      <div class="admin-form">
        <div>
          <label>Tipo</label>
          <select class="input-field" id="qf-tipo">
            <option value="raca" ${q?.tipo==='raca'?'selected':''}>Raça</option>
            <option value="pelagem" ${q?.tipo==='pelagem'?'selected':''}>Pelagem</option>
            <option value="marca" ${q?.tipo==='marca'?'selected':''}>Marca</option>
            <option value="aprumos" ${q?.tipo==='aprumos'?'selected':''}>Aprumos</option>
          </select>
        </div>
        <div><label>URL da Imagem</label><input class="input-field" id="qf-img" value="${q?.imagem_url||''}" placeholder="https://..." /></div>
        <div><label>Afirmação *</label><textarea class="input-field" id="qf-afirm" style="min-height:100px;">${q?.afirmacao||''}</textarea></div>
        <div>
          <label>Gabarito</label>
          <div class="gabarito-toggle">
            <button class="gabarito-btn ${gabarito?'selected-true':''}" id="gb-true">✓ Verdadeiro</button>
            <button class="gabarito-btn ${!gabarito?'selected-false':''}" id="gb-false">✗ Falso</button>
          </div>
        </div>
        <div><label>Texto explicativo</label><textarea class="input-field" id="qf-exp" style="min-height:80px;">${q?.texto_explicativo||''}</textarea></div>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <button class="btn btn-ghost" id="qf-cancel" style="flex:1;">Cancelar</button>
          <button class="btn btn-primary" id="qf-save" style="flex:1;">Salvar</button>
        </div>
      </div>
    </div>
  `;

  overlay.querySelector('#gb-true').addEventListener('click', () => {
    gabarito = true;
    overlay.querySelector('#gb-true').className = 'gabarito-btn selected-true';
    overlay.querySelector('#gb-false').className = 'gabarito-btn';
  });
  overlay.querySelector('#gb-false').addEventListener('click', () => {
    gabarito = false;
    overlay.querySelector('#gb-false').className = 'gabarito-btn selected-false';
    overlay.querySelector('#gb-true').className = 'gabarito-btn';
  });
  overlay.querySelector('#qf-cancel').addEventListener('click', () => { overlay.classList.add('hidden'); overlay.innerHTML = ''; });
  overlay.querySelector('#qf-save').addEventListener('click', async () => {
    const afirmacao = overlay.querySelector('#qf-afirm').value.trim();
    if (!afirmacao) { alert('Afirmação obrigatória.'); return; }
    const payload = {
      especie_id: spId,
      tipo: overlay.querySelector('#qf-tipo').value,
      imagem_url: overlay.querySelector('#qf-img').value.trim(),
      afirmacao,
      gabarito,
      texto_explicativo: overlay.querySelector('#qf-exp').value,
      total_respostas: q?.total_respostas || 0,
      total_erros: q?.total_erros || 0,
    };
    if (q) await db.from('questoes').update(payload).eq('id', q.id);
    else await db.from('questoes').insert(payload);
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    onSave();
  });
}

// ===== TAB: RANKING =====
async function adminRanking(content) {
  const { data: species } = await db.from('especies').select('*').order('id');
  let filterSp = species?.[0]?.id || 1;

  async function render() {
    const { data: ranking } = await db.from('pontuacoes').select('*')
      .eq('especie_id', filterSp).order('total_pontos', { ascending: false }).limit(20);

    content.innerHTML = `
      <h3 class="admin-section-title">Ranking</h3>
      <select class="input-field" id="r-sp" style="margin-bottom:12px;">
        ${(species||[]).map(s => `<option value="${s.id}" ${s.id==filterSp?'selected':''}>${s.nome}</option>`).join('')}
      </select>
      <button class="danger-btn" id="r-reset" style="margin-bottom:16px;width:100%;">🗑️ Zerar Ranking desta Espécie</button>
      <div>
        ${(ranking||[]).map((r, i) => `
          <div class="admin-card" style="padding:10px 16px;">
            <div class="admin-card-row">
              <span style="font-weight:800;min-width:28px;">${i+1}º</span>
              <div class="admin-card-info">
                <h3>${r.nome_jogador}</h3>
                <p>${new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <span style="font-weight:900;color:var(--eq);">${r.total_pontos} pts</span>
            </div>
          </div>
        `).join('') || '<p style="color:var(--text-secondary);padding:12px 0;">Nenhuma pontuação.</p>'}
      </div>
    `;
    content.querySelector('#r-sp').addEventListener('change', e => { filterSp = parseInt(e.target.value); render(); });
    content.querySelector('#r-reset').addEventListener('click', async () => {
      const sp = species.find(s => s.id == filterSp);
      if (confirm(`Zerar todo o ranking de ${sp?.nome}? Esta ação não pode ser desfeita.`)) {
        await db.from('pontuacoes').delete().eq('especie_id', filterSp);
        render();
      }
    });
  }
  render();
}

// ===== TAB: ESTATÍSTICAS =====
async function adminStats(content) {
  const { data: species } = await db.from('especies').select('*').order('id');
  let filterSp = species?.[0]?.id || 1;

  async function render() {
    const { data: questoes } = await db.from('questoes').select('*').eq('especie_id', filterSp);
    const { count: totalRodadas } = await db.from('pontuacoes').select('*', { count: 'exact', head: true }).eq('especie_id', filterSp);

    const qs = questoes || [];
    const sorted = [...qs].filter(q => q.total_respostas > 0)
      .sort((a, b) => (b.total_erros/b.total_respostas) - (a.total_erros/a.total_respostas))
      .slice(0, 5);

    const tipos = ['raca', 'pelagem', 'marca', 'aprumos'];
    const tipoLabels = { raca: 'Raça', pelagem: 'Pelagem', marca: 'Marca', aprumos: 'Aprumos' };

    const tipoStats = tipos.map(tipo => {
      const tqs = qs.filter(q => q.tipo === tipo && q.total_respostas > 0);
      if (!tqs.length) return null;
      const acertos = tqs.reduce((s, q) => s + (q.total_respostas - q.total_erros), 0);
      const total = tqs.reduce((s, q) => s + q.total_respostas, 0);
      const pct = Math.round((acertos / total) * 100);
      return { tipo, label: tipoLabels[tipo], pct };
    }).filter(Boolean);

    content.innerHTML = `
      <h3 class="admin-section-title">Estatísticas</h3>
      <select class="input-field" id="st-sp" style="margin-bottom:16px;">
        ${(species||[]).map(s => `<option value="${s.id}" ${s.id==filterSp?'selected':''}>${s.nome}</option>`).join('')}
      </select>
      <div class="admin-card" style="text-align:center;margin-bottom:16px;">
        <div class="stat-number">${totalRodadas || 0}</div>
        <div class="stat-number-label">rodadas jogadas</div>
      </div>
      ${sorted.length ? `
        <h3 class="admin-section-title" style="margin-top:8px;">Questões com mais erros</h3>
        ${sorted.map((q, i) => {
          const pct = Math.round((q.total_erros / q.total_respostas) * 100);
          return `
            <div class="admin-card" style="margin-bottom:8px;">
              <p style="font-size:0.82rem;font-weight:600;margin-bottom:8px;">${i+1}. ${q.afirmacao.substring(0,100)}...</p>
              <div class="stat-bar-wrap">
                <div class="stat-bar-label"><span>Taxa de erro</span><span>${pct}%</span></div>
                <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%;background:var(--coral);"></div></div>
              </div>
            </div>
          `;
        }).join('')}
      ` : ''}
      ${tipoStats.length ? `
        <h3 class="admin-section-title" style="margin-top:16px;">Acerto por tipo</h3>
        ${tipoStats.map(t => `
          <div class="stat-bar-wrap" style="margin-bottom:12px;">
            <div class="stat-bar-label"><span>${t.label}</span><span>${t.pct}% acerto</span></div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${t.pct}%;"></div></div>
          </div>
        `).join('')}
      ` : '<p style="color:var(--text-secondary);padding:12px 0;">Sem dados suficientes ainda.</p>'}
    `;
    content.querySelector('#st-sp').addEventListener('change', e => { filterSp = parseInt(e.target.value); render(); });
  }
  render();
}
