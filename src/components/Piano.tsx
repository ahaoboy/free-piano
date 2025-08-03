import React, { useEffect, useState } from "react";
import Notes from "../notes";
import "./Piano.css";
import { Flex, Tag } from "antd";

interface Note {
  id: number;
  name: string;
  keyCode: string;
  key: string;
  url: string;
  type: string;
}

export type PianoProps = {
  showNote: boolean;
  showKey: boolean;
  showSolfa: boolean;
  mute: boolean;
};

function getBlackOffset(index: number, count: number) {
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

export const Piano: React.FC<PianoProps> = (
  { showNote, showKey, showSolfa, mute }: PianoProps,
) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const playAudio = (url: string) => {
    console.log("playAudio", mute, url);
    if (mute) {
      return;
    }
    const audio = new Audio(url);
    audio.play().catch((err) => {
      console.error("播放失败:", err);
    });
  };

  const handleKeyDown = (note: Note) => {
    if (!pressedKeys.has(note.keyCode)) {
      setPressedKeys((prev) => new Set([...prev, note.keyCode]));
      playAudio(note.url);
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
      let keyCode = e.keyCode.toString();

      if (e.shiftKey) {
        keyCode = "b" + e.keyCode.toString();
      }

      const note = Notes.find((n) => n.keyCode === keyCode);
      if (note) {
        handleKeyDown(note);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      let keyCode = e.keyCode.toString();

      if (e.shiftKey) {
        keyCode = "b" + e.keyCode.toString();
      }

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

  const whiteKeys = Notes.filter((note) => note.type === "white");
  const blackKeys = Notes.filter((note) => note.type === "black");

  const blackWidth = `calc(100% / ${whiteKeys.length})`;

  return (
    <Flex className="piano-container">
      <Flex className="white-keys">
        {whiteKeys.map((i) => (
          <Flex
            key={i.keyCode}
            className="piano-key white-key"
            onClick={() => {
              console.log("white", i);
              playAudio(i.url);
            }}
            vertical
          >
            {showKey && <Tag>{i.keyCode}</Tag>}
            {showNote && <Tag>{i.keyCode}</Tag>}
            {showSolfa && <Tag>{i.keyCode}</Tag>}
          </Flex>
        ))}
      </Flex>

      <Flex className="black-keys">
        {blackKeys.map((i, index) => (
          <Flex
            key={i.keyCode}
            className="piano-key black-key"
            onClick={() => {
              console.log("black", i);
              playAudio(i.url);
            }}
            vertical
            style={{
              width: blackWidth,
              transform: getBlackOffset(index, whiteKeys.length),
            }}
          >
            {showKey && <Tag>{i.keyCode}</Tag>}
            {showNote && <Tag>{i.keyCode}</Tag>}
            {showSolfa && <Tag>{i.keyCode}</Tag>}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
