// Escenario de prueba sin obstaculos para validar el comando de salto.
function dibujarEscenarioPrueba(ctx, CONFIG, bgOffset, fgOffset, LOOP_WIDTH) {
  const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
  grad.addColorStop(0, '#dff4ff');
  grad.addColorStop(1, '#f7fbff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) {
    const x = (120 + i * 230 - bgOffset * 0.35) % (CONFIG.CANVAS_WIDTH + 120) - 80;
    const y = 42 + (i % 2) * 34;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 22, y + 4, 24, 0, Math.PI * 2);
    ctx.arc(x + 48, y + 2, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const sueloY = CONFIG.CANVAS_HEIGHT - 24;
  ctx.fillStyle = '#78c679';
  ctx.fillRect(0, sueloY, CONFIG.CANVAS_WIDTH, 24);

  ctx.strokeStyle = '#3f8f46';
  ctx.lineWidth = 2;
  for (let x = -20; x < CONFIG.CANVAS_WIDTH + 20; x += 28) {
    const offset = (fgOffset % 28);
    ctx.beginPath();
    ctx.moveTo(x - offset, sueloY);
    ctx.lineTo(x + 10 - offset, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }

  ctx.save();
  ctx.font = 'bold 18px Segoe UI, Arial';
  ctx.fillStyle = '#2f5f38';
  ctx.textAlign = 'right';
  ctx.fillText('Mapa de prueba: sin obstaculos', CONFIG.CANVAS_WIDTH - 20, 34);
  ctx.restore();
}
