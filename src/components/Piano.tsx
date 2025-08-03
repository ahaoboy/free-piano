import React, { useEffect, useState } from "react";
import Notes from "../notes";
import "./Piano.css";
import { Flex, Typography } from "antd";

const { Text } = Typography;
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

function getBlackOffset(index: number) {
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

const whiteKeys = Notes.filter((note) => note.type === "white");
const blackKeys = Notes.filter((note) => note.type === "black");
const blackWidth = `calc(100% / ${whiteKeys.length})`;

export const Piano: React.FC<PianoProps> = (
  { showNote, showKey, showSolfa, mute }: PianoProps,
) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [pressMap, setPressMap] = useState<Record<string, boolean>>({});
  const playAudio = (url: string) => {
    if (mute) {
      return;
    }
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
      let keyCode = e.keyCode.toString();

      if (e.shiftKey) {
        keyCode = "b" + e.keyCode.toString();
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
      let keyCode = e.keyCode.toString();

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
        {whiteKeys.map((i, index) => (
          <Flex
            key={i.keyCode}
            className={"piano-key white-key" +
              (pressMap[i.keyCode] ? " press-key" : "")}
            onClick={() => {
              playAudio(i.base64);
            }}
            vertical
          >
            {showSolfa && (
              <Text>
                {["do", "re", "mi", "fa", "so", "la", "si"][index % 5]}
              </Text>
            )}
            {showNote && <Text>{i.name}</Text>}
            {showKey && <Text>{i.char}</Text>}
          </Flex>
        ))}
      </Flex>

      <Flex className="black-keys">
        {blackKeys.map((i, index) => (
          <Flex
            key={i.keyCode}
            className={"piano-key black-key" +
              (pressMap[i.keyCode] ? " press-key" : "")}
            onClick={() => {
              playAudio(i.base64);
            }}
            vertical
            style={{
              width: blackWidth,
              transform: getBlackOffset(index),
            }}
            align="center"
          >
            {showKey && <Text>{i.char}</Text>}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
