import type { NoteEvent } from "free-piano-midi";
import { getMidiFromChar, } from "./keymap";

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
            code: getMidiFromChar(char),
            start: t,
            end: t + d,
            free: () => { },
          });
        }
      }
      i = endIndex + 1;
      t += d; // Advance time after the chord
    } // Handle single notes
    else if (char in charToNote) {
      events.push({
        code: getMidiFromChar(char),
        start: t,
        end: t + d,
        free: () => { },
      });
      i++;
      t += d; // Advance time after the note
    } // Ignore unrecognized characters
    else {
      i++;
    }
  }

  return events;
}