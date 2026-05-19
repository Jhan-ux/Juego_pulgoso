// escenario_nieve.js
function dibujarEscenarioNieve(ctx, CONFIG, bgOffset, fgOffset, LOOP_WIDTH) {
  let grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
  grad.addColorStop(0, '#e3f2fd');
  grad.addColorStop(1, '#90caf9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  // Colinas
  for (let c = 0; c < 3; c++) {
    ctx.beginPath();
    let base = CONFIG.CANVAS_HEIGHT - 24;
    ctx.moveTo(-80 + c*320 - bgOffset%320, base);
    ctx.bezierCurveTo(60 + c*320 - bgOffset%320, base-30, 200 + c*320 - bgOffset%320, base-30, 320 + c*320 - bgOffset%320, base);
    ctx.lineTo(320 + c*320 - bgOffset%320, CONFIG.CANVAS_HEIGHT);
    ctx.lineTo(-80 + c*320 - bgOffset%320, CONFIG.CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fillStyle = c%2===0 ? '#e3f2fd' : '#b3e5fc';
    ctx.fill();
  }
  // Pinos nevados
  for (let rep = -1; rep < 3; rep++) {
    for (let i = 0; i < 7; i++) {
      let x = 120 + i * 120 + rep * LOOP_WIDTH - bgOffset;
      ctx.fillStyle = '#607d8b';
      ctx.fillRect(x, CONFIG.CANVAS_HEIGHT - 70, 18, 50);
      ctx.beginPath();
      ctx.moveTo(x - 22, CONFIG.CANVAS_HEIGHT - 70);
      ctx.lineTo(x + 9, CONFIG.CANVAS_HEIGHT - 110);
      ctx.lineTo(x + 40, CONFIG.CANVAS_HEIGHT - 70);
      ctx.closePath();
      ctx.fillStyle = '#b3e5fc';
      ctx.fill();
      // Nieve sobre el árbol
      ctx.beginPath();
      ctx.arc(x + 9, CONFIG.CANVAS_HEIGHT - 100, 14, 0, Math.PI, true);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }
  // Copos de nieve animados
  for (let s = 0; s < 18; s++) {
    let sx = (performance.now()/18 + s*44) % (CONFIG.CANVAS_WIDTH+40) - 20;
    let sy = 30 + (s*17 + Math.sin(performance.now()/700 + s)*12) % (CONFIG.CANVAS_HEIGHT-40);
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx, sy, 3 + (s%3), 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Suelo nieve
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 24, CONFIG.CANVAS_WIDTH, 24);
  ctx.strokeStyle = '#90caf9';
  ctx.lineWidth = 2;
  for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, CONFIG.CANVAS_HEIGHT - 24);
    ctx.lineTo(i + 10, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }
}
