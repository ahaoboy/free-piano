import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Piano } from "./components/Piano";
import {
  AutoComplete,
  type AutoCompleteProps,
  ConfigProvider,
  Flex,
  Switch,
  theme,
  Typography,
} from "antd";
import { getData, getItem, type Item } from "./api";
import Fuse from "fuse.js";
const { defaultAlgorithm, darkAlgorithm } = theme;
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const [showKey, setShowKey] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [showSolfa, setShowSolfa] = useState(false);
  const [options, setOptions] = React.useState<AutoCompleteProps["options"]>(
    [],
  );
  const [data, setData] = useState<Item[]>([]);
  const fuseRef = useRef<Fuse<Item>>(null);
  const [searchText, setSearchText] = useState("");
  const [score, setScore] = useState("");
  const [mute, setMute] = useState(false);

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
          </Flex>

          <Flex>
            <AutoComplete
              value={searchText}
              options={options}
              style={{ width: 200 }}
              onSearch={(text) => setOptions(getPanelValue(text))}
              placeholder="input here"
              onSelect={async (e) => {
                const txt = await getItem(e);
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
          </Flex>
        </Flex>

        <Flex className="score-main">
          <div dangerouslySetInnerHTML={{ __html: score }}></div>
        </Flex>
        <Flex>
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
