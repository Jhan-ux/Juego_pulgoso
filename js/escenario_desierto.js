// escenario_desierto.js
function dibujarEscenarioDesierto(ctx, CONFIG, bgOffset, fgOffset, LOOP_WIDTH) {
  let grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
  grad.addColorStop(0, '#ffe082');
  grad.addColorStop(1, '#fbc02d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  // Dunas
  for (let d = 0; d < 4; d++) {
    ctx.beginPath();
    let base = CONFIG.CANVAS_HEIGHT - 24;
    ctx.moveTo(-60 + d*220 - bgOffset%220, base);
    ctx.bezierCurveTo(40 + d*220 - bgOffset%220, base-18, 160 + d*220 - bgOffset%220, base-18, 220 + d*220 - bgOffset%220, base);
    ctx.lineTo(220 + d*220 - bgOffset%220, CONFIG.CANVAS_HEIGHT);
    ctx.lineTo(-60 + d*220 - bgOffset%220, CONFIG.CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fillStyle = d%2===0 ? '#ffe082' : '#ffd54f';
    ctx.fill();
  }
  // Cactus
  for (let rep = -1; rep < 3; rep++) {
    for (let i = 0; i < 7; i++) {
      let x = 120 + i * 140 + rep * LOOP_WIDTH - bgOffset;
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(x, CONFIG.CANVAS_HEIGHT - 70, 16, 46);
      ctx.fillRect(x - 8, CONFIG.CANVAS_HEIGHT - 54, 12, 10);
      ctx.fillRect(x + 12, CONFIG.CANVAS_HEIGHT - 44, 8, 8);
      // Piedras
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#bcaaa4';
      ctx.beginPath();
      ctx.ellipse(x + 30, CONFIG.CANVAS_HEIGHT - 18, 10, 5, Math.PI/6, 0, Math.PI*2);
      ctx.ellipse(x - 20, CONFIG.CANVAS_HEIGHT - 14, 7, 4, -Math.PI/8, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }
  // Nubes animadas
  for (let n = 0; n < 3; n++) {
    let nx = (performance.now()/30 + n*200) % (CONFIG.CANVAS_WIDTH+100) - 50;
    let ny = 40 + n*18 + Math.sin(performance.now()/900 + n)*6;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(nx, ny, 24, 0, Math.PI*2);
    ctx.arc(nx+22, ny+6, 18, 0, Math.PI*2);
    ctx.arc(nx-18, ny+8, 14, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Suelo arena
  ctx.fillStyle = '#ffe082';
  ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 24, CONFIG.CANVAS_WIDTH, 24);
  ctx.strokeStyle = '#bfa040';
  ctx.lineWidth = 2;
  for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, CONFIG.CANVAS_HEIGHT - 24);
    ctx.lineTo(i + 10, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }
}
