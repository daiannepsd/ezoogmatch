Screens.gameplay = async function({ species }) {
  const el = document.createElement('div');
  el.className = 'gameplay-screen';

  // Load questions
  const { data: allQ } = await db.from('questoes').select('*').eq('especie_id', species.id);
  if (!allQ || allQ.length === 0) {
    el.innerHTML = `<div style="padding:40px;text-align:center;">
      <p style="color:var(--text-secondary);">Nenhuma questão cadastrada para esta espécie.</p>
      <button class="btn btn-primary" style="margin-top:20px;" onclick="">Voltar</button>
    </div>`;
    el.querySelector('button').addEventListener('click', () => Router.go('hub', { species }));
    return el;
  }

  // Shuffle and pick 10
  const shuffled = [...allQ].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, Math.min(10, shuffled.length));
  State.currentQuestions = questions;
  State.currentQuestionIndex = 0;
  State.currentScore = 0;
  State.gameAnswers = [];

  el.innerHTML = `
    <div class="gameplay-topbar">
      <span class="gameplay-quit" id="gp-quit">← Desistir?</span>
      <span class="gameplay-counter" id="gp-counter">Q 1/${questions.length}</span>
      <span class="gameplay-score" id="gp-score">0 ⭐</span>
    </div>
    <div class="gameplay-progress-bar">
      <div class="gameplay-progress-fill" id="gp-progress" style="width:0%;background:${species.cor_hex};"></div>
    </div>
    <div class="gameplay-timer-wrap">
      <span class="gameplay-timer" id="gp-timer" style="color:${species.cor_hex};">10</span>
    </div>
    <div class="gameplay-card-wrap" id="gp-card-wrap"></div>
    <div class="gameplay-buttons">
      <button class="gameplay-btn-circle btn-false" id="gp-false">✗</button>
      <button class="gameplay-btn-circle btn-true" id="gp-true">✓</button>
    </div>
  `;

  el.querySelector('#gp-quit').addEventListener('click', () => showQuitModal(species));

  let timerInterval = null;
  let timeLeft = 10;
  let answered = false;
  let currentIdx = 0;

  function showQuestion(idx) {
    answered = false;
    timeLeft = 10;
    currentIdx = idx;
    const q = questions[idx];

    // Update topbar
    el.querySelector('#gp-counter').textContent = `Q ${idx + 1}/${questions.length}`;
    el.querySelector('#gp-progress').style.width = `${(idx / questions.length) * 100}%`;

    // Build card
    const wrap = el.querySelector('#gp-card-wrap');
    const imgSrc = q.imagem_url || `https://placehold.co/400x220/${species.cor_hex.replace('#','')}/white?text=${encodeURIComponent(q.tipo||'Questão')}`;

    wrap.innerHTML = `
      <div class="gameplay-card" id="gp-card">
        <img class="gameplay-card-img" src="${imgSrc}" alt="questão" loading="lazy" />
        <div class="gameplay-card-divider"></div>
        <div class="gameplay-card-text">${q.afirmacao}</div>
        <div class="gameplay-card-overlay" id="gp-overlay"></div>
        <div class="gameplay-card-feedback" id="gp-feedback"></div>
      </div>
    `;

    setupSwipe(wrap.querySelector('#gp-card'), q);
    startTimer(q);
  }

  function startTimer(q) {
    clearInterval(timerInterval);
    const timerEl = el.querySelector('#gp-timer');
    timerEl.textContent = timeLeft;
    timerEl.classList.remove('urgent');

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 5) timerEl.classList.add('urgent');
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (!answered) registerAnswer(null, q, 0);
      }
    }, 1000);
  }

  function registerAnswer(userAnswer, q, pts) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const correct = userAnswer === q.gabarito;
    const points = (userAnswer === null) ? 0 : (correct ? pts : 0);
    State.currentScore += points;
    State.gameAnswers.push({ qid: q.id, correct, points });

    // Update score display
    el.querySelector('#gp-score').textContent = `${State.currentScore} ⭐`;

    // Update DB stats
    db.from('questoes').update({
      total_respostas: (q.total_respostas || 0) + 1,
      total_erros: (q.total_erros || 0) + (correct ? 0 : 1)
    }).eq('id', q.id).then(() => {});

    // Show feedback
    const feedback = el.querySelector('#gp-feedback');
    const bg = correct ? 'rgba(76,175,125,0.95)' : 'rgba(240,92,92,0.95)';
    feedback.style.background = bg;
    feedback.innerHTML = `
      <div class="fb-result">${correct ? '✓ Acertou!' : '✗ Errou!'}</div>
      <div class="fb-pts">${correct ? `+${points} pts` : '+0 pts'}</div>
      <div class="fb-explain">${q.texto_explicativo || ''}</div>
    `;
    feedback.classList.add('show');

    // Auto advance
    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx < questions.length) {
        showQuestion(nextIdx);
      } else {
        // Game over
        el.querySelector('#gp-progress').style.width = '100%';
        saveAndShowResult(species);
      }
    }, 2800);
  }

  function calcPoints() {
    return Math.round(100 * timeLeft / 10);
  }

  // Button handlers
  el.querySelector('#gp-false').addEventListener('click', () => {
    if (answered) return;
    const q = questions[currentIdx];
    registerAnswer(false, q, calcPoints());
  });
  el.querySelector('#gp-true').addEventListener('click', () => {
    if (answered) return;
    const q = questions[currentIdx];
    registerAnswer(true, q, calcPoints());
  });

  function setupSwipe(card, q) {
    let startX = 0, currentX = 0, dragging = false;

    function onStart(x) { startX = x; dragging = true; }
    function onMove(x) {
      if (!dragging || answered) return;
      currentX = x - startX;
      const pct = currentX / card.offsetWidth;
      card.style.transform = `translateX(${currentX}px) rotate(${pct * 8}deg)`;
      const overlay = card.querySelector('#gp-overlay');
      if (currentX > 0) {
        overlay.style.background = `rgba(76,175,125,${Math.min(Math.abs(pct) * 1.5, 0.7)})`;
        overlay.innerHTML = `<span class="overlay-icon">✓</span>`;
        overlay.style.opacity = Math.min(Math.abs(pct) * 2, 1);
      } else if (currentX < 0) {
        overlay.style.background = `rgba(240,92,92,${Math.min(Math.abs(pct) * 1.5, 0.7)})`;
        overlay.innerHTML = `<span class="overlay-icon">✗</span>`;
        overlay.style.opacity = Math.min(Math.abs(pct) * 2, 1);
      } else {
        overlay.style.opacity = 0;
      }
    }
    function onEnd() {
      if (!dragging || answered) return;
      dragging = false;
      const threshold = card.offsetWidth * 0.3;
      if (currentX > threshold) {
        card.style.transform = `translateX(120%) rotate(15deg)`;
        registerAnswer(true, q, calcPoints());
      } else if (currentX < -threshold) {
        card.style.transform = `translateX(-120%) rotate(-15deg)`;
        registerAnswer(false, q, calcPoints());
      } else {
        card.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        card.style.transform = '';
        card.querySelector('#gp-overlay').style.opacity = 0;
        setTimeout(() => card.style.transition = '', 400);
      }
      currentX = 0;
    }

    card.addEventListener('mousedown', e => onStart(e.clientX));
    window.addEventListener('mousemove', e => { if (dragging) onMove(e.clientX); });
    window.addEventListener('mouseup', onEnd);
    card.addEventListener('touchstart', e => onStart(e.touches[0].clientX), { passive: true });
    card.addEventListener('touchmove', e => onMove(e.touches[0].clientX), { passive: true });
    card.addEventListener('touchend', onEnd);
  }

  showQuestion(0);
  return el;
};

async function saveAndShowResult(species) {
  // Save score to DB
  const { data: inserted } = await db.from('pontuacoes').insert({
    nome_jogador: State.playerName,
    especie_id: species.id,
    total_pontos: State.currentScore
  }).select().single();

  Router.go('result', { species, score: State.currentScore, newEntryId: inserted?.id });
}

function showQuitModal(species) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal-box">
      <h2 style="font-size:1.2rem;font-weight:900;margin-bottom:12px;">Desistir do desafio?</h2>
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:24px;line-height:1.5;">
        Tem certeza que deseja desistir? Seu progresso será perdido.
      </p>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-ghost" id="quit-cancel" style="flex:1;">Cancelar</button>
        <button class="btn" id="quit-confirm" style="flex:1;background:var(--coral);color:#fff;">Desistir</button>
      </div>
    </div>
  `;
  overlay.querySelector('#quit-cancel').addEventListener('click', () => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  });
  overlay.querySelector('#quit-confirm').addEventListener('click', () => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    Router.go('species');
  });
}
