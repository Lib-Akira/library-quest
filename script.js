// ==========================================================================
// Library Quest — game logic
// กติกา: หัวใจเริ่มต้น 3 ดวง / ตอบผิด -1 ดวง / หัวใจหมด = จบภารกิจ (เริ่มใหม่ได้ไม่จำกัด)
// ตอบครบทุกข้อโดยหัวใจไม่หมด = ผ่านภารกิจ ได้รับรหัสของรางวัล
// ==========================================================================

const MAX_LIVES = 3;

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  over: document.getElementById('screen-over'),
  complete: document.getElementById('screen-complete'),
};

let state = {
  order: [],
  index: 0,
  lives: MAX_LIVES,
  correctCount: 0,
  locked: false,
};

function showScreen(name){
  Object.values(screens).forEach(s => s.hidden = true);
  screens[name].hidden = false;
}

function shuffledIndices(n){
  const arr = Array.from({length: n}, (_, i) => i);
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startQuest(){
  state = {
    order: shuffledIndices(QUESTIONS.length),
    index: 0,
    lives: MAX_LIVES,
    correctCount: 0,
    locked: false,
  };
  renderHearts();
  showScreen('quiz');
  renderQuestion();
}

function renderHearts(){
  const el = document.getElementById('hearts');
  el.innerHTML = '';
  for(let i = 0; i < MAX_LIVES; i++){
    const span = document.createElement('span');
    span.className = 'heart' + (i >= state.lives ? ' heart--lost' : '');
    span.textContent = '\u2764\uFE0F';
    span.setAttribute('aria-hidden', 'true');
    el.appendChild(span);
  }
}

function loseHeart(){
  state.lives--;
  const hearts = document.querySelectorAll('#hearts .heart');
  const target = hearts[state.lives];
  if(target){
    target.classList.add('heart--breaking');
    setTimeout(() => renderHearts(), 420);
  } else {
    renderHearts();
  }
}

function renderQuestion(){
  state.locked = false;
  const total = state.order.length;
  const qIndex = state.order[state.index];
  const q = QUESTIONS[qIndex];

  document.getElementById('progress-label').textContent = `Progress: ${state.index + 1}/${total}`;
  document.getElementById('progress-fill').style.width = `${(state.index / total) * 100}%`;
  document.getElementById('question-num').textContent = `ข้อที่ ${state.index + 1}`;
  document.getElementById('question-text').textContent = q.text;

  const letters = ['A', 'B', 'C', 'D'];
  const answersEl = document.getElementById('answers');
  answersEl.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.innerHTML = `<span class="answer__letter">${letters[i]}</span><span>${choice}</span>`;
    btn.addEventListener('click', () => handleAnswer(i, q.answer, btn));
    answersEl.appendChild(btn);
  });

  const feedback = document.getElementById('feedback');
  feedback.hidden = true;
  feedback.className = 'feedback';
}

function handleAnswer(chosenIndex, correctIndex, btnEl){
  if(state.locked) return;
  state.locked = true;

  const buttons = document.querySelectorAll('#answers .answer');
  const isCorrect = chosenIndex === correctIndex;
  const quizCard = document.getElementById('screen-quiz');

  buttons.forEach((b, i) => {
    b.disabled = true;
    if(i === chosenIndex){
      if(isCorrect){
        b.classList.add('answer--correct', 'answer--pop');
        const mark = document.createElement('span');
        mark.className = 'answer__mark answer__mark--correct';
        mark.textContent = '\u2713';
        b.appendChild(mark);
      } else {
        b.classList.add('answer--wrong');
        const mark = document.createElement('span');
        mark.className = 'answer__mark answer__mark--wrong';
        mark.textContent = '\u2717';
        b.appendChild(mark);
      }
    } else {
      b.classList.add('answer--dim');
    }
  });

  const feedback = document.getElementById('feedback');
  const feedbackText = document.getElementById('feedback-text');
  feedback.hidden = false;

  quizCard.classList.remove('flash-correct', 'flash-wrong', 'shake');
  void quizCard.offsetWidth; // restart animation

  if(isCorrect){
    state.correctCount++;
    feedback.classList.add('feedback--correct');
    feedbackText.textContent = 'ถูกต้อง! เยี่ยมมาก';
    quizCard.classList.add('flash-correct');
    showScoreFloat();
  } else {
    feedback.classList.add('feedback--wrong');
    feedbackText.textContent = 'ตอบผิด เสียหัวใจไป 1 ดวง';
    quizCard.classList.add('flash-wrong', 'shake');
    loseHeart();
  }

  setTimeout(() => {
    if(state.lives <= 0){
      endQuest(false);
      return;
    }
    state.index++;
    if(state.index >= state.order.length){
      endQuest(true);
    } else {
      renderQuestion();
    }
  }, 1100);
}

function showScoreFloat(){
  const holder = document.querySelector('.hud__progress');
  const el = document.createElement('span');
  el.className = 'score-float';
  el.textContent = '+1';
  holder.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function launchConfetti(){
  const colors = ['#F0973B', '#3E8EDE', '#4FA97A', '#F5C24C', '#E2604F'];
  const wrap = document.querySelector('.badge-wrap');
  for(let i = 0; i < 18; i++){
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 200)}px`);
    piece.style.setProperty('--rot', `${Math.round(Math.random() * 360 + 180)}deg`);
    piece.style.left = `${45 + Math.random() * 10}%`;
    piece.style.animationDelay = `${(Math.random() * 0.3).toFixed(2)}s`;
    wrap.appendChild(piece);
    setTimeout(() => piece.remove(), 1800);
  }
}

function endQuest(success){
  if(success){
    document.getElementById('progress-fill').style.width = '100%';
    showScreen('complete');
    launchConfetti();
  } else {
    document.getElementById('over-score').textContent = state.correctCount;
    document.getElementById('over-total').textContent = state.order.length;
    showScreen('over');
  }
}

document.getElementById('btn-start').addEventListener('click', startQuest);
document.getElementById('btn-retry').addEventListener('click', startQuest);
document.getElementById('btn-home').addEventListener('click', () => showScreen('start'));
document.getElementById('btn-save').addEventListener('click', () => {
  const btn = document.getElementById('btn-save');
  const target = document.getElementById('screen-complete');

  if(typeof html2canvas === 'undefined'){
    alert('ไม่สามารถโหลดตัวช่วยบันทึกภาพได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่');
    return;
  }

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'กำลังบันทึก...';

  html2canvas(target, {
    backgroundColor: '#EAF3FB',
    scale: 2,
    useCORS: true
  }).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'library-quest-mission-complete.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(() => {
    alert('บันทึกภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }).finally(() => {
    btn.disabled = false;
    btn.textContent = originalLabel;
  });
});
