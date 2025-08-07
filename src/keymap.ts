import Notes from "./notes";

const CharMap: Record<string, string> = {
  "A0": "-",
  "B0": "=",
  "C1": "[",
  "D1": "]",
  "E1": "\\",
  "F1": ";",
  "G1": "'",
  "A1": ",",
  "B1": ".",
  "C2": "1",
  "D2": "2",
  "E2": "3",
  "F2": "4",
  "G2": "5",
  "A2": "6",
  "B2": "7",
  "C3": "8",
  "D3": "9",
  "E3": "0",
  "F3": "q",
  "G3": "w",
  "A3": "e",
  "B3": "r",
  "C4": "t",
  "D4": "y",
  "E4": "u",
  "F4": "i",
  "G4": "o",
  "A4": "p",
  "B4": "a",
  "C5": "s",
  "D5": "d",
  "E5": "f",
  "F5": "g",
  "G5": "h",
  "A5": "j",
  "B5": "k",
  "C6": "l",
  "D6": "z",
  "E6": "x",
  "F6": "c",
  "G6": "v",
  "A6": "b",
  "B6": "n",
  "C7": "m",
  "D7": "1",
  "E7": "2",
  "F7": "3",
  "G7": "4",
  "A7": "5",
  "B7": "6",
  "C8": "7",
  "A#0": "_",
  "C#1": "{",
  "D#1": "}",
  "F#1": ":",
  "G#1": '"',
  "A#1": "<",
  "C#2": "!",
  "D#2": "@",
  "F#2": "$",
  "G#2": "%",
  "A#2": "^",
  "C#3": "*",
  "D#3": "(",
  "F#3": "Q",
  "G#3": "W",
  "A#3": "E",
  "C#4": "T",
  "D#4": "Y",
  "F#4": "I",
  "G#4": "O",
  "A#4": "P",
  "C#5": "S",
  "D#5": "D",
  "F#5": "G",
  "G#5": "H",
  "A#5": "J",
  "C#6": "L",
  "D#6": "Z",
  "F#6": "C",
  "G#6": "V",
  "A#6": "B",
  "C#7": "1",
  "D#7": "2",
  "F#7": "3",
  "G#7": "4",
  "A#7": "5",
};
// A key that indicates which key on the keyboard
export function getChar(midi: number): string {
  const name = getNoteName(midi);
  return CharMap[name];
}

// eventName: shift+ctrl+Numpad1
export function getEventKey(midi: number): string {
  const name = getNoteName(midi);
  return CharMap[name];
}

export function getMidiFromChar(c: string) {
  for (const i of Notes) {
    if (getChar(i.midi) === c) {
      return i.midi;
    }
  }
  return 0
}

export function getMidiFromEvent(e: KeyboardEvent) {
  getMidiFromChar(e.key)
}

export function getNoteName(midi: number) {
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
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[noteIndex];
  return `${noteName}${octave}`;
}

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

export function isBlack(midi: number) {
  const noteIndex = midi % 12;
  const noteName = noteNames[noteIndex];
  return noteName.includes("#");
}
