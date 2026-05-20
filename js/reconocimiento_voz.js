// Reconocimiento de voz nativo del navegador, optimizado para baja latencia.
let reconocimientoVoz = null;
let vozActiva = false;
let vozIniciada = false;
let ultimoSaltoVoz = 0;

const VOICE_JUMP_COOLDOWN_MS = 650;
const COMANDOS_SALTO = [
  'salta',
  'saltar',
  'salto',
  'alta',
  'jump'
];

function getVoiceElements() {
  return {
    box: document.getElementById('voice-status'),
    state: document.getElementById('voice-state'),
    heard: document.getElementById('voice-heard'),
    command: document.getElementById('voice-command'),
    button: document.getElementById('btn-voz')
  };
}

function actualizarPanelVoz(tipo, estado, escuchado, comando) {
  const ui = getVoiceElements();

  if (ui.state && estado) ui.state.textContent = estado;
  if (ui.heard && typeof escuchado === 'string') ui.heard.textContent = escuchado || '-';
  if (ui.command && comando) ui.command.textContent = comando;

  if (ui.box) {
    ui.box.classList.remove('is-listening', 'is-detected', 'is-error');
    if (tipo) ui.box.classList.add(tipo);
  }
}

function normalizarTextoVoz(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function esComandoSalto(texto) {
  const normalizado = normalizarTextoVoz(texto);
  if (!normalizado) return false;

  const palabras = normalizado.split(' ');
  return COMANDOS_SALTO.some(comando => {
    if (comando.length <= 4) {
      return palabras.includes(comando);
    }

    return normalizado.includes(comando) || palabras.some(palabra => palabra.startsWith(comando));
  });
}

function ejecutarSaltoPorVoz(textoDetectado) {
  const ahora = performance.now();
  if (ahora - ultimoSaltoVoz < VOICE_JUMP_COOLDOWN_MS) {
    return;
  }

  ultimoSaltoVoz = ahora;
  actualizarPanelVoz('is-detected', 'comando detectado', textoDetectado, 'SALTA detectado');

  if (typeof window.handleVoiceJump === 'function') {
    window.handleVoiceJump();
  } else if (typeof window.handleGesture === 'function') {
    window.handleGesture('Salto');
  }

  window.setTimeout(() => {
    if (vozActiva) {
      actualizarPanelVoz('is-listening', 'escuchando', textoDetectado, 'esperando "salta"');
    }
  }, 350);
}

function iniciarReconocimientoVoz() {
  if (!reconocimientoVoz || vozIniciada) {
    return;
  }

  try {
    reconocimientoVoz.start();
    vozIniciada = true;
  } catch (error) {
    if (error.name !== 'InvalidStateError') {
      actualizarPanelVoz('is-error', 'error al iniciar', '-', error.message);
    }
  }
}

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ui = getVoiceElements();

  if (!SpeechRecognition) {
    if (ui.button) {
      ui.button.disabled = true;
      ui.button.textContent = 'Voz no disponible';
    }
    actualizarPanelVoz('is-error', 'no disponible', '-', 'usa Chrome o Edge');
    alert('Tu navegador no soporta comandos de voz. Prueba con Chrome o Edge.');
    return;
  }

  if (vozActiva) {
    actualizarPanelVoz('is-listening', 'escuchando', ui.heard ? ui.heard.textContent : '-', 'esperando "salta"');
    return;
  }

  reconocimientoVoz = new SpeechRecognition();
  reconocimientoVoz.lang = 'es-ES';
  reconocimientoVoz.continuous = true;
  reconocimientoVoz.interimResults = true;
  reconocimientoVoz.maxAlternatives = 5;

  reconocimientoVoz.onstart = function() {
    vozIniciada = true;
    actualizarPanelVoz('is-listening', 'escuchando', '-', 'esperando "salta"');
  };

  reconocimientoVoz.onresult = function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const resultado = event.results[i];
      const alternativas = Array.from(resultado).map(alternativa => alternativa.transcript);
      const texto = alternativas.join(' / ');

      actualizarPanelVoz('is-listening', resultado.isFinal ? 'frase recibida' : 'escuchando...', texto, 'analizando');

      if (alternativas.some(esComandoSalto)) {
        ejecutarSaltoPorVoz(texto);
        break;
      }
    }
  };

  reconocimientoVoz.onspeechstart = function() {
    actualizarPanelVoz('is-listening', 'detectando voz', '', 'habla claro: "salta"');
  };

  reconocimientoVoz.onspeechend = function() {
    if (vozActiva) {
      const heard = getVoiceElements().heard;
      actualizarPanelVoz('is-listening', 'escuchando', heard ? heard.textContent : '-', 'esperando "salta"');
    }
  };

  reconocimientoVoz.onend = function() {
    vozIniciada = false;
    if (vozActiva) {
      window.setTimeout(iniciarReconocimientoVoz, 120);
    }
  };

  reconocimientoVoz.onerror = function(event) {
    vozIniciada = false;

    if (event.error === 'no-speech') {
      actualizarPanelVoz('is-listening', 'escuchando', '-', 'no escuche nada, di "salta"');
      return;
    }

    if (event.error === 'aborted') {
      return;
    }

    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      vozActiva = false;
      if (ui.button) {
        ui.button.disabled = false;
        ui.button.textContent = 'Activar voz';
      }
      actualizarPanelVoz('is-error', 'permiso bloqueado', '-', 'permite el microfono');
      return;
    }

    actualizarPanelVoz('is-error', 'error', '-', event.error);
  };

  vozActiva = true;
  ultimoSaltoVoz = 0;

  if (ui.button) {
    ui.button.disabled = true;
    ui.button.textContent = 'Voz activada: di "salta"';
  }

  iniciarReconocimientoVoz();
}
