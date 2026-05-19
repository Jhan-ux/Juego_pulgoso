// reconocimiento_voz.js
// Reconocimiento de voz usando la Web Speech API

let recognition;
let recognizing = false;

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Tu navegador no soporta reconocimiento de voz.');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onstart = () => { recognizing = true; };
  recognition.onend = () => { recognizing = false; recognition.start(); };
  recognition.onerror = (e) => { console.error('Error de voz:', e); };
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        handleVoiceCommand(transcript);
      }
    }
  };
  recognition.start();
}

function handleVoiceCommand(command) {
  // Comandos simples: "salta", "arriba", "reiniciar"
  if (command.includes('salta') || command.includes('arriba')) {
    if (typeof window.handleGesture === 'function') window.handleGesture('Salto');
  } else if (command.includes('reiniciar')) {
    if (typeof init === 'function') init();
  }
  // Puedes agregar más comandos aquí
}

// Para iniciar desde game.js: setupVoiceRecognition();
