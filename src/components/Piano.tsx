import React, { useEffect, useState } from "react";
import Notes, { type Note } from "../notes";
import "./Piano.css";
import { Flex, Typography } from "antd";
import { BlackKeys, getBlackOffsetX, KeyWidth, WhiteKeys } from "../core";
import type { Layout } from "../layout";
import { getChar } from "../keymap";
import { type AudioStyle, playMidi } from "../audio";

const { Title } = Typography;

export type PianoProps = {
  showNote: boolean;
  showKey: boolean;
  showSolfa: boolean;
  mute: boolean;
  layout: Layout;
  audioStyle: AudioStyle;
};

export const Piano: React.FC<PianoProps> = (
  { showNote, showKey, showSolfa, mute, audioStyle }: PianoProps,
) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [pressMap, setPressMap] = useState<Record<string, boolean>>({});

  const handleKeyDown = (note: Note) => {
    if (!pressedKeys.has(note.midi)) {
      setPressedKeys((prev) => new Set([...prev, note.midi]));
      playMidi(note.midi, audioStyle);
    }
  };

  const handleKeyUp = (midi: number) => {
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(midi);
      return newSet;
    });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      console.log(e);
      if (mute) {
        return;
      }
      let keyCode = e.keyCode >= 96 && e.keyCode <= 105
        ? (e.keyCode - (96 - 48)).toString()
        : e.keyCode.toString();
      if (e.shiftKey) {
        keyCode = "b" + e.keyCode;
      }

      setPressMap({ ...pressMap, [keyCode]: true });
      const note = Notes.find((n) => n.keyCode === keyCode);
      if (note) {
        handleKeyDown(note);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      console.log(e);
      if (mute) {
        return;
      }
      let keyCode = e.keyCode >= 96 && e.keyCode <= 105
        ? (e.keyCode - (96 - 48)).toString()
        : e.keyCode.toString();

      if (e.shiftKey) {
        keyCode = "b" + e.keyCode.toString();
      }
      setPressMap({ ...pressMap, [keyCode]: false });

      const note = Notes.find((n) => n.keyCode === keyCode);
      if (note) {
        handleKeyUp(note.midi);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("keyup", handleGlobalKeyUp);
    };
  });

  return (
    <Flex className="piano-container">
      <Flex className="white-keys">
        {WhiteKeys.map((i, index) => (
          <Flex
            key={i.midi}
            className={"piano-key white-key" +
              (pressMap[i.midi] ? " press-key" : "")}
            onClick={() => {
              playMidi(i.midi, audioStyle);
            }}
            vertical
            style={{
              width: KeyWidth,
            }}
          >
            {showSolfa && (
              <Title>
                {["do", "re", "mi", "fa", "so", "la", "si"][index % 5]}
              </Title>
            )}
            {showNote && <Title>{i.name}</Title>}
            {showKey && <Title>{getChar(i.midi)}</Title>}
          </Flex>
        ))}
      </Flex>

      <Flex className="black-keys">
        {BlackKeys.map((i, index) => (
          <Flex
            key={i.midi}
            className={`piano-key black-key BlackIndex_${index} ` +
              (pressMap[i.midi] ? " press-key" : "")}
            onClick={() => {
              playMidi(i.midi, audioStyle);
            }}
            vertical
            style={{
              width: KeyWidth,
              transform: getBlackOffsetX(index),
            }}
            align="center"
          >
            {showNote && <Title>{i.name}</Title>}
            {showKey && <Title>{getChar(i.midi)}</Title>}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
