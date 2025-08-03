import Notes from "../src/notes";
import { writeFileSync } from "fs";
for (const i of Notes) {
  const url = `https://cdn.autopiano.cn/autopiano/samples/bright_piano/${
    i.name.replaceAll("#", "")
  }.mp3`;
  const buf = await fetch(url).then((i) => i.arrayBuffer());
  writeFileSync(`./src/assets/piano/${i.url}`, new Uint8Array(buf));
}
