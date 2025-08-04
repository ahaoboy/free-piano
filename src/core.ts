import Notes from "./notes";

export const WhiteKeys = Notes.filter((note) => note.type === "white");
export const BlackKeys = Notes.filter((note) => note.type === "black");
export const KeyWidth = `calc(100% / ${WhiteKeys.length})`;

// export function midiNoteToVirtualPianoName(noteNumber: number): string {
//   const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
//   const noteIndex = noteNumber % 12;
//   const octave = Math.floor(noteNumber / 12) - 1;
//   return `${noteNames[noteIndex]}${octave}`;
// }

export function midiNoteToVirtualPianoName(midi: number): string {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const noteIndex = midi % 12;
  const note = noteNames[noteIndex];
  const octave = Math.floor(midi / 12);
  return note + octave;
}

export function getBlackOffsetX(index: number) {
  let offset = 0;
  const five = (index / 5) | 0;
  offset += five * 4;
  const mod = index % 5;
  if (mod >= 0) {
    offset += 1;
  }
  if (mod >= 1) {
    offset += 0;
  }
  if (mod >= 2) {
    offset += 2;
  }
  if (mod >= 3) {
    offset += 0;
  }
  if (mod >= 4) {
    offset += 0;
  }
  const translateX = `translateX(calc(${offset * 0.5 * 100}%))`;
  return translateX;
}

export function getWhiteOffsetX(index: number) {
  let offset = 0;
  const translateX = `translateX(calc(${offset * 0.5 * 100}%))`;
  return translateX;
}
