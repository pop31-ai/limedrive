(function () {
  'use strict';

  // ============ КОНСТАНТЫ ============
  var COLS = 7, ROWS = 6;
  var PATH_LEN = 36;            // клетки пути 0..35
  var MARGIN = 24, CELL = 88;

  var PLAYER_COLORS = ['#e74c3c', '#3498db', '#27ae60', '#f1c40f', '#9b59b6'];
  var DEFAULT_NAMES = ['Игрок 1', 'Игрок 2', 'Игрок 3', 'Игрок 4', 'Игрок 5'];

  // Клетка -> бонус (положительный) или штраф (отрицательный)
  var SPECIAL = { 2: 2, 6: -2, 10: 2, 15: -2, 20: 2, 26: -2, 31: 2 };

  var CATS = {
    q: { name: 'Вопрос',    icon: '🗣️', color: '#3498db' },
    a: { name: 'Действие',  icon: '🏃', color: '#27ae60' },
    m: { name: 'Пантомима', icon: '🎭', color: '#9b59b6' },
    w: { name: 'Слова',     icon: '📖', color: '#f39c12' },
    t: { name: 'Весело',    icon: '🎉', color: '#e74c3c' }
  };

  // Колода: c — категория, t — текст задания, s — время в секундах
  var DECK = [
    { c: 'q', t: 'Назови 10 стран мира и их столицы', s: 30 },
    { c: 'q', t: 'Назови 10 столиц европейских стран', s: 30 },
    { c: 'w', t: 'Скажи алфавит от А до Я на одном дыхании', s: 20 },
    { c: 'w', t: 'Скажи алфавит в обратном порядке (от Я до А)', s: 30 },
    { c: 'w', t: 'Назови 10 профессий на букву «П»', s: 20 },
    { c: 't', t: 'Назови 5 фильмов, в названии которых есть слово «День»', s: 20 },
    { c: 'q', t: 'Перечисли 10 животных, которые живут в воде', s: 30 },
    { c: 'w', t: 'Назови 5 блюд на букву «К»', s: 20 },
    { c: 'q', t: 'Назови 7 марок автомобилей', s: 20 },
    { c: 'q', t: 'Назови 10 видов спорта', s: 20 },
    { c: 'q', t: 'Перечисли 10 городов России', s: 30 },
    { c: 't', t: 'Назови 5 песен, которые знаешь наизусть, и спой по кусочку', s: 30 },
    { c: 'a', t: 'Сделай 15 приседаний, не останавливаясь', s: 30 },
    { c: 'a', t: 'Сделай 10 отжиманий (можно с колен)', s: 30 },
    { c: 'm', t: 'Покажи пантомиму «стиральная машина»', s: 20 },
    { c: 'm', t: 'Покажи пантомиму «вампир, который чихает»', s: 20 },
    { c: 'm', t: 'Изобрази без слов «поезд, который едет назад»', s: 20 },
    { c: 'w', t: 'Произнеси 3 раза без запинки: «Шла Саша по шоссе и сосала сушку»', s: 30 },
    { c: 'w', t: 'Произнеси 3 раза: «Карл у Клары украл кораллы, а Клара у Карла кларнет»', s: 30 },
    { c: 'w', t: 'Назови 10 слов, которые рифмуются со словом «кот»', s: 20 },
    { c: 't', t: 'Расскажи анекдот, не улыбнувшись ни разу', s: 20 },
    { c: 'q', t: 'Назови 8 стран, где говорят по-испански', s: 30 },
    { c: 'w', t: 'Назови 5 героев мультфильмов на букву «М»', s: 20 },
    { c: 'q', t: 'Сосчитай от 100 до 1 без запинки', s: 30 },
    { c: 'w', t: 'Назови 10 фруктов и овощей на букву «К»', s: 20 },
    { c: 'w', t: 'Прочитай слово «КУБИК» наоборот 5 раз подряд', s: 20 },
    { c: 'q', t: 'Назови все 7 дней недели на английском', s: 20 },
    { c: 'q', t: 'Назови все планеты Солнечной системы', s: 20 },
    { c: 't', t: 'Назови 3 книги, которые ты действительно прочитал', s: 30 },
    { c: 'm', t: 'Покажи без слов 5 разных эмоций', s: 20 },
    { c: 'w', t: 'Назови 7 предметов, которые видишь в этой комнате', s: 20 },
    { c: 't', t: 'Придумай историю про кубик из 5 предложений', s: 30 },
    { c: 'w', t: 'Назови 10 способов использования стакана', s: 20 },
    { c: 'w', t: 'Повтори 3 раза: «Парашют, шампунь, Шура, шуруп, шалаш»', s: 20 },
    { c: 't', t: 'Назови 5 знаменитых людей, чьи имена начинаются с твоей буквы', s: 30 },
    { c: 't', t: 'Спой припев любимой песни так, чтобы все угадали', s: 20 },
    { c: 'a', t: 'Сделай 20 прыжков на месте', s: 20 },
    { c: 't', t: 'Назови 5 признаков того, что ты — робот', s: 20 },
    { c: 't', t: 'Скажи искренний комплимент каждому игроку', s: 30 },
    { c: 'a', t: 'Прокричи «Я чемпион!» так громко, как можешь', s: 15 }
  ];

  // Позиции точек на кубике
  var PIP = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [80, 20], [20, 80], [80, 80]],
    5: [[20, 20], [80, 20], [50, 50], [20, 80], [80, 80]],
    6: [[20, 20], [80, 20], [20, 50], [80, 50], [20, 80], [80, 80]]
  };

  // ============ DOM ============
  var canvas = document.getElementById('board');
  var ctx = canvas.getContext('2d');
  var messageEl = document.getElementById('message');
  var turnInfoEl = document.getElementById('turnInfo');
  var diceBox = document.getElementById('dice');
  var diceHint = document.getElementById('diceHint');
  var btnRoll = document.getElementById('btnRoll');
  var btnMove = document.getElementById('btnMove');
  var cardBox = document.getElementById('cardBox');
  var ratingEl = document.getElementById('rating');
  var btnRestart = document.getElementById('btnRestart');
  var setupEl = document.getElementById('setup');
  var nameListEl = document.getElementById('nameList');
  var btnStart = document.getElementById('btnStart');
  var finalEl = document.getElementById('final');
  var finalListEl = document.getElementById('finalList');
  var btnAgain = document.getElementById('btnAgain');

  // ============ СОСТОЯНИЕ ============
  var players = [];
  var current = 0;
  var phase = 'idle';   // idle | roll | move | land | card | over
  var dice = [1, 1, 1];
  var diceEls = [];
  var diceRolled = false;
  var rerollsLeft = 2;
  var isRolling = false;
  var cardDeck = [];
  var currentCard = null;
  var cardStage = null; // reading | doing
  var timerId = null;
  var timeLeft = 0;
  var cardTime = 0;
  var moveTimer = null;
  var msgTimer = null;

  // ============ УТИЛИТЫ ============
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function cellPos(i) {
    var r = Math.floor(i / COLS);
    var c = i % COLS;
    var ac = r % 2 === 0 ? c : COLS - 1 - c;
    var ar = ROWS - 1 - r;
    return { x: MARGIN + ac * CELL, y: MARGIN + ar * CELL };
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function setMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message show' + (type ? ' ' + type : '');
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      messageEl.className = 'message';
    }, 2600);
  }

  // ============ ОТРИСОВКА ПОЛЯ ============
  function drawBoard() {
    ctx.fillStyle = '#10102a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // тонкая сетка для красоты
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    ctx.lineWidth = 1;
    for (var x = MARGIN; x <= canvas.width - MARGIN; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, MARGIN); ctx.lineTo(x, canvas.height - MARGIN); ctx.stroke();
    }
    for (var y = MARGIN; y <= canvas.height - MARGIN; y += CELL) {
      ctx.beginPath(); ctx.moveTo(MARGIN, y); ctx.lineTo(canvas.width - MARGIN, y); ctx.stroke();
    }

    for (var i = 0; i < PATH_LEN; i++) drawCell(i);

    for (var pi = 0; pi < players.length; pi++) {
      var pl = players[pi];
      if (pl.finished) continue;
      drawPawn(pl, pi);
    }
  }

  function drawCell(i) {
    var p = cellPos(i);
    var x = p.x, y = p.y;
    var isStart = i === 0;
    var isFinish = i === PATH_LEN - 1;
    var sp = SPECIAL[i];

    var fill = '#efe9d8';
    if (isFinish) fill = '#2d3436';
    else if (sp > 0) fill = '#d2f5e0';
    else if (sp < 0) fill = '#fbdcd8';
    else if (isStart) fill = '#ffeaa7';

    roundRect(x + 3, y + 3, CELL - 6, CELL - 6, 10);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // номер клетки
    ctx.fillStyle = '#777';
    ctx.font = '11px sans-serif';
    ctx.fillText(String(i), x + CELL / 2, y + CELL - 16);

    if (isFinish) {
      ctx.font = '30px sans-serif';
      ctx.fillText('🏁', x + CELL / 2, y + CELL / 2 - 4);
    } else if (sp !== undefined) {
      ctx.font = 'bold 21px sans-serif';
      ctx.fillStyle = sp > 0 ? '#1e8449' : '#c0392b';
      ctx.fillText((sp > 0 ? '+' : '') + sp, x + CELL / 2, y + CELL / 2 - 2);
    } else if (isStart) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#8e6b0a';
      ctx.fillText('СТАРТ', x + CELL / 2, y + CELL / 2 - 2);
    } else {
      ctx.font = '15px sans-serif';
      ctx.fillText('🃏', x + CELL / 2, y + CELL / 2 - 2);
    }
  }

  function drawPawn(pl, pi) {
    var p = cellPos(pl.pos);
    var same = 0;
    for (var k = 0; k < pi; k++) {
      if (players[k].pos === pl.pos && !players[k].finished) same++;
    }
    var col = same % 2, row = Math.floor(same / 2);
    var cx = p.x + CELL / 2 + (col === 0 ? -15 : 15);
    var cy = p.y + CELL / 2 - 10 + row * 20;

    ctx.beginPath();
    ctx.arc(cx, cy + 1, 13, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = pl.color;
    ctx.fill();
    ctx.lineWidth = pi === current && phase !== 'over' ? 3 : 1.5;
    ctx.strokeStyle = pi === current && phase !== 'over' ? '#fff' : 'rgba(0,0,0,.35)';
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(String(pi + 1), cx, cy + 1);
  }

  // ============ ОТРИСОВКА КУБИКОВ ============
  function createDice() {
    diceBox.innerHTML = '';
    diceEls = [];
    for (var i = 0; i < 3; i++) {
      var d = document.createElement('div');
      d.className = 'die';
      d.addEventListener('click', function (e) {
        var idx = parseInt(e.currentTarget.dataset.i, 10);
        rerollDie(idx);
      });
      diceBox.appendChild(d);
      diceEls.push(d);
    }
  }

  function renderDie(el, value, rerollable) {
    el.innerHTML = '';
    el.className = 'die' + (rerollable ? ' rerollable' : '');
    el.dataset.i = el.dataset.i || String(diceEls.indexOf(el));
    var dots = PIP[value] || PIP[1];
    for (var k = 0; k < dots.length; k++) {
      var s = document.createElement('span');
      s.className = 'dot';
      s.style.left = dots[k][0] + '%';
      s.style.top = dots[k][1] + '%';
      el.appendChild(s);
    }
  }

  function renderDice() {
    var canReroll = phase === 'roll' && diceRolled && rerollsLeft > 0 && !isRolling;
    for (var i = 0; i < diceEls.length; i++) {
      renderDie(diceEls[i], dice[i], canReroll);
    }
    diceHint.textContent = diceRolled
      ? 'Перебросов осталось: ' + rerollsLeft
      : 'Брось кубики, чтобы начать ход';
  }

  // ============ КУБИКИ: ЛОГИКА ============
  function rollAll() {
    if (isRolling || phase !== 'roll') return;
    isRolling = true;
    var ticks = 0;
    var iv = setInterval(function () {
      ticks++;
      for (var i = 0; i < 3; i++) {
        diceEls[i].innerHTML = '';
        renderDie(diceEls[i], 1 + Math.floor(Math.random() * 6), false);
      }
      if (ticks >= 8) {
        clearInterval(iv);
        dice = [randDie(), randDie(), randDie()];
        diceRolled = true;
        rerollsLeft = 2;
        isRolling = false;
        renderDice();
        updateUI();
      }
    }, 70);
  }

  function randDie() { return 1 + Math.floor(Math.random() * 6); }

  function rerollDie(idx) {
    if (phase !== 'roll' || !diceRolled || rerollsLeft <= 0 || isRolling) return;
    var old = dice[idx];
    var nv = randDie();
    dice[idx] = nv;
    rerollsLeft--;
    // маленькая анимация переброса
    var ticks = 0;
    var iv = setInterval(function () {
      ticks++;
      renderDie(diceEls[idx], 1 + Math.floor(Math.random() * 6), true);
      if (ticks >= 5) {
        clearInterval(iv);
        dice[idx] = nv;
        renderDice();
        updateUI();
      }
    }, 60);
  }

  // ============ ДВИЖЕНИЕ ============
  function doMove() {
    if (phase !== 'roll' || !diceRolled) return;
    var sum = dice[0] + dice[1] + dice[2];
    var pl = players[current];
    var target = Math.min(PATH_LEN - 1, pl.pos + sum);
    if (target === pl.pos) { afterLand(); return; }
    phase = 'move';
    updateUI();
    var dir = Math.sign(target - pl.pos) || 1;
    var total = Math.abs(target - pl.pos);
    var step = 0;
    moveTimer = setInterval(function () {
      step++;
      pl.pos += dir;
      drawBoard();
      if (step >= total) {
        clearInterval(moveTimer);
        moveTimer = null;
        afterLand();
      }
    }, 130);
  }

  function afterLand() {
    var pl = players[current];
    var pos = pl.pos;
    if (pos === PATH_LEN - 1) {
      pl.finished = true;
      setMessage('🏁 ' + pl.name + ' дошёл(ла) до финиша!', 'ok');
      phase = 'over';
      drawBoard();
      updateUI();
      setTimeout(showFinal, 900);
      return;
    }
    if (SPECIAL[pos] !== undefined) {
      var v = SPECIAL[pos];
      pl.score += v;
      drawBoard();
      updateRating();
      setMessage(v > 0 ? '✅ Бонус +' + v + ' очков!' : '❌ Штраф ' + v + ' очка', v > 0 ? 'ok' : 'bad');
      setTimeout(nextTurn, 1500);
      return;
    }
    takeCard();
  }

  // ============ КАРТА ============
  function takeCard() {
    if (cardDeck.length === 0) {
      cardDeck = shuffle(DECK.slice());
    }
    currentCard = cardDeck.pop();
    cardStage = 'reading';
    phase = 'card';
    renderCard();
    updateUI();
  }

  function renderCard() {
    var c = currentCard;
    var cat = CATS[c.c];
    var html = '<div class="card-face" style="background:' + cat.color + '22;border:1px solid ' + cat.color + '">';
    html += '<span class="card-badge" style="background:' + cat.color + '">' + cat.icon + ' ' + cat.name + '</span>';
    html += '<p class="card-text">' + c.t + '</p>';

    if (cardStage === 'reading') {
      html += '<p class="card-note">📖 Прочитай карточку вслух для всей компании.</p>';
      html += '<div class="btn-row">';
      html += '<button class="btn primary" type="button" id="btnStartTask">Я прочитал(а) — таймер</button>';
      html += '<button class="btn" type="button" id="btnSkip1">Пропуск (−2)</button>';
      html += '</div>';
    } else {
      var frac = cardTime > 0 ? Math.max(0, timeLeft / cardTime) : 0;
      html += '<div class="card-timer">' + Math.ceil(timeLeft) + ' c</div>';
      html += '<div class="timer-bar"><div class="timer-fill" id="timerFill" style="width:' + (frac * 100) + '%"></div></div>';
      html += '<div class="btn-row">';
      html += '<button class="btn primary" type="button" id="btnDone">✅ Готово!</button>';
      html += '<button class="btn" type="button" id="btnSkip2">⏭️ Пропуск (−2)</button>';
      html += '</div>';
    }
    html += '</div>';
    cardBox.innerHTML = html;

    var b1 = document.getElementById('btnStartTask');
    if (b1) b1.addEventListener('click', startTask);
    var s1 = document.getElementById('btnSkip1');
    if (s1) s1.addEventListener('click', skipTask);
    var b2 = document.getElementById('btnDone');
    if (b2) b2.addEventListener('click', doneTask);
    var s2 = document.getElementById('btnSkip2');
    if (s2) s2.addEventListener('click', skipTask);
  }

  function startTask() {
    cardStage = 'doing';
    cardTime = currentCard.s;
    timeLeft = cardTime;
    renderCard();
    updateUI();
    timerId = setInterval(function () {
      timeLeft -= 0.1;
      var fill = document.getElementById('timerFill');
      var disp = document.querySelector('.card-timer');
      if (fill) fill.style.width = Math.max(0, timeLeft / cardTime * 100) + '%';
      if (disp) disp.textContent = Math.ceil(timeLeft) + ' c';
      if (timeLeft <= 0) {
        clearInterval(timerId);
        timerId = null;
        failTask();
      }
    }, 100);
  }

  function doneTask() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    var frac = cardTime > 0 ? Math.max(0, timeLeft / cardTime) : 0;
    var score = Math.max(1, Math.round(10 * frac));
    players[current].score += score;
    players[current].tasks++;
    setMessage('✅ Задание выполнено: +' + score + ' очков', 'ok');
    updateRating();
    drawBoard();
    setTimeout(nextTurn, 1200);
  }

  function skipTask() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    players[current].score -= 2;
    players[current].skips++;
    setMessage('⏭️ Пропуск: −2 очка', 'bad');
    updateRating();
    drawBoard();
    setTimeout(nextTurn, 1200);
  }

  function failTask() {
    setMessage('⏰ Время вышло: 0 очков', 'bad');
    setTimeout(nextTurn, 1500);
  }

  // ============ ХОД ============
  function nextTurn() {
    resetCard();
    current = (current + 1) % players.length;
    dice = [1, 1, 1];
    diceRolled = false;
    rerollsLeft = 2;
    phase = 'roll';
    cardBox.innerHTML = '<p class="card-empty">Здесь появится карточка задания.<br>Попади на клетку — и возьми карту.</p>';
    updateUI();
    drawBoard();
  }

  function resetCard() {
    currentCard = null;
    cardStage = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  // ============ UI ============
  function updateTurnInfo() {
    if (phase === 'over' || players.length === 0) {
      turnInfoEl.innerHTML = '';
      return;
    }
    var pl = players[current];
    var hint = '';
    switch (phase) {
      case 'roll': hint = diceRolled ? 'Можно перебросить до двух кубиков или ходить.' : 'Нажми «Бросить кубики».'; break;
      case 'move': hint = 'Фишка идёт по полю…'; break;
      case 'land': hint = 'Нажми, чтобы взять карту задания.'; break;
      case 'card': hint = cardStage === 'reading' ? 'Прочитай карту вслух!' : 'Выполняй задание на время!'; break;
      default: hint = '';
    }
    turnInfoEl.innerHTML =
      '<div><span class="dot" style="background:' + pl.color + '"></span>Ход: <b>' + pl.name + '</b></div>' +
      '<div style="font-size:13px;color:#aab">' + hint + '</div>';
  }

  function updateRating() {
    ratingEl.innerHTML = '';
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var li = document.createElement('li');
      if (i === current && phase !== 'over') li.className = 'current';
      li.innerHTML =
        '<span class="dot" style="background:' + p.color + '"></span>' +
        '<span class="pname">' + p.name + '</span>' +
        '<span class="pskips">пропусков: ' + p.skips + '</span>' +
        '<span class="pscore">' + p.score + '</span>';
      ratingEl.appendChild(li);
    }
  }

  function updateUI() {
    var rollOk = phase === 'roll' && !isRolling;
    btnRoll.disabled = !rollOk;
    btnMove.disabled = !(phase === 'roll' && diceRolled && !isRolling);
    updateTurnInfo();
    renderDice();
  }

  // ============ СТАРТ / ФИНАЛ ============
  function buildSetup() {
    nameListEl.innerHTML = '';
    for (var i = 0; i < 5; i++) {
      var row = document.createElement('div');
      row.className = 'name-row';
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = PLAYER_COLORS[i];
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 18;
      inp.value = DEFAULT_NAMES[i];
      inp.placeholder = DEFAULT_NAMES[i];
      inp.dataset.i = i;
      row.appendChild(dot);
      row.appendChild(inp);
      nameListEl.appendChild(row);
    }
  }

  function beginGame() {
    players = [];
    var inputs = nameListEl.querySelectorAll('input');
    for (var i = 0; i < 5; i++) {
      var name = inputs[i].value.trim() || DEFAULT_NAMES[i];
      players.push({
        name: name,
        color: PLAYER_COLORS[i],
        pos: 0,
        score: 0,
        skips: 0,
        tasks: 0,
        finished: false
      });
    }
    cardDeck = shuffle(DECK.slice());
    current = 0;
    dice = [1, 1, 1];
    diceRolled = false;
    rerollsLeft = 2;
    phase = 'roll';
    setupEl.classList.add('hidden');
    finalEl.classList.add('hidden');
    drawBoard();
    updateUI();
    updateRating();
  }

  function showFinal() {
    var sorted = players.slice().sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (a.finished ? 1 : 0) - (b.finished ? 1 : 0);
    });
    var medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    finalListEl.innerHTML = '';
    for (var i = 0; i < sorted.length; i++) {
      var p = sorted[i];
      var div = document.createElement('div');
      div.className = 'final-item' + (i === 0 ? ' win' : '');
      div.innerHTML =
        '<span class="place">' + medals[i] + '</span>' +
        '<span class="dot" style="background:' + p.color + '"></span>' +
        '<span class="fname">' + p.name + '</span>' +
        '<span class="fscore">' + p.score + '</span>';
      finalListEl.appendChild(div);
    }
    finalEl.classList.remove('hidden');
  }

  function fullReset() {
    resetCard();
    if (moveTimer) { clearInterval(moveTimer); moveTimer = null; }
    players = [];
    current = 0;
    phase = 'idle';
    finalEl.classList.add('hidden');
    setupEl.classList.remove('hidden');
    buildSetup();
    updateUI();
    drawBoard();
  }

  // ============ СОБЫТИЯ ============
  function bindEvents() {
    btnRoll.addEventListener('click', rollAll);
    btnMove.addEventListener('click', doMove);
    btnRestart.addEventListener('click', fullReset);
    btnStart.addEventListener('click', beginGame);
    btnAgain.addEventListener('click', fullReset);
  }

  // ============ ИНИЦИАЛИЗАЦИЯ ============
  canvas.width = MARGIN * 2 + COLS * CELL;
  canvas.height = MARGIN * 2 + ROWS * CELL;

  bindEvents();
  createDice();
  buildSetup();
  drawBoard();
  updateUI();
})();
