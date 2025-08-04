import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Piano } from "./components/Piano";
import {
  AutoComplete,
  type AutoCompleteProps,
  Button,
  ConfigProvider,
  Flex,
  Switch,
  theme,
  Typography,
  Upload,
} from "antd";
import { getData, getItem, type Item } from "./api";
import Fuse from "fuse.js";
import { Rain } from "./components/Rain";
const { defaultAlgorithm, darkAlgorithm } = theme;
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
import {
  GithubOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { decode, NoteEvent } from "free-piano-midi";

const FPS = 10;

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

  const invRef = useRef<number>(0);
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
    invRef.current = +setInterval(() => setNow((i) => i + 1 / FPS), 1000 / FPS);
    console.log("play", invRef.current);
  }
  function pause() {
    console.log("pause", invRef.current);
    clearInterval(invRef.current);
  }
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
          gap={"small"}
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
            </Flex>

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
                const ext = info.file.name.split('.').at(-1) || ''
                console.log('ext', ext)
                if (["txt"].includes(ext)) {
                  const txt = (await info.file.originFileObj?.text())
                  setScore(txt || "");
                  return;
                }
                if ("html".includes(ext)) {
                  const html = (await info.file.originFileObj?.text()) || ''
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, "text/html");
                  const txt = doc.body.textContent || "";
                  setScore(txt || "");
                  return;
                }

                if (info.file.status === "done") {
                  return;
                }

                setData([]);
                const file = info.file.originFileObj;
                if (!file) {
                  return;
                }
                const fileBuffer = new Uint8Array(await file.arrayBuffer());
                const v = await decode(fileBuffer);
                setNotes(v || []);
                play();
              }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
            <Button icon={<PauseOutlined />} onClick={pause}>Pause</Button>
            <Button icon={<PlayCircleOutlined />} onClick={play}>Play</Button>
          </Flex>
        </Flex>

        <Flex className="score-main">
          <div dangerouslySetInnerHTML={{ __html: score }}></div>
        </Flex>
        <Flex>
        </Flex>

        <Flex className="app-rain">
          {!!notes.length && (
            <Rain notes={notes} now={now} duration={10} autoplay={autoplay}>
            </Rain>
          )}
        </Flex>
        <Flex className="app-piano">
          <Piano
            mute={mute}
            showNote={showNote}
            showKey={showKey}
            showSolfa={showSolfa}
          />
        </Flex>
      </Flex>
    </ConfigProvider>
  );
}

export default App;
