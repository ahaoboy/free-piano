import { Flex } from "antd";
import "./Rain.css";
import { NoteEvent } from "free-piano-midi";
import { BlackKeys, KeyWidth, WhiteKeys } from "../core";
import { useRef } from "react";
import type { Layout } from "../layout";
import { type AudioStyle, playMidi } from "../audio";
import { getChar, isBlack } from "../keymap";

export type RainProps = {
  notes: NoteEvent[];

  // ms
  now: number;

  // ms
  duration: number;

  autoplay: boolean;

  layout: Layout;

  audioStyle: AudioStyle;
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
  if (isBlack(note.code)) {
    const index = BlackKeys.findIndex((i) => i.midi === note.code);
    const offset = getOffset(index);
    const translateX = `translateX(calc(${offset * 100}%))`;
    return translateX;
  } else {
    const index = WhiteKeys.findIndex((i) => i.midi === note.code);
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
  const cls = [
    "note-item",
  ];
  if (isBlack(note.code)) {
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
      {getChar(note.code)}
    </Flex>
  );
}

function inWindow(event: NoteEvent, now: number, duration: number) {
  return event.start >= now && event.end <= now + duration;
}

export const Rain = (
  { notes, now, duration, autoplay, audioStyle }: RainProps,
) => {
  const lastNotes = useRef<NoteEvent[]>([]);
  const currentNotes = notes.filter((i) => inWindow(i, now, duration));

  if (autoplay) {
    for (const i of lastNotes.current) {
      if (!currentNotes.includes(i)) {
        playMidi(i.code, audioStyle);
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
