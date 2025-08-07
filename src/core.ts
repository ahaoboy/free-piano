import type { NoteEvent } from "free-piano-midi";
import Notes from "./notes";

export const WhiteKeys = Notes.filter((note) => !note.isBlack);
export const BlackKeys = Notes.filter((note) => note.isBlack);
console.log(WhiteKeys, BlackKeys);
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

export function textToMidi(input: string): NoteEvent[] {
  // Mapping characters to MIDI note numbers starting from 60 (middle C)
  const charToNote: { [key: string]: number } = {};
  let note = 60;
  for (
    const char
      of "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@$%^*("
  ) {
    charToNote[char] = note++;
  }

  const events: NoteEvent[] = [];
  let t = 0; // Current time
  const d = 0.5; // Default duration (e.g., quarter note)

  let i = 0;
  while (i < input.length) {
    const char = input[i];

    // Skip whitespace (spaces and newlines)
    if (char === " " || char === "\n") {
      i++;
      continue;
    } // Handle chords enclosed in square brackets
    else if (char === "[") {
      const endIndex = input.indexOf("]", i + 1);
      if (endIndex === -1) {
        throw new Error("Missing closing bracket ]");
      }
      const chordChars = input.slice(i + 1, endIndex);
      // All notes in the chord start and end at the same time
      for (const c of chordChars) {
        if (c in charToNote) {
          events.push({
            char: c,
            code: 0,
            start: t,
            end: t + d,
            free: () => {},
          } as any);
        }
      }
      i = endIndex + 1;
      t += d; // Advance time after the chord
    } // Handle single notes
    else if (char in charToNote) {
      events.push({
        code: 0,
        char: char,
        start: t,
        end: t + d,
        free: () => {},
      } as any);
      i++;
      t += d; // Advance time after the note
    } // Ignore unrecognized characters
    else {
      i++;
    }
  }

  return events;
}

// const TICKS_PER_QUARTER = 500;

// interface ParseOptions {
//   ticksPerQuarter?: number;
// }

// export function textToMidi(
//   input: string,
//   options: ParseOptions = {}
// ): (NoteEvent & {char:string})[] {
//   const ticksPerQuarter = options.ticksPerQuarter || TICKS_PER_QUARTER;
//   const events: (NoteEvent & {char:string})[] = [];
//   let currentTime = 0;

//   // Tokenize by spaces to handle sequences
//   const tokens = input.trim().split(/\s+/);

//   for (const token of tokens) {
//     if (token === "|") {
//       // Bar line: can be used to reset time or ignore
//       continue;
//     }
//     let notes: string[] = [];
//     let rapid = false;

//     // Chord syntax [abc]
//     if (/^\[.*\]$/.test(token)) {
//       notes = token.slice(1, -1).split('');
//     }
//     // Rapid chord {abc}
//     else if (/^\{.*\}$/.test(token)) {
//       notes = token.slice(1, -1).split('');
//       rapid = true; // shorter duration maybe
//     }
//     else {
//       // Sequence of characters, e.g., "euu" or a single note like "a._"
//       notes = token.split('');
//     }

//     for (const raw of notes) {
//       // Parse duration suffixes: _ (eighth), __ (sixteenth), . (dotted)
//       const match = raw.match(/^([0-9A-Za-z!@\$%\^\*\(]+)(_+)?(\.)?(-|~)?$/);
//       if (!match) continue;
//       const symbol = match[1];
//       const underscores = match[2] || '';
//       const dotted = !!match[3];
//       // const tie = !!match[4]; // not implemented

//       // Determine base duration
//       let duration = ticksPerQuarter;
//       if (underscores.length === 1) {
//         duration = ticksPerQuarter / 2; // eighth note
//       } else if (underscores.length === 2) {
//         duration = ticksPerQuarter / 4; // sixteenth note
//       }

//       // Apply dotted
//       if (dotted) {
//         duration = duration * 1.5;
//       }

//       // Rapid sequence halves duration
//       if (rapid) {
//         duration = duration / 2;
//       }

//       // Map symbol to MIDI code
//       const code = Notes.find(i => i.char === symbol)?.char;
//       if (code === undefined) {
//         console.warn(`Unknown symbol: ${symbol}`);
//         continue;
//       }

//       events.push({
//         code:0, start: currentTime / 1000, end: (currentTime + duration) / 1000, free: () => { },
//         char: symbol
//       });

//       currentTime += duration;
//     }
//   }

//   return events;
// }
