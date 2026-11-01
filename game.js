// =============================================================================
// ГЛАВНЫЙ ДВИЖОК: КРАФТ ГИПЕР-КОНФЕТ, ПАУЗА ПО ESC И ФЕЙЕРВЕРК АЧИВОК
// =============================================================================
window.Game = {
  canvas: null,
  ctx: null,

  state: {
    W: 0, H: 0,
    PLAY_W: 720, PLAY_LEFT: 0, PLAY_RIGHT: 720,
    gameActive: false,
    isPaused: false,
    startTime: 0,
    score: 0,
    combo: 0,
    lastHitTime: 0,
    screenShake: 0,
    fairyFrozenUntil: 0,
    inventory: [0, 1, 2, 3],
    selectedSlot: 0,

    stats: {
      teethBrokenTotal: 0,
      stoneHitsTotal: 0,
      provokedFairyTotal: 0,
      totalPlayTimeSec: 0,
      unlockedAchievements: []
    },

    head: {
      x: 0, y: 0, radius: 150,
      mouthOpen: 0, timer: 0, hitTimer: 0, smugTimer: 0
    },

    fairy: {
      x: 0, y: 0, baseY: 0, dir: 1, baseSpeed: 3.5, radius: 30,
      time: 0, state: 'FLYING', eatTimer: 0, enragedUntil: 0,
      tapAngryUntil: 0, stoneSlowUntil: 0, megaSlowUntil: 0,
      stoneHits: 0, hitFlash: 0,
      speechText: '', speechTimer: 0
    },

    slingshot: {
      x: 0, y: 0, touching: false, dragX: 0, dragY: 0
    },

    teeth: [],
    bullets: [],
    fallingCandies: [],
    particles: [],
    floatingTexts: [],

    sprites: {
      head: new Image(), fairy: new Image(), candies: new Image(), tooth: new Image(),
      loaded: { head: false, fairy: false, candies: false, tooth: false }
    },

    triggerFairySpeech(type) {
      const quotes = CONFIG.FAIRY_QUOTES[type];
      if (quotes && quotes.length > 0) {
        this.fairy.speechText = quotes[Math.floor(Math.random() * quotes.length)];
        this.fairy.speechTimer = 75;
        AudioEngine.sfx.fairyTaunt();
      }
    },

    spawnFloatingText(x, y, text, color = '#ffaa00') {
      this.floatingTexts.push({ x, y, text, color, alpha: 1.0 });
    },

    spawnDebris(x, y) {
      for (let i = 0; i < 7; i++) {
        this.particles.push({
          x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 1) * 8,
          size: 4 + Math.random() * 6, alpha: 1
        });
      }
    },

    growBackTooth() {
      const damaged = this.teeth.filter(t => t.hp < 2);
      if (damaged.length > 0) {
        const t = damaged[Math.floor(Math.random() * damaged.length)];
        t.hp = 2;
        this.head.smugTimer = 25;
        this.triggerFairySpeech('heal');
        AudioEngine.sfx.regrow();
      }
    },

    checkWinCondition() {
      if (this.teeth.every(t => t.hp <= 0)) {
        this.gameActive = false;
        const totalSec = ((Date.now() - this.startTime) / 1000).toFixed(1);

        if (totalSec < 35) {
          Game.unlockAchievement('speedrun');
        }

        setTimeout(() => {
          document.getElementById('win-stats').innerHTML = 
            `⏱ Время разгрома: <b>${totalSec} сек</b> | Очки: <b>${this.score}</b>`;
          
          const diag = CONFIG.DIAGNOSES[Math.floor(Math.random() * CONFIG.DIAGNOSES.length)];
          document.getElementById('diagnosis-box').innerHTML = 
            `🧠 <b>Диагноз: ${diag.title}</b><br>${diag.desc}`;
          
          const pBtn = document.getElementById('win-btn-primary');
          pBtn.href = diag.pLink;
          pBtn.innerText = diag.pText;

          const sBtn = document.getElementById('win-btn-secondary');
          sBtn.href = diag.sLink;
          sBtn.innerText = diag.sText;

          document.getElementById('win-modal').style.display = 'flex';
        }, 450);
      }
    }
  },

  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.loadSavedStats();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.initTeeth();
    this.loadAssets();
    this.bindEvents();

    // Секундомер общего времени в игре
    setInterval(() => {
      if (this.state.gameActive && !this.state.isPaused) {
        this.state.stats.totalPlayTimeSec++;
        this.saveStats();
      }
    }, 1000);

    const loop = () => {
      Physics.update(this.state);
      Renderer.render(this.ctx, this.state);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  loadSavedStats() {
    try {
      const saved = JSON.parse(localStorage.getItem('ego_player_stats') || '{}');
      this.state.stats.teethBrokenTotal = saved.teethBrokenTotal || 0;
      this.state.stats.stoneHitsTotal = saved.stoneHitsTotal || 0;
      this.state.stats.provokedFairyTotal = saved.provokedFairyTotal || 0;
      this.state.stats.totalPlayTimeSec = saved.totalPlayTimeSec || 0;
      this.state.stats.unlockedAchievements = saved.unlockedAchievements || [];
    } catch(e) {}
  },

  saveStats() {
    try {
      localStorage.setItem('ego_player_stats', JSON.stringify(this.state.stats));
    } catch(e) {}
  },

  checkAchievements() {
    const s = this.state;
    if (s.stats.teethBrokenTotal >= 10) this.unlockAchievement('teeth_10');
    if (s.stats.teethBrokenTotal >= 25) this.unlockAchievement('teeth_25');
    if (s.stats.teethBrokenTotal >= 50) this.unlockAchievement('teeth_50');
    if (s.stats.teethBrokenTotal >= 100) this.unlockAchievement('teeth_100');
    if (s.stats.teethBrokenTotal >= 200) this.unlockAchievement('teeth_200');

    if (s.stats.stoneHitsTotal >= 3) this.unlockAchievement('stone_3');
    if (s.stats.stoneHitsTotal >= 10) this.unlockAchievement('stone_10');

    if (s.stats.provokedFairyTotal >= 5) this.unlockAchievement('provocateur');

    if (s.combo >= 3) this.unlockAchievement('combo_3');
    if (s.combo >= 4) this.unlockAchievement('flawless_combo');
    if (s.combo >= 5) this.unlockAchievement('combo_5');
  },

  // ФОНТАН ИЗ КУБКОВ И ЗВЕЗД ПРИ АЧИВКЕ
  triggerTrophyShower() {
    const trophyBtn = document.getElementById('trophy-btn');
    const rect = trophyBtn ? trophyBtn.getBoundingClientRect() : { left: this.state.W / 2, top: 40 };
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 24; i++) {
      this.state.particles.push({
        x: originX,
        y: originY,
        char: Math.random() > 0.4 ? '⭐' : '🏆',
        vx: (Math.random() - 0.5) * 12,
        vy: -3 - Math.random() * 8,
        gravity: 0.35,
        fade: 0.015,
        size: 18 + Math.random() * 10,
        alpha: 1
      });
    }
  },

  unlockAchievement(achId) {
    if (this.state.stats.unlockedAchievements.includes(achId)) return;
    this.state.stats.unlockedAchievements.push(achId);
    this.saveStats();

    const ach = CONFIG.ACHIEVEMENTS.find(a => a.id === achId);
    if (ach) {
      AudioEngine.sfx.achievement();
      this.triggerTrophyShower(); // Фейерверк!
      this.showAchievementBanner(ach);
    }

    // ПРОВЕРКА: ОТКРЫТЫ ЛИ ВСЕ АЧИВКИ?
    if (this.state.stats.unlockedAchievements.length >= CONFIG.ACHIEVEMENTS.length) {
      setTimeout(() => this.showAllCompletedModal(), 1500);
    }
  },

  showAchievementBanner(ach) {
    const toast = document.getElementById('achievement-toast');
    if (toast) {
      toast.innerHTML = `<span style="font-size:22px;">🏆</span> <div><b>${ach.title}</b><br><span style="font-size:11px; color:#bbb;">${ach.desc}</span></div>`;
      toast.style.display = 'flex';
      toast.style.animation = 'none';
      setTimeout(() => toast.style.animation = 'toastAnim 3.5s forwards', 10);
    }
  },

  showAllCompletedModal() {
    const mins = Math.max(1, Math.round(this.state.stats.totalPlayTimeSec / 60));
    document.getElementById('all-comp-time').innerText = mins;
    document.getElementById('all-completed-modal').style.display = 'flex';
  },

  // МЕХАНИКА СЛИЯНИЯ 3 КОНФЕТ В ГИПЕР-КОНФЕТУ
  checkCandyMerge() {
    const inv = this.state.inventory;
    // Считаем количество конфет базовых типов (0, 1, 2, 3)
    for (let typeId = 0; typeId <= 3; typeId++) {
      const matchIndices = [];
      inv.forEach((id, idx) => {
        if (id === typeId) matchIndices.push(idx);
      });

      if (matchIndices.length >= 3) {
        // Удаляем 3 штуки с конца
        matchIndices.slice(0, 3).reverse().forEach(idx => {
          inv.splice(idx, 1);
        });

        // Добавляем Гипер-конфету (ID: 4)
        inv.push(4);
        AudioEngine.sfx.hyperMerge();
        this.state.spawnFloatingText(this.state.W / 2, this.state.H * 0.75, '✨ СЛИЯНИЕ! ГИПЕР-КОНФЕТА 🌟', '#ffcc00');
        this.unlockAchievement('hyper_craft');
        this.updateInventoryUI();
        break;
      }
    }
  },

  resize() {
    const s = this.state;
    s.W = this.canvas.width = window.innerWidth;
    s.H = this.canvas.height = window.innerHeight;
    s.PLAY_W = Math.min(s.W, 720);
    s.PLAY_LEFT = (s.W - s.PLAY_W) / 2;
    s.PLAY_RIGHT = s.PLAY_LEFT + s.PLAY_W;

    s.head.x = s.W / 2;
    s.head.y = Math.max(s.H * 0.22, 130);
    s.head.radius = Math.min(s.PLAY_W * 0.38, 155);

    s.fairy.baseY = s.H * 0.47;
    if (s.fairy.x === 0) s.fairy.x = s.W / 2;

    s.slingshot.x = s.W / 2;
    s.slingshot.y = s.W > 1000 ? s.H - 260 : s.H - 120;
  },

  initTeeth() {
    this.state.teeth = CONFIG.TEETH_COORDS.map(t => ({ ...t }));
  },

  loadAssets() {
    let loaded = 0;
    const total = 4;
    const finish = () => {
      const loader = document.getElementById('loading-screen');
      if (loader) loader.style.display = 'none';
      document.getElementById('tutorial-modal').style.display = 'flex';
      this.renderTutorialSprites();
      this.updateInventoryUI();
    };

    const onLoad = (key) => {
      this.state.sprites.loaded[key] = true;
      loaded++;
      const bar = document.getElementById('loader-bar');
      if (bar) bar.style.width = `${Math.min(100, (loaded / total) * 100)}%`;
      if (loaded >= total) setTimeout(finish, 200);
    };

    const setup = (k, src) => {
      this.state.sprites[k].onload = () => onLoad(k);
      this.state.sprites[k].onerror = () => onLoad(k);
      this.state.sprites[k].src = src;
    };

    setup('head', 'head.png');
    setup('fairy', 'fairy.png');
    setup('candies', 'candies.png');
    setup('tooth', 'tooth.png');

    setTimeout(finish, 1200);
  },

  renderTutorialSprites() {
    if (!this.state.sprites.loaded.candies) return;
    const cw = this.state.sprites.candies.width / 4;
    const ch = this.state.sprites.candies.height;
    for (let i = 0; i < 4; i++) {
      const c = document.getElementById(`guide-c${i}`);
      if (c) {
        const cx = c.getContext('2d');
        cx.clearRect(0, 0, 48, 48);
        cx.drawImage(this.state.sprites.candies, i * cw, 0, cw, ch, 4, 4, 40, 40);
      }
    }
  },

  updateInventoryUI() {
    const s = this.state;
    if (s.selectedSlot >= s.inventory.length) s.selectedSlot = Math.max(0, s.inventory.length - 1);

    for (let i = 0; i < 4; i++) {
      const slot = document.getElementById(`slot-${i}`);
      slot.className = 'inv-slot' + (i === s.selectedSlot ? ' selected' : '');
      const sc = document.getElementById(`sc-${i}`);
      const sctx = sc.getContext('2d');
      sctx.clearRect(0, 0, 48, 48);

      if (s.inventory[i] !== undefined) {
        const typeId = s.inventory[i];

        // Отрисовка гипер-конфеты в слоте
        if (typeId === 4) {
          sctx.save();
          sctx.fillStyle = '#ffcc00';
          sctx.shadowColor = '#ff5500';
          sctx.shadowBlur = 8;
          sctx.beginPath();
          sctx.arc(24, 24, 16, 0, Math.PI * 2);
          sctx.fill();
          sctx.font = '16px sans-serif';
          sctx.textAlign = 'center';
          sctx.textBaseline = 'middle';
          sctx.fillText('⭐', 24, 24);
          sctx.restore();
        } else if (s.sprites.loaded.candies) {
          const cw = s.sprites.candies.width / 4;
          const ch = s.sprites.candies.height;
          sctx.drawImage(s.sprites.candies, typeId * cw, 0, cw, ch, 4, 4, 40, 40);
        }
      }
    }
  },

  bindEvents() {
    const s = this.state;
    const getPos = (e) => {
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX, y: t.clientY };
    };

    const isUI = (e) => e.target.closest('.modal') || e.target.closest('#hack-btn') || e.target.closest('#inventory-bar') || e.target.closest('#hud-btns');

    const onStart = (e) => {
      AudioEngine.init();
      if (isUI(e)) return;
      if (!s.gameActive || s.isPaused) return;
      if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();

      const p = getPos(e);

      // Тап по фее
      if (Math.hypot(p.x - s.fairy.x, p.y - s.fairy.y) < s.fairy.radius + 18) {
        s.fairy.tapAngryUntil = Date.now() + 10000;
        s.stats.provokedFairyTotal++;
        this.checkAchievements();
        AudioEngine.playCustom('snd-ai');
        s.triggerFairySpeech('hit');
        s.spawnFloatingText(s.fairy.x, s.fairy.y - 20, 'АНГРИ! +20%', '#ff0055');
        s.spawnDebris(s.fairy.x, s.fairy.y);
        return;
      }

      // Сбор конфет / очки + Проверка слияния 3 в 1
      for (let i = s.fallingCandies.length - 1; i >= 0; i--) {
        let c = s.fallingCandies[i];
        if (Math.hypot(p.x - c.x, p.y - c.y) < 48) {
          if (s.inventory.length < 4) {
            s.inventory.push(c.typeId);
            this.checkCandyMerge(); // Проверяем крафт 3-х одинаковых!
            this.updateInventoryUI();
          } else {
            s.score += 100;
            document.getElementById('score-val').innerText = s.score;
            s.spawnFloatingText(c.x, c.y, '+100 ОЧКОВ', '#00ffcc');
            AudioEngine.playTone(550, 'sine', 0.1, 0.3);
          }
          s.fallingCandies.splice(i, 1);
          return;
        }
      }

      // Зарядка рогатки
      const touchThreshold = s.W > 1000 ? s.H * 0.40 : s.H * 0.52;
      if (p.y > touchThreshold && s.inventory.length > 0) {
        s.slingshot.touching = true;
        s.slingshot.dragX = p.x;
        s.slingshot.dragY = p.y;
      }
    };

    const onMove = (e) => {
      if (isUI(e)) return;
      if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();
      if (!s.slingshot.touching || s.isPaused) return;
      const p = getPos(e);
      s.slingshot.dragX = p.x;
      s.slingshot.dragY = p.y;
    };

    const onEnd = (e) => {
      if (isUI(e)) return;
      if (!s.slingshot.touching || s.isPaused) return;
      s.slingshot.touching = false;

      const dx = s.slingshot.x - s.slingshot.dragX;
      const dy = s.slingshot.y - s.slingshot.dragY;
      const dist = Math.hypot(dx, dy);
      const isPulledDown = s.slingshot.dragY > s.slingshot.y + 28;

      if (dist > 35 && isPulledDown && s.inventory.length > 0) {
        const curType = CONFIG.CANDY_TYPES[s.inventory[s.selectedSlot]];
        s.inventory.splice(s.selectedSlot, 1);
        this.updateInventoryUI();

        const power = Math.min(dist, 160) * 0.20 * curType.speedMult;
        const angle = Math.atan2(dy, dx);

        s.bullets.push({
          x: s.slingshot.x, y: s.slingshot.y,
          vx: Math.cos(angle) * power, vy: Math.sin(angle) * power,
          type: curType, radius: curType.id === 4 ? 20 : 16
        });

        AudioEngine.sfx.shoot();
      }
    };

    window.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    this.canvas.addEventListener('touchmove', onMove, { passive: false });
    this.canvas.addEventListener('touchend', onEnd, { passive: false });

    // ПАУЗА ПО КЛАВИШЕ ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        togglePause();
      }
    });

    setInterval(() => {
      if (!s.gameActive || s.isPaused || s.fallingCandies.length >= 3) return;
      s.fallingCandies.push({
        x: s.PLAY_LEFT + 50 + Math.random() * (s.PLAY_W - 100),
        y: -30, speed: 1.5 + Math.random() * 1.5,
        typeId: Math.floor(Math.random() * 4), // Спавнятся базовые 4 вида
        rot: 0
      });
    }, 2400);
  }
};

// =============================================================================
// ЭКСПОРТ UI
// =============================================================================
function startGame() {
  document.getElementById('tutorial-modal').style.display = 'none';
  AudioEngine.init();
  Game.state.startTime = Date.now();
  Game.state.gameActive = true;
}

function selectSlot(idx) {
  if (Game.state.inventory[idx] !== undefined) {
    Game.state.selectedSlot = idx;
    Game.updateInventoryUI();
  }
}

function togglePause() {
  Game.state.isPaused = !Game.state.isPaused;
  const btn = document.getElementById('pause-btn');
  if (btn) btn.innerText = Game.state.isPaused ? '▶️' : '⏸';

  // Корректное глушение и возобновление музыки
  if (Game.state.isPaused) {
    AudioEngine.pauseMusic();
  } else {
    AudioEngine.resumeMusic();
  }
}

function openAchievementsModal() {
  const container = document.getElementById('achievements-list');
  container.innerHTML = '';
  
  CONFIG.ACHIEVEMENTS.forEach(a => {
    const isUnlocked = Game.state.stats.unlockedAchievements.includes(a.id);
    const item = document.createElement('div');
    item.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:8px 10px; margin-bottom:6px; border-radius:8px; background:${isUnlocked ? 'rgba(0,255,204,0.1)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${isUnlocked ? '#00ffcc' : 'transparent'}; font-size:12px;`;
    item.innerHTML = `<div><b>${a.title}</b><br><span style="color:#aaa; font-size:11px;">${a.desc}</span></div><div>${isUnlocked ? '✅' : '🔒'}</div>`;
    container.appendChild(item);
  });

  document.getElementById('achievements-modal').style.display = 'flex';
}

function toggleMusic() { AudioEngine.toggleMusic(); }
function openHackModal() { document.getElementById('hack-modal').style.display = 'flex'; }
function closeModals() { 
  document.querySelectorAll('.modal').forEach(m => {
    if (m.id !== 'tutorial-modal') m.style.display = 'none';
  });
}

function applyCheat() {
  const val = document.getElementById('cheat-input').value.trim().toLowerCase();
  let used = [];
  try { used = JSON.parse(localStorage.getItem('ego_used_cheats') || '[]'); } catch(e) {}

  if (used.includes(val)) {
    alert('⚠️ Этот код уже был активирован ранее!');
    return;
  }

  if (CONFIG.CHEATS.includes(val)) {
    used.push(val);
    try { localStorage.setItem('ego_used_cheats', JSON.stringify(used)); } catch(e) {}
    Game.state.fairyFrozenUntil = Date.now() + 10000;
    alert('Фея заморожена на 10 секунд.');
    closeModals();
  } else {
    alert('Неверный код! Загляни в последние посты на Threads или ВК.');
  }
}

function restartGame() {
  document.getElementById('win-modal').style.display = 'none';
  Game.state.startTime = Date.now();
  Game.state.inventory = [0, 1, 2, 3];
  Game.state.selectedSlot = 0;
  Game.state.score = 0;
  Game.state.combo = 0;
  document.getElementById('score-val').innerText = 0;
  Game.updateInventoryUI();
  Game.initTeeth();
  Game.state.bullets = [];
  Game.state.gameActive = true;
}

window.addEventListener('DOMContentLoaded', () => Game.init());