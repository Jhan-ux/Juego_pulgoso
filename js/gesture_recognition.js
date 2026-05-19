// Este archivo contiene la lógica para el reconocimiento de gestos usando TensorFlow.js y la webcam
// Se cargará desde game.js

let gestureModel;
let webcam;
let gestureLabels = ["Arriba", "Abajo", "Izquierda", "Derecha", "Salto"];

async function setupGestureRecognition() {
  // Cargar modelo personalizado (debe ser entrenado y exportado previamente)
  // Por ahora, se deja como placeholder para cargar un modelo local
  gestureModel = await tf.loadLayersModel('assets/model/gesture_model.json');

  // Configurar webcam
  webcam = await setupWebcam();
  requestAnimationFrame(predictGesture);
}

async function setupWebcam() {
  const video = document.createElement('video');
  video.width = 224;
  video.height = 224;
  video.autoplay = true;
  document.body.appendChild(video);

  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.addEventListener('loadeddata', () => resolve(video));
      })
      .catch(reject);
  });
}

async function predictGesture() {
  if (!gestureModel || !webcam) return;
  const tensor = tf.browser.fromPixels(webcam).resizeNearestNeighbor([224,224]).toFloat().expandDims();
  const prediction = gestureModel.predict(tensor);
  const predictedIndex = prediction.argMax(1).dataSync()[0];
  const label = gestureLabels[predictedIndex];
  handleGesture(label);
  requestAnimationFrame(predictGesture);
}

function handleGesture(label) {
  // Aquí se debe conectar con la lógica del juego
  // Por ejemplo:
  if (label === "Salto") {
    // Lógica para saltar
  }
  // ...otros gestos
}

// Para iniciar el reconocimiento desde game.js:
// setupGestureRecognition();
