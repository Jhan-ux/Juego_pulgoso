// game.js
// Juego Endless Runner estilo Dinosaurio de Chrome
// Estructura: Configuración, Inicialización, Input, Update, Draw

// ===================== CONFIGURACIÓN Y VARIABLES =====================

// Variables globales
let canvas, ctx;
let personaje;
let obstaculos = [];
let score = 0;
let gameOver = false;
let started = false;
let lastObstacleX = 0;
let images = {};

// ========== TEACHABLE MACHINE INTEGRACIÓN WEBCAM ==========
const TM_URL = "assets/model/"; // Cambia si tu modelo está en otra ruta
let tmModel, tmWebcam, tmMaxPredictions;
let tmReady = false;
let lastGesture = "";

async function initTeachableMachine() {
  // Carga el modelo y la metadata
  tmModel = await tmImage.load(TM_URL + "model.json", TM_URL + "metadata.json");
  tmMaxPredictions = tmModel.getTotalClasses();
  // Inicializa la webcam
  tmWebcam = new tmImage.Webcam(200, 200, true); // ancho, alto, espejo
  await tmWebcam.setup();
  await tmWebcam.play();
  window.requestAnimationFrame(loopTeachableMachine);
  tmReady = true;
  // Mostrar la webcam en pantalla y adaptarla en móvil
  document.body.appendChild(tmWebcam.canvas);
  tmWebcam.canvas.style.position = "absolute";
  tmWebcam.canvas.style.top = "10px";
  tmWebcam.canvas.style.right = "10px";
  tmWebcam.canvas.style.zIndex = 1000;
  if (window.innerWidth < 600) {
    tmWebcam.canvas.style.width = '120px';
    tmWebcam.canvas.style.height = '120px';
    tmWebcam.canvas.style.left = 'auto';
    tmWebcam.canvas.style.right = '10px';
    tmWebcam.canvas.style.top = '10px';
  } else {
    tmWebcam.canvas.style.width = '200px';
    tmWebcam.canvas.style.height = '200px';
  }
}

async function loopTeachableMachine() {
  if (tmReady) {
    await tmWebcam.update();
    await predictGesture();
    window.requestAnimationFrame(loopTeachableMachine);
  }
}

async function predictGesture() {
  const prediction = await tmModel.predict(tmWebcam.canvas);
  // Busca la clase con mayor probabilidad
  let maxProb = 0;
  let maxClass = "";
  for (let i = 0; i < prediction.length; i++) {
    if (prediction[i].probability > maxProb) {
      maxProb = prediction[i].probability;
      maxClass = prediction[i].className;
    }
  }
  lastGesture = maxClass;
  // Ejemplo: si el gesto detectado es "saltar", ejecuta el salto
  if (lastGesture === "saltar" && personaje && personaje.enSuelo && started && !gameOver) {
    personaje.saltar();
  }
  // Puedes agregar más gestos y acciones aquí
}

const CONFIG = {
  GRAVEDAD: 0.7, // Fuerza de gravedad (px/frame^2)
  FUERZA_SALTO: 13, // Velocidad inicial de salto (px/frame)
  SCROLL_SPEED: 7, // Velocidad de desplazamiento de obstáculos (px/frame)
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 300,
  PERSONAJE: {
    x: 80, // Posición fija en X
    y: 0, // Se calcula en init
    width: 60, // Escala de ancho
    height: 70 // Escala de alto
  },
  OBSTACULO: {
    minWidth: 18,
    maxWidth: 32,
    minHeight: 50,
    maxHeight: 90,
    minGap: 220,
    maxGap: 420
  }
};

// ===================== CLASES =====================

class Personaje {
  constructor(config) {
    this.x = config.x;
    this.y = CONFIG.CANVAS_HEIGHT - config.height - 24; // 24px suelo
    this.width = config.width;
    this.height = config.height;
    this.vy = 0; // Velocidad vertical
    this.enSuelo = true;
    this.estado = 'estatico'; // 'estatico', 'corriendo', 'saltando'
    // Variables para animación de pasos
    this.animFrame = 0;
    this.animTimer = 0;
    this.animInterval = 120; // ms entre frames (ajustable para velocidad de paso)
    this.lastAnimTime = performance.now();
  }

  saltar() {
    if (this.enSuelo) {
      this.vy = -CONFIG.FUERZA_SALTO;
      this.enSuelo = false;
      this.estado = 'saltando';
    }
  }

  actualizar() {
    // Física: aplicar gravedad
    this.y += this.vy;
    this.vy += CONFIG.GRAVEDAD;

    // Suelo
    const suelo = CONFIG.CANVAS_HEIGHT - this.height - 24;
    if (this.y >= suelo) {
      this.y = suelo;
      this.vy = 0;
      this.enSuelo = true;
      this.estado = started ? 'corriendo' : 'estatico';
    } else {
      this.enSuelo = false;
      this.estado = 'saltando';
    }
  }

  dibujar(ctx) {
    ctx.save();
    let img = images['estatico'];
    // Animación de correr
    if (this.estado === 'corriendo') {
      // Alterna entre corriendo y estatico para simular pasos
      let now = performance.now();
      if (now - this.lastAnimTime > this.animInterval) {
        this.animFrame = (this.animFrame + 1) % 2;
        this.lastAnimTime = now;
      }
      img = this.animFrame === 0 ? images['corriendo'] : images['estatico'];
    } else if (this.estado === 'saltando') {
      img = images['saltando'];
    } else {
      img = images['estatico'];
    }
    if (img && img.complete) {
      ctx.drawImage(img, this.x, this.y, this.width, this.height);
    } else {
      // Fallback: rectángulo azul si no carga la imagen
      ctx.fillStyle = '#1976d2';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }

  getAABB() {
    // Devuelve el rectángulo de colisión
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

class Obstaculo {
  constructor(x) {
    this.width = randInt(CONFIG.OBSTACULO.minWidth, CONFIG.OBSTACULO.maxWidth);
    this.height = randInt(CONFIG.OBSTACULO.minHeight, CONFIG.OBSTACULO.maxHeight);
    this.x = x;
    this.y = CONFIG.CANVAS_HEIGHT - this.height - 24;
    this.color = '#535353';
  }

  actualizar() {
    this.x -= CONFIG.SCROLL_SPEED;
  }

  dibujar(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Opcional: base más ancha
    ctx.fillRect(this.x - 2, this.y + this.height - 6, this.width + 4, 8);
  }

  getAABB() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// ===================== INICIALIZACIÓN =====================
function cargarImagenes(callback) {
  let cargadas = 0;
  const nombres = ['estatico', 'corriendo', 'saltando'];
  nombres.forEach(nombre => {
    const img = new window.Image();
    img.src = `assets/${nombre}.png`;
    img.onload = () => {
      cargadas++;
      if (cargadas === nombres.length) callback();
    };
    images[nombre] = img;
  });
}

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = CONFIG.CANVAS_WIDTH;
  canvas.height = CONFIG.CANVAS_HEIGHT;
  personaje = new Personaje(CONFIG.PERSONAJE);
  obstaculos = [];
  score = 0;
  gameOver = false;
  started = false;
  lastObstacleX = CONFIG.CANVAS_WIDTH;
  dibujarPantallaInicio();
}

// ===================== INPUT HANDLER =====================
document.addEventListener('keydown', function(e) {
  if ((e.code === 'Space' || e.code === 'ArrowUp')) {
    if (!started) {
      started = true;
      gameOver = false;
      score = 0;
      obstaculos = [];
      personaje = new Personaje(CONFIG.PERSONAJE);
      lastObstacleX = CONFIG.CANVAS_WIDTH;
      loop();
    } else if (!gameOver) {
      personaje.saltar();
    } else if (gameOver) {
      init();
    }
  }
});

// ===================== GAME LOOP =====================
function loop() {
  if (!gameOver) {
    actualizar();
    dibujar();
    requestAnimationFrame(loop);
  }
}

// ===================== UPDATE (FÍSICA Y LÓGICA) =====================
function actualizar() {
  personaje.actualizar();

  // Obstáculos
  if (started) {
    // Generar nuevo obstáculo si es necesario
    if (
      obstaculos.length === 0 ||
      CONFIG.CANVAS_WIDTH - lastObstacleX > randInt(CONFIG.OBSTACULO.minGap, CONFIG.OBSTACULO.maxGap)
    ) {
      obstaculos.push(new Obstaculo(CONFIG.CANVAS_WIDTH + 10));
      lastObstacleX = CONFIG.CANVAS_WIDTH + 10;
    }
  }

  // Actualizar y filtrar obstáculos
  obstaculos.forEach(ob => ob.actualizar());
  obstaculos = obstaculos.filter(ob => ob.x + ob.width > 0);

  // Colisiones
  for (let ob of obstaculos) {
    if (checkAABB(personaje.getAABB(), ob.getAABB())) {
      gameOver = true;
      break;
    }
  }

  // Score
  if (started && !gameOver) {
    score += 0.1; // Incremento progresivo
  }
}

// ===================== DRAW (RENDERIZADO) =====================
function dibujar() {
  // Limpiar canvas
  ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);


  // === Fondo tipo oficina en movimiento y más extenso ===
  // Parallax y bucle más largo
  const bgSpeed = CONFIG.SCROLL_SPEED * 0.4;
  const fgSpeed = CONFIG.SCROLL_SPEED * 0.7;
  const t = performance.now() / 1000;
  // El fondo se repite cada 2.5 veces el ancho del canvas
  const LOOP_WIDTH = CONFIG.CANVAS_WIDTH * 2.5;
  const bgOffset = (t * bgSpeed * 60) % LOOP_WIDTH;
  const fgOffset = (t * fgSpeed * 60) % LOOP_WIDTH;

  // Pared
  let grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
  grad.addColorStop(0, '#e6e9ef');
  grad.addColorStop(1, '#cfd8dc');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

  // --- Elementos de fondo (ventanas, cuadros, reloj, plantas, archiveros) ---
  const fondoElementos = [
    // [tipo, x, y, ancho, alto, colorExtra]
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
        // Manecillas
        ctx.save();
        ctx.translate(x + ew/2, ey + eh/2);
        ctx.rotate(Math.PI/2 + Math.sin(t/2)*0.2);
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

  // --- Escritorios y objetos de primer plano (más variados y bucle largo) ---
  const escritorios = [
    // [x, tipo, detalles...]
    [60, 'normal'],
    [400, 'conLaptop'],
    [800, 'conTaza'],
    [1200, 'doble'],
    [1600, 'normal'],
    [2000, 'conPlanta'],
  ];
  for (let rep = -1; rep < 2; rep++) {
    for (let i = 0; i < escritorios.length; i++) {
      let [ex, tipo] = escritorios[i];
      let x = ex + rep * LOOP_WIDTH - fgOffset;
      // Base escritorio
      ctx.fillStyle = '#a1887f';
      ctx.fillRect(x, CONFIG.CANVAS_HEIGHT - 80, 160, 18);
      // Patas
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(x + 10, CONFIG.CANVAS_HEIGHT - 62, 10, 38);
      ctx.fillRect(x + 140, CONFIG.CANVAS_HEIGHT - 62, 10, 38);
      // Silla
      ctx.fillStyle = i%2===0 ? '#607d8b' : '#8d6e63';
      ctx.fillRect(x + 70, CONFIG.CANVAS_HEIGHT - 50, 28, 28);
      ctx.fillStyle = '#455a64';
      ctx.fillRect(x + 80, CONFIG.CANVAS_HEIGHT - 22, 8, 12);
      // Objetos sobre escritorio
      if (tipo === 'normal') {
        // Monitor
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
        // Taza
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + 100, CONFIG.CANVAS_HEIGHT - 100, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#bdbdbd';
        ctx.stroke();
      } else if (tipo === 'doble') {
        // Dos monitores
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
        // Planta pequeña
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(x + 120, CONFIG.CANVAS_HEIGHT - 90, 10, 0, Math.PI*2);
        ctx.fill();
      }
      // Lámpara
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

  // Papeles flotando (animados y desplazados, bucle largo)
  for (let i = 0; i < 8; i++) {
    let px = ((performance.now() / (2 + i) + i * 320) - fgOffset * 1.2) % LOOP_WIDTH;
    let py = 120 + Math.sin(performance.now() / 600 + i) * 10 + (i % 4) * 18;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(performance.now() / 800 + i) * 0.2);
    ctx.fillStyle = '#fffde7';
    ctx.fillRect(-10, -7, 20, 14);
    ctx.strokeStyle = '#ffe082';
    ctx.strokeRect(-10, -7, 20, 14);
    ctx.restore();
  }

  // Suelo tipo alfombra
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 24, CONFIG.CANVAS_WIDTH, 24);
  // Textura de alfombra (líneas)
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 1;
  for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, CONFIG.CANVAS_HEIGHT - 24);
    ctx.lineTo(i + 8, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Obstáculos
  obstaculos.forEach(ob => ob.dibujar(ctx));

  // Personaje
  personaje.dibujar(ctx);

  // Score
  ctx.save();
  ctx.font = 'bold 32px Segoe UI, Arial';
  ctx.fillStyle = '#535353';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE: ' + Math.floor(score), 24, 48);
  ctx.restore();

  // Game Over
  if (gameOver) {
    ctx.save();
    ctx.font = 'bold 48px Segoe UI, Arial';
    ctx.fillStyle = '#d32f2f';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 - 20);
    ctx.font = '24px Segoe UI, Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('Presiona ESPACIO para reiniciar', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 24);
    ctx.restore();
  }
}

function dibujarPantallaInicio() {
  ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  // Suelo
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 24, CONFIG.CANVAS_WIDTH, 24);
  // Personaje
  personaje.estado = 'estatico';
  personaje.dibujar(ctx);
  // Texto
  ctx.save();
  ctx.font = 'bold 44px Segoe UI, Arial';
  ctx.fillStyle = '#535353';
  ctx.textAlign = 'center';
  ctx.fillText('Juego Pulgoso', CONFIG.CANVAS_WIDTH / 2, 90);
  ctx.font = '24px Segoe UI, Arial';
  ctx.fillStyle = '#888';
  ctx.fillText('Presiona ESPACIO o ↑ para iniciar', CONFIG.CANVAS_WIDTH / 2, 140);
  ctx.restore();
}

// ===================== UTILIDADES =====================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkAABB(a, b) {
  // Algoritmo de colisión AABB (Axis-Aligned Bounding Box)
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ===================== INICIO =====================
window.onload = function() {
  cargarImagenes(() => {
    ajustarCanvas();
    window.addEventListener('resize', ajustarCanvas);
    initPantallaInicioTouch();
  });
};

function initPantallaInicioTouch() {
  // Mostrar mensaje de inicio
  const hint = document.getElementById('hint-text');
  if (hint) hint.innerHTML = 'Toca la pantalla para empezar y activar la cámara.';
  const canvasEl = document.getElementById('game-canvas');
  const container = document.getElementById('game-container');
  // Soporte táctil y click
  if (canvasEl) {
    canvasEl.addEventListener('touchstart', primerTouch, {passive: false});
    canvasEl.addEventListener('click', primerTouch, {passive: false});
  }
  if (container) {
    container.addEventListener('touchstart', primerTouch, {passive: false});
    container.addEventListener('click', primerTouch, {passive: false});
  }
}

let juegoIniciado = false;
function primerTouch(e) {
  if (e) e.preventDefault();
  if (!juegoIniciado) {
    juegoIniciado = true;
    // Iniciar juego y cámara
    init();
    initTeachableMachine();
    // Cambiar mensaje y ocultar descripción móvil
    const hint = document.getElementById('hint-text');
    if (hint) hint.innerHTML = 'Toca para saltar. Usa gestos frente a la cámara.';
    const desc = document.getElementById('mobile-desc');
    if (desc) desc.style.display = 'none';
  } else {
    // Saltar si el juego ya está iniciado
    if (!gameOver && personaje && personaje.enSuelo) {
      personaje.saltar();
    } else if (gameOver) {
      init();
    }
  }
}

function ajustarCanvas() {
  const w = Math.min(window.innerWidth * 0.98, 800);
  const h = Math.min(window.innerHeight * 0.45, 300);
  canvas = document.getElementById('game-canvas');
  canvas.width = w;
  canvas.height = h;
  if (typeof CONFIG !== 'undefined') {
    CONFIG.CANVAS_WIDTH = w;
    CONFIG.CANVAS_HEIGHT = h;
  }
}

function handleTouch(e) {
  e.preventDefault();
  if (!started) {
    started = true;
    gameOver = false;
    score = 0;
    obstaculos = [];
    personaje = new Personaje(CONFIG.PERSONAJE);
    lastObstacleX = CONFIG.CANVAS_WIDTH;
    loop();
  } else if (!gameOver) {
    personaje.saltar();
  } else if (gameOver) {
    init();
  }
}
