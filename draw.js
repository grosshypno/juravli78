// =============================================================================
// РЕНДЕРИНГ (CANVAS)
// =============================================================================
window.Renderer = {
  render(ctx, state) {
    ctx.save();
    if (state.screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
    }
    ctx.clearRect(0, 0, state.W, state.H);

    const R = state.head.radius;

    // 1. ТЫКВА (ГОЛОВА)
    ctx.save();
    ctx.translate(state.head.x, state.head.y);

    let frameIdx = 0;
    if (state.head.hitTimer > 0) frameIdx = 2;
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

    // 2. ЗУБЫ (СТРОГО ПО КОНФИГУ)
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

    // 3. ФЕЯ (3D ЭФФЕКТ + ВИЗУАЛЬНЫЙ СТАН)
    ctx.save();
    ctx.translate(state.fairy.x, state.fairy.y);
    const breathe3D = 1 + Math.sin(state.fairy.time * 2.6) * 0.06;
    ctx.scale(breathe3D, breathe3D);

    // Свечение стана
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
    ctx.shadowBlur = 0; // Сброс свечения

    // Звездочки стана над феей
    if (isStunned) {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      const starAngle = state.fairy.time * 4;
      ctx.fillText('💫', Math.cos(starAngle) * 22, -26 + Math.sin(starAngle) * 5);
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

    // 6. ОСКОЛКИ
    state.particles.forEach(p => {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // 7. ТЕКСТЫ (ОЧКИ/СТАНЫ)
    state.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 8. РОГАТКА И ПРИЦЕЛ
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

      ctx.strokeStyle = '#ff0055';
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

      // Тонкая траектория
      let simX = sx, simY = sy;
      let simVx = Math.cos(angle) * power;
      let simVy = Math.sin(angle) * power;

      for (let step = 0; step < 14; step++) {
        simVy += 0.38 * curType.weight;
        simX += simVx;
        simY += simVy;
        if (step % 2 === 0) {
          const fade = (1 - step / 14);
          ctx.fillStyle = `rgba(0, 255, 204, ${fade * 0.8})`;
          ctx.beginPath();
          ctx.arc(simX, simY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  },

  drawCandy(ctx, state, id, radius) {
    if (state.sprites.loaded.candies) {
      const cw = state.sprites.candies.width / 4;
      const ch = state.sprites.candies.height;
      ctx.drawImage(state.sprites.candies, id * cw, 0, cw, ch, -radius, -radius, radius * 2, radius * 2);
    }
  }
};