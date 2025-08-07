import React, { useEffect, useState } from "react";
import "./Piano.css";
import { Flex, Typography } from "antd";
import {
  getBlackKeys,
  getBlackOffsetX,
  getKeyWidth,
  getWhiteKeys,
  type Layout,
} from "../layout";
import { getChar, getMidiFromEvent } from "../keymap";
import { type AudioStyle, playMidi } from "../audio";

const { Title } = Typography;

export type PianoProps = {
  showNote: boolean;
  showKey: boolean;
  showSolfa: boolean;
  mute: boolean;
  layout: Layout;
  audioStyle: AudioStyle;
  textLevel: 1 | 2 | 3 | 4 | 5;
};

export const Piano: React.FC<PianoProps> = (
  { showNote, showKey, showSolfa, mute, audioStyle, layout, textLevel }:
    PianoProps,
) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  const handleKeyDown = (midi: number) => {
    if (!pressedKeys.has(midi)) {
      setPressedKeys((prev) => new Set([...prev, midi]));
      playMidi(midi, audioStyle);
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
      if (mute) {
        return;
      }
      const midi = getMidiFromEvent(e);
      if (midi) {
        setPressedKeys((prev) => new Set([...prev, midi]));
        handleKeyDown(midi);
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (mute) {
        return;
      }
      const midi = getMidiFromEvent(e);
      if (midi) {
        handleKeyUp(midi);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("keyup", handleGlobalKeyUp);
    };
  });

  const WhiteKeys = getWhiteKeys(layout);
  const KeyWidth = getKeyWidth(layout);
  const BlackKeys = getBlackKeys(layout);

  return (
    <Flex className="piano-container">
      <Flex className="white-keys">
        {WhiteKeys.map((i, index) => (
          <Flex
            key={i.midi}
            className={"piano-key white-key" +
              (pressedKeys.has(i.midi) ? " press-key" : "")}
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
            {showNote && (
              <Title className="key-text" level={textLevel}>{i.name}</Title>
            )}
            {showKey && (
              <Title className="key-text" level={textLevel}>
                {getChar(i.midi)}
              </Title>
            )}
          </Flex>
        ))}
      </Flex>

      <Flex className="black-keys">
        {BlackKeys.map((i, index) => (
          <Flex
            key={i.midi}
            className={`piano-key black-key BlackIndex_${index} ` +
              (pressedKeys.has(i.midi) ? " press-key" : "")}
            onClick={() => {
              playMidi(i.midi, audioStyle);
            }}
            vertical
            style={{
              width: KeyWidth,
              transform: `translateX(calc(${
                getBlackOffsetX(index, layout)
              } * 100%))`,
            }}
            align="center"
          >
            {showNote && (
              <Title className="key-text" level={textLevel}>{i.name}</Title>
            )}
            {showKey && (
              <Title className="key-text" level={textLevel}>
                {getChar(i.midi)}
              </Title>
            )}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};
