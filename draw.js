// =============================================================================
// РЕНДЕРИНГ: ЧЕРНЫЙ ЖИРНЫЙ ТЕКСТ ФЕИ (20px), ГИПЕР-КОНФЕТА И ФОНТАН АЧИВОК
// =============================================================================
window.Renderer = {
  render(ctx, state) {
    ctx.save();
    if (state.screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
    }
    ctx.clearRect(0, 0, state.W, state.H);

    const R = state.head.radius;

    // 1. ТЫКВА
    ctx.save();
    ctx.translate(state.head.x, state.head.y);

    let frameIdx = 0;
    if (state.head.hitTimer > 0) frameIdx = 2; // Кадр боли!
    else if (state.head.mouthOpen > 0.35) frameIdx = 3;
    else if (state.head.mouthOpen > 0.12) frameIdx = 1;
    else frameIdx = 0;

    if (state.sprites.loaded.head) {
      const fw = state.sprites.head.width / 4;
      const fh = state.sprites.head.height;
      const dw = R * 2.3;
      const dh = dw * (fh / fw);
      ctx.drawImage(state.sprites.head, frameIdx * fw, 0, fw, fh, -dw / 2, -dh / 2, dw, dh);
    }

    // 2. ЗУБЫ
    if (frameIdx === 3) {
      state.teeth.forEach(t => {
        if (t.hp <= 0) return;
        const tx = t.rx * R;
        const ty = t.ry * R;
        const tSize = R * 0.22;

        ctx.save();
        ctx.translate(tx, ty);
        if (t.upper) ctx.scale(1, -1);

        if (state.sprites.loaded.tooth) {
          const tw = state.sprites.tooth.width / 2;
          const th = state.sprites.tooth.height;
          const toothFrame = t.hp === 1 ? 1 : 0;
          ctx.drawImage(state.sprites.tooth, toothFrame * tw, 0, tw, th, -tSize/2, -tSize/2, tSize, tSize);
        }
        ctx.restore();
      });
    }
    ctx.restore();

    // 3. ФЕЯ И ЧЕРНЫЙ ЖИРНЫЙ БАББЛ (20px)
    ctx.save();
    ctx.translate(state.fairy.x, state.fairy.y);
    const breathe3D = 1 + Math.sin(state.fairy.time * 2.6) * 0.06;
    ctx.scale(breathe3D, breathe3D);

    const now = Date.now();
    const isStunned = now < state.fairy.stoneSlowUntil || now < state.fairy.megaSlowUntil;
    if (isStunned || state.fairy.hitFlash > 0) {
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 20;
    }

    if (state.sprites.loaded.fairy) {
      const fw = state.sprites.fairy.width / 6;
      const fh = state.sprites.fairy.height;
      let fairyFrame = 0;

      if (state.fairy.state === 'ENRAGED') {
        fairyFrame = 5;
      } else if (state.fairy.state === 'EATING') {
        fairyFrame = 2 + (Math.floor(state.fairy.time * 6) % 3);
      } else {
        fairyFrame = (Math.floor(state.fairy.time * 8) % 2 === 0) ? 0 : 1;
      }

      const fSize = state.fairy.radius * 2.6;
      ctx.drawImage(state.sprites.fairy, fairyFrame * fw, 0, fw, fh, -fSize/2, -fSize/2, fSize, fSize);
    }
    ctx.shadowBlur = 0;

    if (isStunned) {
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      const starAngle = state.fairy.time * 4;
      ctx.fillText('💫', Math.cos(starAngle) * 22, -26 + Math.sin(starAngle) * 5);
    }

    // БАББЛ РЕПЛИКИ: В 2 РАЗА БОЛЬШЕ, ЖИРНЫЙ, ЧЕРНЫЙ ТЕКСТ!
    if (state.fairy.speechTimer > 0 && state.fairy.speechText) {
      ctx.save();
      ctx.font = '900 20px -apple-system, BlinkMacSystemFont, sans-serif';
      const textW = ctx.measureText(state.fairy.speechText).width;
      const bubbleH = 34;

      // Белое облачко с толстой черной обводкой
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-textW/2 - 12, -64, textW + 24, bubbleH, 10);
      ctx.fill();
      ctx.stroke();

      // Хвостик
      ctx.beginPath();
      ctx.moveTo(-6, -30); ctx.lineTo(0, -20); ctx.lineTo(6, -30);
      ctx.fill();
      ctx.stroke();

      // ЧЕРНЫЙ ЖИРНЫЙ ТЕКСТ
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.fairy.speechText, 0, -47);
      ctx.restore();
    }

    ctx.restore();

    // 4. ПАДАЮЩИЕ СЛАДОСТИ
    state.fallingCandies.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      this.drawCandy(ctx, state, c.typeId, 22);
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 5. СНАРЯДЫ
    state.bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      this.drawCandy(ctx, state, b.type.id, b.radius);
      ctx.restore();
    });

    // 6. ОСКОЛКИ И ЧАСТИЦЫ КУБКОВ/ЗВЕЗД
    state.particles.forEach(p => {
      if (p.char) {
        // Эмодзи кубков и звезд
        ctx.save();
        ctx.font = `${p.size || 20}px sans-serif`;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.textAlign = 'center';
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      } else {
        // Обычные пиксели
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });

    // 7. ПЛАВАЮЩИЕ ТЕКСТЫ
    state.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 8. ИНДИКАТОР КОМБО
    if (state.combo > 1) {
      ctx.save();
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ff5500';
      ctx.shadowBlur = 12;
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 COMBO x${state.combo}!`, state.W / 2, state.head.y + state.head.radius + 35);
      ctx.restore();
    }

    // 9. РОГАТКА
    const sx = state.slingshot.x, sy = state.slingshot.y;

    ctx.strokeStyle = '#5a3018';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy + 30);
    ctx.lineTo(sx, sy + 5);
    ctx.lineTo(sx - 18, sy - 15);
    ctx.moveTo(sx, sy + 5);
    ctx.lineTo(sx + 18, sy - 15);
    ctx.stroke();

    if (state.slingshot.touching && state.inventory.length > 0) {
      const curType = CONFIG.CANDY_TYPES[state.inventory[state.selectedSlot]];
      const dx = sx - state.slingshot.dragX;
      const dy = sy - state.slingshot.dragY;
      const dist = Math.hypot(dx, dy);
      const power = Math.min(dist, 160) * 0.20 * curType.speedMult;
      const angle = Math.atan2(dy, dx);

      ctx.strokeStyle = curType.id === 4 ? '#ffcc00' : '#ff0055';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sx - 18, sy - 15);
      ctx.lineTo(state.slingshot.dragX, state.slingshot.dragY);
      ctx.moveTo(sx + 18, sy - 15);
      ctx.lineTo(state.slingshot.dragX, state.slingshot.dragY);
      ctx.stroke();

      ctx.save();
      ctx.translate(state.slingshot.dragX, state.slingshot.dragY);
      this.drawCandy(ctx, state, curType.id, 14);
      ctx.restore();

      let simX = sx, simY = sy;
      let simVx = Math.cos(angle) * power;
      let simVy = Math.sin(angle) * power;

      for (let step = 0; step < 14; step++) {
        simVy += 0.38 * curType.weight;
        simX += simVx;
        simY += simVy;
        if (step % 2 === 0) {
          const fade = (1 - step / 14);
          ctx.fillStyle = curType.id === 4 ? `rgba(255, 204, 0, ${fade})` : `rgba(0, 255, 204, ${fade * 0.8})`;
          ctx.beginPath();
          ctx.arc(simX, simY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 10. ЭКРАН ПАУЗЫ
    if (state.isPaused) {
      ctx.fillStyle = 'rgba(5, 2, 10, 0.75)';
      ctx.fillRect(0, 0, state.W, state.H);
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#00ffcc';
      ctx.textAlign = 'center';
      ctx.fillText('ПАУЗА ⏸', state.W / 2, state.H / 2);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('Нажми ESC или кнопку ▶️ чтобы продолжить', state.W / 2, state.H / 2 + 35);
    }

    ctx.restore();
  },

  drawCandy(ctx, state, id, radius) {
    // ОСОБАЯ ОТРИСОВКА ГИПЕР-КОНФЕТЫ (ID: 4)
    if (id === 4) {
      ctx.save();
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#fffb00';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', 0, 0);
      ctx.restore();
      return;
    }

    if (state.sprites.loaded.candies) {
      const cw = state.sprites.candies.width / 4;
      const ch = state.sprites.candies.height;
      ctx.drawImage(state.sprites.candies, id * cw, 0, cw, ch, -radius, -radius, radius * 2, radius * 2);
    }
  }
};