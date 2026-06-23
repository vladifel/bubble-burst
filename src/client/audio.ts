let audioContext: AudioContext | null = null;

export function unlockAudio(): void {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
}

export function playPop(enabled: boolean): void {
  if (!enabled) return;
  unlockAudio();
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.12);
}
