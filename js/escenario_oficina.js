// escenario_oficina.js
function dibujarEscenarioOficina(ctx, CONFIG, bgOffset, fgOffset, LOOP_WIDTH) {
  // Fondo degradado
  let grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
  grad.addColorStop(0, '#e6e9ef');
  grad.addColorStop(1, '#cfd8dc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  // Elementos de fondo y escritorios
  const fondoElementos = [
    ['ventana', 120, 40, 90, 50],
    ['ventana', 420, 40, 90, 50],
    ['ventana', 800, 40, 90, 50],
    ['cuadro', 250, 60, 38, 38, '#ffe082'],
    ['cuadro', 950, 60, 38, 38, '#b2dfdb'],
    ['reloj', 600, 60, 32, 32],
    ['planta', 350, CONFIG.CANVAS_HEIGHT - 60, 24, 38],
    ['planta', 1100, CONFIG.CANVAS_HEIGHT - 60, 24, 38],
    ['archivero', 700, CONFIG.CANVAS_HEIGHT - 60, 38, 38],
    ['archivero', 1300, CONFIG.CANVAS_HEIGHT - 60, 38, 38],
    ['caja', 1500, CONFIG.CANVAS_HEIGHT - 40, 32, 22],
    ['caja', 400, CONFIG.CANVAS_HEIGHT - 40, 32, 22],
  ];
  for (let rep = -1; rep < 3; rep++) {
    for (let elem of fondoElementos) {
      let [tipo, ex, ey, ew, eh, colorExtra] = elem;
      let x = ex + rep * LOOP_WIDTH - bgOffset;
      if (tipo === 'ventana') {
        ctx.fillStyle = '#b3e5fc';
        ctx.fillRect(x, ey, ew, eh);
        ctx.strokeStyle = '#90caf9';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, ey, ew, eh);
      } else if (tipo === 'cuadro') {
        ctx.fillStyle = colorExtra || '#ffe082';
        ctx.fillRect(x, ey, ew, eh);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(x, ey, ew, eh);
      } else if (tipo === 'reloj') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + ew/2, ey + eh/2, ew/2, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#bdbdbd';
        ctx.stroke();
        ctx.save();
        ctx.translate(x + ew/2, ey + eh/2);
        ctx.rotate(Math.PI/2 + Math.sin(performance.now()/2)*0.2);
        ctx.strokeStyle = '#607d8b';
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-ew/2+4); ctx.stroke();
        ctx.rotate(Math.PI/2);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-ew/3+2); ctx.stroke();
        ctx.restore();
        ctx.restore();
      } else if (tipo === 'planta') {
        ctx.save();
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.ellipse(x+ew/2, ey+eh-8, ew/2, eh/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#795548';
        ctx.fillRect(x+ew/2-4, ey+eh-8, 8, 12);
        ctx.restore();
      } else if (tipo === 'archivero') {
        ctx.fillStyle = '#90a4ae';
        ctx.fillRect(x, ey, ew, eh);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x+6, ey+8, ew-12, 8);
        ctx.fillRect(x+6, ey+eh-16, ew-12, 8);
        ctx.strokeStyle = '#607d8b';
        ctx.strokeRect(x, ey, ew, eh);
      } else if (tipo === 'caja') {
        ctx.fillStyle = '#ffe082';
        ctx.fillRect(x, ey, ew, eh);
        ctx.strokeStyle = '#bfa040';
        ctx.strokeRect(x, ey, ew, eh);
      }
    }
  }
  // Escritorios y objetos
  const escritorios = [
    [60, 'normal'], [400, 'conLaptop'], [800, 'conTaza'], [1200, 'doble'], [1600, 'normal'], [2000, 'conPlanta'],
  ];
  for (let rep = -1; rep < 2; rep++) {
    for (let i = 0; i < escritorios.length; i++) {
      let [ex, tipo] = escritorios[i];
      let x = ex + rep * LOOP_WIDTH - fgOffset;
      ctx.fillStyle = '#a1887f';
      ctx.fillRect(x, CONFIG.CANVAS_HEIGHT - 80, 160, 18);
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(x + 10, CONFIG.CANVAS_HEIGHT - 62, 10, 38);
      ctx.fillRect(x + 140, CONFIG.CANVAS_HEIGHT - 62, 10, 38);
      ctx.fillStyle = i%2===0 ? '#607d8b' : '#8d6e63';
      ctx.fillRect(x + 70, CONFIG.CANVAS_HEIGHT - 50, 28, 28);
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x + 80, CONFIG.CANVAS_HEIGHT - 22, 8, 12);
      if (tipo === 'normal') {
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 40, CONFIG.CANVAS_HEIGHT - 110, 38, 28);
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + 44, CONFIG.CANVAS_HEIGHT - 106, 30, 20);
      } else if (tipo === 'conLaptop') {
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(x + 60, CONFIG.CANVAS_HEIGHT - 100, 38, 16);
        ctx.fillStyle = '#757575';
        ctx.fillRect(x + 60, CONFIG.CANVAS_HEIGHT - 100, 38, 4);
      } else if (tipo === 'conTaza') {
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 40, CONFIG.CANVAS_HEIGHT - 110, 38, 28);
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + 44, CONFIG.CANVAS_HEIGHT - 106, 30, 20);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + 100, CONFIG.CANVAS_HEIGHT - 100, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#bdbdbd';
        ctx.stroke();
      } else if (tipo === 'doble') {
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 30, CONFIG.CANVAS_HEIGHT - 110, 38, 28);
        ctx.fillRect(x + 90, CONFIG.CANVAS_HEIGHT - 110, 38, 28);
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + 34, CONFIG.CANVAS_HEIGHT - 106, 30, 20);
        ctx.fillRect(x + 94, CONFIG.CANVAS_HEIGHT - 106, 30, 20);
      } else if (tipo === 'conPlanta') {
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 40, CONFIG.CANVAS_HEIGHT - 110, 38, 28);
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + 44, CONFIG.CANVAS_HEIGHT - 106, 30, 20);
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(x + 120, CONFIG.CANVAS_HEIGHT - 90, 10, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.save();
      ctx.translate(x + 120, CONFIG.CANVAS_HEIGHT - 80);
      ctx.rotate(-0.3);
      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.arc(0, -18, 8, 0, Math.PI, true);
      ctx.fill();
      ctx.restore();
    }
  }
  // Papeles flotando
  for (let i = 0; i < 12; i++) {
    let px = ((performance.now() / (1.5 + i) + i * 220) - fgOffset * 1.2) % LOOP_WIDTH;
    let py = 100 + Math.sin(performance.now() / 600 + i) * 18 + (i % 4) * 18;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(performance.now() / 800 + i) * 0.2);
    ctx.fillStyle = i%2===0 ? '#fffde7' : '#ffe082';
    ctx.fillRect(-10, -7, 20, 14);
    ctx.strokeStyle = '#ffe082';
    ctx.strokeRect(-10, -7, 20, 14);
    ctx.restore();
  }
  // Suelo tipo alfombra
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 24, CONFIG.CANVAS_WIDTH, 24);
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 1;
  for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, CONFIG.CANVAS_HEIGHT - 24);
    ctx.lineTo(i + 8, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }
}
