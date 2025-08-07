import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Piano } from "./components/Piano";
import {
  AutoComplete,
  type AutoCompleteProps,
  Button,
  ConfigProvider,
  Flex,
  Select,
  Slider,
  Switch,
  Tabs,
  theme,
  Typography,
  Upload,
} from "antd";
import { getData, getItem, type Item } from "./api";
import Fuse from "fuse.js";
import { Rain } from "./components/Rain";
import {
  GithubOutlined,
  MoonOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  SunOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { decode, NoteEvent } from "free-piano-midi";
import { textToMidi } from "./core";
import type { Layout } from "./layout";
import { type AudioStyle, preloadMidi } from "./audio";

const { defaultAlgorithm, darkAlgorithm } = theme;
const FPS = 15;

type TabPanel = "Text" | "Midi";

function App() {
  const [showKey, setShowKey] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [showSolfa, setShowSolfa] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [options, setOptions] = React.useState<AutoCompleteProps["options"]>(
    [],
  );
  const [data, setData] = useState<Item[]>([]);
  const fuseRef = useRef<Fuse<Item>>(null);
  const [searchText, setSearchText] = useState("");
  const [score, setScore] = useState("");
  const [mute, setMute] = useState(false);
  const [notes, setNotes] = useState<NoteEvent[]>([]);
  const [now, setNow] = useState(0);
  const [isDark, setIsDark] = useState(
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [inv, setInv] = useState(0);
  const [layout, setLayout] = useState<Layout>("Full");
  const [audioStyle, _setAudioStyle] = useState<AudioStyle>("Full");
  const [tab, setTab] = useState<TabPanel>("Text");
  const maxTime = notes.at(-1)?.end || 0;
  const progress = now / maxTime * 100 | 0;

  const [textLevel, setTextLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    const s = new Set(notes.map((i) => i.code));
    for (const i of s) {
      preloadMidi(i, audioStyle);
    }
  }, [notes]);

  useEffect(() => {
    getData().then((i) => {
      setData(i);
      fuseRef.current = new Fuse(i, {
        keys: [
          "title",
        ],
      });
    });
  }, []);
  function getPanelValue(text: string) {
    return fuseRef.current?.search(text).slice(0, 10).map((i) => {
      return {
        label: i.item.title,
        value: i.item.id.toString(),
      };
    }) || [];
  }

  function play() {
    setInv(+setInterval(() => setNow((i) => i + 1 / FPS), 1000 / FPS));
  }
  function pause() {
    clearInterval(inv);
    setInv(0);
  }
  function redo() {
    clearInterval(inv);
    setInv(0);
    setNow(0);
  }

  const sliderMuteRef = useRef(false);
  const sliderChangeRef = useRef(false);
  return (
    <ConfigProvider
      theme={{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }}
    >
      <Flex className="App" vertical>
        <Flex
          className="header"
          vertical
          justify="center"
          align="center"
          gap="small"
        >
          <Flex justify="center" align="center" gap="small">
            <Flex
              gap="middle"
              justify="center"
              align="center"
              style={{ position: "absolute", top: "1rem", right: "1rem" }}
            >
              <Typography.Link
                href="https://github.com/ahaoboy/free-piano"
                target="_blank"
              >
                <GithubOutlined />
              </Typography.Link>
              {isDark
                ? (
                  <Typography.Link onClick={() => setIsDark(false)}>
                    <SunOutlined />
                  </Typography.Link>
                )
                : (
                  <Typography.Link onClick={() => setIsDark(true)}>
                    <MoonOutlined />
                  </Typography.Link>
                )}
            </Flex>
            textsize:
            <Select
              value={textLevel}
              style={{ width: 50 }}
              onChange={(e) => {
                setTextLevel(e);
              }}
              options={Array(5).fill(0).map((_, i) => ({
                value: i + 1,
                label: i + 1,
              }))}
            />

            layout:
            <Select
              value={layout}
              style={{ width: 80 }}
              onChange={(e) => {
                setLayout(e as Layout);
              }}
              options={[
                { value: "Full", label: "Full" },
                { value: "Small", label: "Small" },
              ]}
            />

            <Flex justify="center" align="center" gap="small">
              key:
              <Switch
                value={showKey}
                onChange={(e) => {
                  setShowKey(e);
                }}
              />
            </Flex>
            <Flex justify="center" align="center" gap="small">
              note:
              <Switch
                value={showNote}
                onChange={(e) => {
                  setShowNote(e);
                }}
              />
            </Flex>
            <Flex justify="center" align="center" gap="small">
              solfa(C major):
              <Switch
                value={showSolfa}
                onChange={(e) => {
                  setShowSolfa(e);
                }}
              />
            </Flex>
            <Flex justify="center" align="center" gap="small">
              autoplay:
              <Switch
                value={autoplay}
                onChange={(e) => {
                  setAutoplay(e);
                }}
              />
            </Flex>
          </Flex>

          <Flex className="control-main">
            <AutoComplete
              value={searchText}
              options={options}
              style={{ width: 200 }}
              onSearch={(text) => setOptions(getPanelValue(text))}
              placeholder="input here"
              onSelect={async (e) => {
                const html = await getItem(e);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const txt = doc.body.textContent || "";
                setScore(txt);
                const item = data.find((i) => i.id === +e);
                setSearchText(item?.title || "");
                setNotes(textToMidi(txt));
              }}
              onChange={(e) => {
                setSearchText(e);
              }}
              onBlur={() => {
                setMute(false);
              }}
              onFocus={() => {
                setMute(true);
              }}
            />
            <Upload
              name="file"
              action="*"
              customRequest={(e) => e.onSuccess?.(true)}
              showUploadList={false}
              onChange={async (info) => {
                if (info.file.status === "done") {
                  return;
                }

                const ext = info.file.name.split(".").at(-1)?.toLowerCase() ||
                  "";

                if (["txt"].includes(ext)) {
                  const txt = (await info.file.originFileObj?.text()) || "";
                  setScore(txt);
                  setNotes(textToMidi(txt));
                  return;
                }
                if ("html".includes(ext)) {
                  const html = (await info.file.originFileObj?.text()) || "";
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, "text/html");
                  const txt = doc.body.textContent || "";
                  setScore(txt);
                  setNotes(textToMidi(txt));
                  return;
                }

                if (["mid", "midi"].includes(ext)) {
                  setData([]);
                  const file = info.file.originFileObj;
                  if (!file) {
                    return;
                  }
                  const fileBuffer = new Uint8Array(await file.arrayBuffer());
                  const v = await decode(fileBuffer);
                  setNotes(v || []);
                  setLayout("Full");
                  setTab("Midi");
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
            {inv
              ? <Button icon={<PauseOutlined />} onClick={pause}>Pause</Button>
              : (
                <Button icon={<PlayCircleOutlined />} onClick={play}>
                  Play
                </Button>
              )}

            <Button icon={<RedoOutlined />} onClick={redo}>
              Replay
            </Button>

            <Flex className="app-progress" justify="center" align="center">
              <Slider
                className="progress-bar"
                value={progress}
                onChange={(e) => {
                  setMute(true);
                  setNow(maxTime * e / 100);
                  if (!sliderChangeRef.current) {
                    sliderMuteRef.current = mute;
                  }
                  sliderChangeRef.current = true;
                }}
                onChangeComplete={(e) => {
                  setNow(maxTime * e / 100);
                  setMute(sliderMuteRef.current);
                  sliderChangeRef.current = false;
                }}
              />
              {progress}%
            </Flex>
          </Flex>
        </Flex>
        <Tabs
          activeKey={tab}
          onChange={(e) => {
            setTab(e as TabPanel);
          }}
          centered
          items={[
            {
              key: "Text",
              label: "Text",
              children: (
                <Flex className="score-main">
                  <Typography.Title>{score}</Typography.Title>
                </Flex>
              ),
            },
            {
              key: "Midi",
              label: "Midi",
              children: (
                <Flex className="app-rain">
                  <Rain
                    audioStyle={audioStyle}
                    layout={layout}
                    notes={notes}
                    now={now}
                    duration={10}
                    autoplay={autoplay}
                    mute={mute}
                  >
                  </Rain>
                </Flex>
              ),
            },
          ]}
          className="app-tab"
        />

        <Flex className="app-piano">
          <Piano
            audioStyle={audioStyle}
            layout={layout}
            mute={mute}
            showNote={showNote}
            showKey={showKey}
            showSolfa={showSolfa}
            textLevel={textLevel}
          />
        </Flex>
      </Flex>
    </ConfigProvider>
  );
}

export default App;
