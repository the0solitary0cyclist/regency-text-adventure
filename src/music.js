let audioContext;
let timer;

const melody = [
  ["D4", 1], ["F#4", 1], ["A4", 1],
  ["G4", 1], ["F#4", 1], ["E4", 1],
  ["D4", 1], ["A3", 1], ["D4", 1],
];

const notes = {
  "A3": 220,
  "D4": 293.66,
  "E4": 329.63,
  "F#4": 369.99,
  "G4": 392,
  "A4": 440,
};

function playNote(freq, start, duration) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "triangle";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.08, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(start);
  osc.stop(start + duration);
}

export function startMusic() {
  if (audioContext) return;

  audioContext = new AudioContext();

  let i = 0;

  timer = setInterval(() => {
    const now = audioContext.currentTime;
    const [note, beats] = melody[i % melody.length];

    playNote(notes[note], now, beats * 0.45);

    i += 1;
  }, 500);
}

export function stopMusic() {
  clearInterval(timer);
  audioContext?.close();
  audioContext = null;
}