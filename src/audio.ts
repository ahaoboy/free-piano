export type AudioStyle = "Full" | "Small";
const PUBLIC_PATH = "/free-piano"
const StyleMap: Record<AudioStyle, string> = {
  Full: "piano-full",
  Small: "piano",
};

export function getAudioUrl(midi: number, style: AudioStyle) {
  return `${PUBLIC_PATH}/${StyleMap[style]}/${midi}.mp3`;
}

export const playAudioByUrl = (url: string) => {
  const audio = new Audio(url);
  const cleanup = () => {
    audio.removeEventListener('ended', cleanup);
    audio.removeEventListener('error', cleanup);
    audio.src = '';
  };
  audio.addEventListener('ended', cleanup);
  audio.addEventListener('error', cleanup);
  audio.play().catch((err) => {
    cleanup();
    console.error('Audio playback failed', err);
  });
};

export function playMidi(midi: number, style: AudioStyle) {
  const url = getAudioUrl(midi, style);
  playAudioByUrl(url);
}

export function preloadMidi(midi: number, style: AudioStyle) {
  const url = getAudioUrl(midi, style);
  const audio = new Audio(url);
  const cleanup = () => {
    audio.removeEventListener('canplaythrough', cleanup);
    audio.removeEventListener('error', cleanup);
    audio.src = '';
  };

  audio.addEventListener('canplaythrough', cleanup);
  audio.addEventListener('error', cleanup);

  audio.load();
}
