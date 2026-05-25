// Integración de reconocimiento de palabra clave con TensorFlow.js
// Este archivo permite detectar la palabra "salta" usando un modelo de audio (Speech Commands)
// sin modificar la lógica actual del juego ni el reconocimiento de voz nativo.

let tfModel = null;
let tfMetadata = null;
let tfListening = false;
let tfAudioContext = null;
let tfStream = null;
let tfAnalyser = null;
let tfProcessor = null;

async function cargarModeloTF() {
  if (tfModel) return tfModel;
  tfModel = await tf.loadLayersModel('assets/model_audio/model.json');
  const resp = await fetch('assets/model_audio/metadata.json');
  tfMetadata = await resp.json();
  return tfModel;
}

function startKeywordSpotting(callback) {
  if (tfListening) return;
  tfListening = true;
  cargarModeloTF().then(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      tfAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      tfStream = tfAudioContext.createMediaStreamSource(stream);
      tfAnalyser = tfAudioContext.createAnalyser();
      tfStream.connect(tfAnalyser);
      tfProcessor = tfAudioContext.createScriptProcessor(2048, 1, 1);
      tfAnalyser.connect(tfProcessor);
      tfProcessor.connect(tfAudioContext.destination);
      tfProcessor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        detectarPalabraClave(input, callback);
      };
    });
  });
}

function stopKeywordSpotting() {
  tfListening = false;
  if (tfProcessor) tfProcessor.disconnect();
  if (tfAnalyser) tfAnalyser.disconnect();
  if (tfStream) tfStream.disconnect();
  if (tfAudioContext) tfAudioContext.close();
  tfProcessor = null;
  tfAnalyser = null;
  tfStream = null;
  tfAudioContext = null;
}

async function detectarPalabraClave(audioBuffer, callback) {
  // Aquí deberías convertir el audioBuffer en un espectrograma y pasarlo al modelo
  // Por simplicidad, esto es un placeholder. Debes adaptar según tu modelo real.
  // Ejemplo:
  // const inputTensor = tf.tensor(audioBuffer, [1, ...]);
  // const prediction = tfModel.predict(inputTensor);
  // if (prediction > umbral) callback();
}

// Para usarlo desde el juego:
// startKeywordSpotting(() => {
//   if (typeof window.handleVoiceJump === 'function') window.handleVoiceJump();
// });
// stopKeywordSpotting();
