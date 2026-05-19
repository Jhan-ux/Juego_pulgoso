// escenario_bosque.js
function dibujarEscenarioBosque(ctx, CONFIG, bgOffset, fgOffset, LOOP_WIDTH) {
  let grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
  grad.addColorStop(0, '#b2dfdb');
  grad.addColorStop(1, '#388e3c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  // Árboles
  for (let rep = -1; rep < 3; rep++) {
    for (let i = 0; i < 8; i++) {
      let x = 100 + i * 120 + rep * LOOP_WIDTH - bgOffset;
      ctx.fillStyle = '#795548';
      ctx.fillRect(x, CONFIG.CANVAS_HEIGHT - 90, 18, 66);
      ctx.beginPath();
      ctx.arc(x + 9, CONFIG.CANVAS_HEIGHT - 90, 38, 0, Math.PI * 2);
      ctx.fillStyle = '#388e3c';
      ctx.fill();
      // Arbustos
      ctx.beginPath();
      ctx.arc(x - 30, CONFIG.CANVAS_HEIGHT - 24, 24, 0, Math.PI * 2);
      ctx.arc(x + 40, CONFIG.CANVAS_HEIGHT - 18, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#43a047';
      ctx.fill();
      // Flores
      for (let f = 0; f < 3; f++) {
        let fx = x + (f-1)*18;
        let fy = CONFIG.CANVAS_HEIGHT - 24 + Math.sin(performance.now()/300 + f + i)*2;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(Math.sin(performance.now()/400 + f + i));
        ctx.fillStyle = ['#fff176','#e57373','#ba68c8'][f%3];
        for (let p = 0; p < 5; p++) {
          ctx.beginPath();
          ctx.ellipse(0, 6, 3, 8, (Math.PI*2/5)*p, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0,0,3,0,Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
      }
      // Mariposas animadas
      let bx = x + Math.sin(performance.now()/500 + i)*30;
      let by = CONFIG.CANVAS_HEIGHT - 120 + Math.cos(performance.now()/700 + i)*10;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(performance.now()/200 + i)*0.3);
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.bezierCurveTo(-12,-8,-18,8,0,6);
      ctx.bezierCurveTo(18,8,12,-8,0,0);
      ctx.fillStyle = i%2===0 ? '#ffb300' : '#64b5f6';
      ctx.fill();
      ctx.restore();
    }
  }
  // Suelo pasto
  ctx.fillStyle = '#689f38';
  ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 24, CONFIG.CANVAS_WIDTH, 24);
  ctx.strokeStyle = '#33691e';
  ctx.lineWidth = 2;
  for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, CONFIG.CANVAS_HEIGHT - 24);
    ctx.lineTo(i + 12, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }
}
