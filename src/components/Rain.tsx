import { Flex } from "antd";
import "./Rain.css";
import { NoteEvent } from "free-piano-midi";
import {
  BlackKeys,
  KeyWidth,
  midiNoteToVirtualPianoName,
  WhiteKeys,
} from "../core";
import Notes from "../notes";
import { useRef } from "react";

export type RainProps = {
  notes: NoteEvent[];

  // ms
  now: number;

  // ms
  duration: number;

  autoplay: boolean;
};

export type NoteProps = {
  note: NoteEvent;
  // second
  now: number;

  // second
  duration: number;
};

function getOffset(index: number) {
  let offset = 0.5;
  const five = (index / 5) | 0;
  offset += five * 7;
  const mod = index % 5;
  offset += [0, 0, 1, 3, 4, 5][mod + 1];
  return offset;
}

function getNoteOffsetX(note: NoteEvent) {
  const name = note.code
    ? midiNoteToVirtualPianoName(note.code)
    : Notes.find((i) => i.char === (note as any).char)?.name || "";
  const i = Notes.find((i) => i.name === name);
  const isBlack = i?.name.includes("#");
  if (!i) return "";
  if (isBlack) {
    const index = BlackKeys.findIndex((i) => i.name === name);
    const offset = getOffset(index);
    const translateX = `translateX(calc(${offset * 100}%))`;
    return translateX;
  } else {
    const index = WhiteKeys.findIndex((i) => i.name === name);
    const translateX = `translateX(calc(${index * 100}%))`;
    return translateX;
  }
}

function getNoteOffsetY(
  note: NoteEvent,
  now: number,
  duration: number,
  height: number,
) {
  const offsetTop = 1 - (note.start - now) / duration;
  const translateX = `translateY(calc(${offsetTop * 100 * 100 / height}%))`;
  return translateX;
}

function Note({ note, now, duration }: NoteProps) {
  const offsetX = getNoteOffsetX(note);
  const offsetY = getNoteOffsetY(note, now, duration, 2);
  const name = note.code
    ? midiNoteToVirtualPianoName(note.code)
    : Notes.find((i) => i.char === (note as any).char)?.name || "";
  const isBlack = name.includes("#");
  const blackIndex = BlackKeys.findIndex((i) => i.name === name);
  const whiteIndex = WhiteKeys.findIndex((i) => i.name === name);
  const offsetTop = (note.start - now) / duration;

  const cls = [
    "note-item",
    `blackIndex_${blackIndex}`,
    `whiteIndex_${whiteIndex}`,
    `offsetTop_${offsetTop}`,
  ];
  if (isBlack) {
    cls.push("note-black");
  } else {
    cls.push("note-white");
  }

  return (
    <Flex
      className={cls.join(" ")}
      style={{
        width: KeyWidth,
        height: 2 + "%",
        // top: -height + "%",
        transform: `${offsetX} ${offsetY}`,
      }}
    >
      {BlackKeys[blackIndex]?.char || WhiteKeys[whiteIndex]?.char}
    </Flex>
  );
}

function inWindow(event: NoteEvent, now: number, duration: number) {
  return event.start >= now && event.end <= now + duration;
}

function playNote(note: NoteEvent) {
  const name = note.code
    ? midiNoteToVirtualPianoName(note.code)
    : Notes.find((i) => i.char === (note as any).char)?.name || "";
  const blackIndex = BlackKeys.findIndex((i) => i.name === name);
  const whiteIndex = WhiteKeys.findIndex((i) => i.name === name);
  const item = BlackKeys[blackIndex] || WhiteKeys[whiteIndex];
  if (item) {
    const audio = new Audio(item.base64);
    audio.play();
  }
}

export const Rain = ({ notes, now, duration, autoplay }: RainProps) => {
  const lastNotes = useRef<NoteEvent[]>([]);
  const currentNotes = notes.filter((i) => inWindow(i, now, duration));

  if (autoplay) {
    for (const i of lastNotes.current) {
      if (!currentNotes.includes(i)) {
        playNote(i);
      }
    }
    lastNotes.current = currentNotes;
  }

  return (
    <Flex className="rain-main">
      {currentNotes.map((i) => (
        <Note key={JSON.stringify(i)} note={i} now={now} duration={duration} />
      ))}
    </Flex>
  );
};
