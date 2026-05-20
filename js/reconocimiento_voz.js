// Reconocimiento de voz nativo del navegador.
let reconocimientoVoz = null;
let vozActiva = false;

function esComandoSalto(texto) {
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  return normalizado.includes('salta') || normalizado.includes('saltar');
}

function ejecutarSaltoPorVoz() {
  if (typeof window.handleVoiceJump === 'function') {
    window.handleVoiceJump();
    return;
  }

  if (typeof window.handleGesture === 'function') {
    window.handleGesture('Salto');
  }
}

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btnVoz = document.getElementById('btn-voz');

  if (!SpeechRecognition) {
    if (btnVoz) {
      btnVoz.disabled = true;
      btnVoz.textContent = 'Voz no disponible';
    }
    alert('Tu navegador no soporta comandos de voz. Prueba con Chrome o Edge.');
    return;
  }

  reconocimientoVoz = new SpeechRecognition();
  reconocimientoVoz.lang = 'es-PE';
  reconocimientoVoz.continuous = true;
  reconocimientoVoz.interimResults = true;

  reconocimientoVoz.onresult = function(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const resultado = event.results[i];
      const texto = resultado[0].transcript;

      if (resultado.isFinal && esComandoSalto(texto)) {
        ejecutarSaltoPorVoz();
      }
    }
  };

  reconocimientoVoz.onend = function() {
    if (vozActiva) {
      reconocimientoVoz.start();
    }
  };

  reconocimientoVoz.onerror = function(event) {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      vozActiva = false;
      if (btnVoz) {
        btnVoz.disabled = false;
        btnVoz.textContent = 'Activar voz';
      }
    }
  };

  vozActiva = true;
  reconocimientoVoz.start();

  if (btnVoz) {
    btnVoz.disabled = true;
    btnVoz.textContent = 'Voz activada: di "salta"';
  }
}
