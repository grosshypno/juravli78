// =============================================================================
// ФИЗИКА, РАЗГРОМ ГИПЕР-КОНФЕТОЙ И ТРИГГЕРЫ (ИСПРАВЛЕНА ОШИБКА FAIRY)
// =============================================================================
window.Physics = {
  update(state) {
    if (state.isPaused) return;

    state.head.timer += 0.038;
    state.head.mouthOpen = (Math.sin(state.head.timer) + 1) / 2;
    state.fairy.time += 0.06;

    if (!state.gameActive) return;

    const now = Date.now();
    document.getElementById('timer').innerText = ((now - state.startTime) / 1000).toFixed(1);

    if (state.screenShake > 0) state.screenShake *= 0.88;
    if (state.head.hitTimer > 0) state.head.hitTimer--;
    if (state.head.smugTimer > 0) state.head.smugTimer--;
    if (state.fairy.hitFlash > 0) state.fairy.hitFlash--;
    if (state.fairy.speechTimer > 0) state.fairy.speechTimer--;

    // Сброс комбо через 2.5 сек
    if (state.combo > 0 && now - state.lastHitTime > 2500) {
      state.combo = 0;
    }

    const isFrozen = now < state.fairyFrozenUntil;
    const isChiliEnraged = now < state.fairy.enragedUntil;
    const isTapAngry = now < state.fairy.tapAngryUntil;
    const isStoneSlow = now < state.fairy.stoneSlowUntil;
    const isMegaSlow = now < state.fairy.megaSlowUntil;

    const deadCount = state.teeth.filter(t => t.hp <= 0).length;
    let speedMult = 1 + (deadCount * 0.12);

    if (isChiliEnraged) speedMult *= 2.2;
    if (isTapAngry) speedMult *= 1.20;
    if (isStoneSlow) speedMult *= 0.75;
    if (isMegaSlow) speedMult *= 0.50;

    if (isFrozen) {
      state.fairy.state = 'FROZEN';
    } else if (state.fairy.state === 'EATING') {
      state.fairy.eatTimer--;
      if (state.fairy.eatTimer <= 0) state.fairy.state = 'FLYING';
    } else {
      state.fairy.state = (isChiliEnraged || isTapAngry) ? 'ENRAGED' : 'FLYING';

      state.fairy.x += state.fairy.dir * state.fairy.baseSpeed * speedMult;
      // ЗДЕСЬ БЫЛА ОШИБКА — ТЕПЕРЬ СТРОГО state.fairy.time:
      state.fairy.y = state.fairy.baseY + Math.sin(state.fairy.time * 2.3) * 35 + Math.cos(state.fairy.time * 0.8) * 15;

      const minX = state.PLAY_LEFT + 45;
      const maxX = state.PLAY_RIGHT - 45;

      if (state.fairy.x >= maxX) {
        state.fairy.x = maxX;
        state.fairy.dir = -1;
      } else if (state.fairy.x <= minX) {
        state.fairy.x = minX;
        state.fairy.dir = 1;
      }
    }

    // Снаряды
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      let b = state.bullets[i];
      b.vy += 0.38 * b.type.weight;
      b.x += b.vx;
      b.y += b.vy;

      // 1. КОЛЛИЗИЯ С ФЕЕЙ
      const isStone = b.type.special === 'heavy';
      const isHyper = b.type.special === 'hyper';
      const canHitFairy = (state.fairy.state !== 'FROZEN') && 
                          (b.type.special !== 'ghost') && 
                          (state.fairy.state !== 'EATING' || isStone || isHyper);

      if (canHitFairy) {
        if (Math.hypot(b.x - state.fairy.x, b.y - state.fairy.y) < b.radius + state.fairy.radius) {
          state.bullets.splice(i, 1);

          if (isHyper) {
            state.fairy.state = 'FLYING';
            state.fairy.stoneSlowUntil = Date.now() + 10000;
            state.fairy.hitFlash = 25;
            state.triggerFairySpeech('hit');
            state.spawnFloatingText(state.fairy.x, state.fairy.y - 20, 'ГИПЕР-УДАР!', '#ffcc00');
            state.spawnDebris(state.fairy.x, state.fairy.y);
            AudioEngine.sfx.hit();
            continue;
          }

          if (isStone) {
            state.fairy.state = 'FLYING';
            state.fairy.stoneSlowUntil = Date.now() + 8000;
            state.fairy.hitFlash = 15;
            state.fairy.stoneHits++;
            state.stats.stoneHitsTotal++;
            Game.checkAchievements();

            state.triggerFairySpeech('hit');
            state.spawnFloatingText(state.fairy.x, state.fairy.y - 15, 'СТАН! -25%', '#00ffcc');

            if (state.fairy.stoneHits >= 3) {
              state.fairy.stoneHits = 0;
              state.fairy.megaSlowUntil = Date.now() + 20000;
              AudioEngine.playCustom('snd-oi');
              state.spawnFloatingText(state.fairy.x, state.fairy.y - 35, 'МЕГА-СТАН -50%!', '#ff0055');
            } else {
              AudioEngine.sfx.hit();
            }
            state.spawnDebris(state.fairy.x, state.fairy.y);
            continue;
          }

          if (b.type.special === 'chili') {
            state.fairy.enragedUntil = Date.now() + 6000;
            state.fairy.state = 'ENRAGED';
            AudioEngine.sfx.enrage();
            continue;
          }

          state.fairy.state = 'EATING';
          state.fairy.eatTimer = 85;
          state.triggerFairySpeech('eat');
          AudioEngine.sfx.eat();
          continue;
        }
      }

      // 2. КОЛЛИЗИЯ СО РТОМ И ЗУБАМИ
      if (state.head.mouthOpen > 0.35) {
        let hit = false;
        const R = state.head.radius;

        let targetTeeth = [];
        state.teeth.forEach((t, idx) => {
          if (t.hp <= 0) return;
          const tx = state.head.x + (t.rx * R);
          const ty = state.head.y + (t.ry * R);
          const dist = Math.hypot(b.x - tx, b.y - ty);

          if (dist < b.radius + (R * 0.16)) {
            targetTeeth.push({ tooth: t, dist, tx, ty, idx });
          }
        });

        if (targetTeeth.length > 0) {
          hit = true;
          state.bullets.splice(i, 1);

          // ГИПЕР-КОНФЕТА СНОСИТ 3 ЗУБА
          if (isHyper) {
            const aliveTeeth = state.teeth.filter(t => t.hp > 0).slice(0, 3);
            let brokenCount = 0;

            aliveTeeth.forEach(t => {
              t.hp = 0;
              brokenCount++;
              const tx = state.head.x + (t.rx * R);
              const ty = state.head.y + (t.ry * R);
              state.spawnDebris(tx, ty);
            });

            state.screenShake = 25;
            state.head.hitTimer = 22;
            state.score += 1000;
            document.getElementById('score-val').innerText = state.score;
            state.spawnFloatingText(state.head.x, state.head.y, 'ТРОЙНОЙ РАЗГРОМ! +1000', '#ffcc00');

            state.stats.teethBrokenTotal += brokenCount;
            if (brokenCount >= 3) {
              Game.unlockAchievement('hyper_strike');
            }
            Game.checkAchievements();
            AudioEngine.sfx.breakTooth();
            state.checkWinCondition();
            continue;
          }

          // ОБЫЧНЫЙ СНАРЯД
          targetTeeth.sort((a, b) => a.dist - b.dist);
          const hitObj = targetTeeth[0];
          hitObj.tooth.hp -= b.type.damage;

          if (hitObj.tooth.hp <= 0) {
            state.combo++;
            state.lastHitTime = Date.now();
            state.stats.teethBrokenTotal++;
            Game.checkAchievements();

            const comboMult = Math.max(1, state.combo);
            const pointsEarned = 250 * comboMult;
            state.score += pointsEarned;
            document.getElementById('score-val').innerText = state.score;

            const comboText = state.combo > 1 ? `x${state.combo} КОМБО! +${pointsEarned}` : `+${pointsEarned}`;
            state.spawnFloatingText(hitObj.tx, hitObj.ty, comboText, state.combo > 1 ? '#ffcc00' : '#ffffff');

            AudioEngine.sfx.breakTooth();
            state.spawnDebris(hitObj.tx, hitObj.ty);
          } else {
            AudioEngine.sfx.hit();
          }

          state.head.hitTimer = 16;
          state.screenShake = 16;
          state.checkWinCondition();
          continue;
        }
      }

      // 3. ПРОМАХ
      if (b.y > state.H + 50 || b.x < -50 || b.x > state.W + 50) {
        state.bullets.splice(i, 1);
        state.combo = 0;
        state.triggerFairySpeech('miss');
        state.growBackTooth();
      }
    }

    // Падающие сладости
    for (let i = state.fallingCandies.length - 1; i >= 0; i--) {
      let c = state.fallingCandies[i];
      c.y += c.speed;
      c.rot += 0.02;
      if (c.y > state.H + 40) state.fallingCandies.splice(i, 1);
    }

    // Осколки
    for (let i = state.particles.length - 1; i >= 0; i--) {
      let p = state.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity !== undefined ? p.gravity : 0.3; p.alpha -= p.fade !== undefined ? p.fade : 0.03;
      if (p.alpha <= 0) state.particles.splice(i, 1);
    }

    // Плавающие тексты
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      let ft = state.floatingTexts[i];
      ft.y -= 1.2;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) state.floatingTexts.splice(i, 1);
    }

    document.getElementById('teeth-count').innerText = state.teeth.filter(t => t.hp > 0).length;
  }
};