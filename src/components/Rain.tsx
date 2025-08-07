import { Flex } from "antd";
import "./Rain.css";
import { NoteEvent } from "free-piano-midi";
import { useRef } from "react";
import {
  getBlackKeys,
  getBlackOffsetX,
  getKeyWidth,
  getWhiteKeys,
  type Layout,
} from "../layout";
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

  mute: boolean;
};

export type NoteProps = {
  note: NoteEvent;
  // second
  now: number;

  // second
  duration: number;

  layout: Layout;
};

function getNoteOffsetX(note: NoteEvent, layout: Layout) {
  const WhiteKeys = getWhiteKeys(layout);
  const BlackKeys = getBlackKeys(layout);

  if (isBlack(note.code)) {
    const index = BlackKeys.findIndex((i) => i.midi === note.code);
    const offset = getBlackOffsetX(index, layout);
    return offset
  } else {
    const index = WhiteKeys.findIndex((i) => i.midi === note.code);
    return index
  }
}

function getNoteOffsetY(
  note: NoteEvent,
  now: number,
  duration: number,
  height: number,
) {
  const offsetTop = 1 - (note.start - now) / duration;
  const translateY = `translateY(calc(${(offsetTop * 100 * 100) / height}%))`;
  return translateY;
}

function Note({ note, now, duration, layout }: NoteProps) {
  const offsetX = getNoteOffsetX(note, layout);
  const offsetY = getNoteOffsetY(note, now, duration, 2);
  const cls = [
    "note-item",
  ];
  if (isBlack(note.code)) {
    cls.push("note-black");
  } else {
    cls.push("note-white");
  }
  const KeyWidth = getKeyWidth(layout);

  return (
    <Flex
      className={cls.join(" ")}
      style={{
        width: KeyWidth,
        height: 2 + "%",
        // top: -height + "%",
        transform: `translateX(calc(${offsetX * 100}%)) ${offsetY}`,
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
  { notes, now, duration, autoplay, audioStyle, layout, mute }: RainProps,
) => {
  const lastNotes = useRef<NoteEvent[]>([]);
  const currentNotes = notes.filter((i) => inWindow(i, now, duration));

  const lastNodesRef = useRef<NoteEvent[]>([]);
  if (lastNodesRef.current !== notes) {
    lastNodesRef.current = notes;
    lastNotes.current = [];
  }

  if (mute) {
    lastNotes.current = [];
  }

  if (autoplay && !mute) {
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
        <Note
          layout={layout}
          key={JSON.stringify(i)}
          note={i}
          now={now}
          duration={duration}
        />
      ))}
    </Flex>
  );
};
