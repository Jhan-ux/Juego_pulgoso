// js/teachable_voice.js
// Reconocimiento de voz con Teachable Machine Audio
const TM_AUDIO_URL = 'assets/model_audio/';
let tmAudioModel, tmAudioRecognizer;

async function initTeachableVoice() {
  if (!window.tmAudio) {
    alert('No se encontró la librería de Teachable Machine Audio.');
    return;
  }
  tmAudioModel = await tmAudio.load(TM_AUDIO_URL + 'model.json');
  tmAudioRecognizer = new tmAudio.Recognizer(tmAudioModel);
  await tmAudioRecognizer.listen(result => {
    const prediction = result.scores.indexOf(Math.max(...result.scores));
    const label = tmAudioModel.labels[prediction];
    if (label === 'salta') {
      if (typeof window.handleGesture === 'function') window.handleGesture('Salto');
    }
  }, { probabilityThreshold: 0.85 });
}
