Screens.result = async function({ species, score, newEntryId }) {
  const el = document.createElement('div');
  el.className = 'result-screen';

  // Load top 6 ranking
  const { data: ranking } = await db
    .from('pontuacoes')
    .select('*')
    .eq('especie_id', species.id)
    .order('total_pontos', { ascending: false })
    .limit(6);

  const msgs = [
    [800, '🏆 Excelente! Você é um expert em Ezoognosia!'],
    [600, '🌟 Muito bem! Continue praticando!'],
    [400, '📚 Bom esforço! Revise o conteúdo e tente novamente.'],
    [200, '💪 Não desista! A prática leva à perfeição.'],
    [0,   '🐴 Todo especialista já foi iniciante. Estude e volte!']
  ];
  const msg = msgs.find(([min]) => score >= min)?.[1] || msgs[msgs.length - 1][1];

  const animalEmojis = ['🐴','🐎','🐄','🐐','🐑','🦌','🐂','🐖'];
  const medals = ['🥇','🥈','🥉'];

  const isInTop = ranking && newEntryId && ranking.some(r => r.id === newEntryId);

  const rankingHtml = ranking && ranking.length ? ranking.map((r, i) => {
    const isNew = r.id === newEntryId;
    const emoji = animalEmojis[i % animalEmojis.length];
    const pos = medals[i] || `${i + 1}º`;
    return `
      <div class="ranking-row ${isNew ? 'highlight' : ''}" style="${isNew ? 'border-color:'+species.cor_hex : ''}">
        <span class="ranking-pos">${pos}</span>
        <span class="ranking-emoji">${emoji}</span>
        <span class="ranking-name">${r.nome_jogador}${isNew ? ' ←' : ''}</span>
        <span class="ranking-pts" style="color:${species.cor_hex};">${r.total_pontos}</span>
      </div>
    `;
  }).join('') : '<p style="padding:16px;color:var(--text-secondary);text-align:center;">Nenhuma pontuação ainda.</p>';

  el.innerHTML = `
    <div class="result-header" style="background:${species.cor_hex};">
      <h1>🏆 Fim de Rodada!</h1>
      <p>${State.playerName || 'Jogador'}</p>
    </div>
    <div class="result-score-card">
      <div class="result-score-label">SUA PONTUAÇÃO</div>
      <div class="result-score-num" style="color:${species.cor_hex};">${score}</div>
      <div class="result-score-pts">pontos</div>
    </div>
    ${isInTop ? `<div class="result-new-entry" style="color:${species.cor_hex};">🎉 Você entrou no Top 6! Parabéns, ${State.playerName}!</div>` : ''}
    <div class="result-message">${msg}</div>
    <div class="result-ranking-title">RANKING ${species.nome.toUpperCase()}</div>
    <div class="result-ranking-list">${rankingHtml}</div>
    <div class="result-actions">
      <button class="btn btn-primary" id="res-play-again" style="background:${species.cor_hex};">JOGAR NOVAMENTE</button>
      <button class="btn btn-ghost" id="res-home">Voltar ao início</button>
    </div>
  `;

  el.querySelector('#res-play-again').addEventListener('click', () => {
    State.clearGame();
    Router.go('onboarding', { species });
  });
  el.querySelector('#res-home').addEventListener('click', () => Router.go('species'));

  // Confetti if in top
  if (isInTop) {
    setTimeout(() => launchConfetti(), 400);
  }

  return el;
};
