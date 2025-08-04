import React, { useEffect, useState } from "react";
import Notes from "../notes";
import "./Piano.css";
import { Flex, Typography } from "antd";
import { BlackKeys, getBlackOffsetX, KeyWidth, WhiteKeys } from "../core";

const { Title } = Typography;
interface Note {
  id: number;
  name: string;
  keyCode: string;
  key: string;
  url: string;
  type: string;
  base64: string;
}

export type PianoProps = {
  showNote: boolean;
  showKey: boolean;
  showSolfa: boolean;
  mute: boolean;
};

export const Piano: React.FC<PianoProps> = (
  { showNote, showKey, showSolfa, mute }: PianoProps,
) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [pressMap, setPressMap] = useState<Record<string, boolean>>({});
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  const handleKeyDown = (note: Note) => {
    if (!pressedKeys.has(note.keyCode)) {
      setPressedKeys((prev) => new Set([...prev, note.keyCode]));
      playAudio(note.base64);
    }
  };

  const handleKeyUp = (keyCode: string) => {
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(keyCode);
      return newSet;
    });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
        handleKeyUp(note.keyCode);
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
            key={i.keyCode}
            className={"piano-key white-key" +
              (pressMap[i.keyCode] ? " press-key" : "")}
            onClick={() => {
              playAudio(i.base64);
            }}
            vertical
            style={{
              width: KeyWidth,
              // transform: getWhiteOffsetX(index),
            }}
          >
            {showSolfa && (
              <Title>
                {["do", "re", "mi", "fa", "so", "la", "si"][index % 5]}
              </Title>
            )}
            {showNote && <Title>{i.name}</Title>}
            {showKey && <Title>{i.char}</Title>}
          </Flex>
        ))}
      </Flex>

      <Flex className="black-keys">
        {BlackKeys.map((i, index) => (
          <Flex
            key={i.keyCode}
            className={`piano-key black-key BlackIndex_${index} ` +
              (pressMap[i.keyCode] ? " press-key" : "")}
            onClick={() => {
              playAudio(i.base64);
            }}
            vertical
            style={{
              width: KeyWidth,
              transform: getBlackOffsetX(index),
            }}
            align="center"
          >
            {showNote && <Title>{i.name}</Title>}
            {showKey && <Title>{i.char}</Title>}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
