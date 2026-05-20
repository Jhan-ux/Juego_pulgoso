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
// Escenario seleccionado
let escenario = localStorage.getItem('escenario') || 'oficina';
// Cargar scripts de escenario
const scripts = {
  oficina: 'js/escenario_oficina.js',
  bosque: 'js/escenario_bosque.js',
  desierto: 'js/escenario_desierto.js',
  nieve: 'js/escenario_nieve.js',
};
  if (typeof setupGestureRecognition === 'function') {
    setupGestureRecognition();
  }
if (!window[`dibujarEscenario_${escenario.charAt(0).toUpperCase() + escenario.slice(1)}`]) {
  const s = document.createElement('script');
  s.src = scripts[escenario];
  document.head.appendChild(s);
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
    if (escenario === 'oficina') {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillRect(this.x - 2, this.y + this.height - 6, this.width + 4, 8);
    } else if (escenario === 'bosque') {
      // Tronco de árbol
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y, this.width/2, Math.PI, 2*Math.PI);
      ctx.fillStyle = '#388e3c';
      ctx.fill();
    } else if (escenario === 'desierto') {
      // Cactus
      ctx.fillStyle = '#388e3c';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillRect(this.x - this.width/2, this.y + this.height/3, this.width/2, this.height/3);
      ctx.fillRect(this.x + this.width, this.y + this.height/2, this.width/2, this.height/3);
    } else if (escenario === 'nieve') {
      // Bloque de hielo
      ctx.fillStyle = '#b3e5fc';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#0288d1';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    } else {
      // Por defecto
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
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
  window.handleGesture = function(label) {
    if (label === "Salto" && !gameOver) {
      personaje.saltar();
    }
    // Puedes agregar más gestos aquí
  };
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

  // Parámetros comunes
  const bgSpeed = CONFIG.SCROLL_SPEED * 0.4;
  const fgSpeed = CONFIG.SCROLL_SPEED * 0.7;
  const t = performance.now() / 1000;
  const LOOP_WIDTH = CONFIG.CANVAS_WIDTH * 2.5;
  const bgOffset = (t * bgSpeed * 60) % LOOP_WIDTH;
  const fgOffset = (t * fgSpeed * 60) % LOOP_WIDTH;

  // Llamar a la función de escenario correspondiente
  if (typeof window[`dibujarEscenario${escenario.charAt(0).toUpperCase() + escenario.slice(1)}`] === 'function') {
    window[`dibujarEscenario${escenario.charAt(0).toUpperCase() + escenario.slice(1)}`](ctx, CONFIG, bgOffset, fgOffset, LOOP_WIDTH);
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
    init();
    const btnTMVoz = document.getElementById('btn-tm-voz');
    if (btnTMVoz && typeof initTeachableVoice === 'function') {
      btnTMVoz.addEventListener('click', function() {
        initTeachableVoice();
        btnTMVoz.disabled = true;
        btnTMVoz.textContent = 'Voz TM activada';
      });
    }
  });
};
