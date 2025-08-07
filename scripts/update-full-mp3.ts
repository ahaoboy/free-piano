import { writeFileSync } from "fs";
const opt = {
  "headers": {
    "accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "priority": "u=0, i",
    "sec-ch-ua":
      '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
  },
  "body": null,
  "method": "GET",
};

for (let i = 0; i <= 255; i++) {
  const url = `https://cdn.pianotify.com/samples/acoustic_grand_piano/${i}.mp3`;
  try {
    console.log(url);
    const resp = await fetch(url, opt);
    if (resp.status !== 200) {
      continue;
    }
    const buf = await resp.arrayBuffer();
    writeFileSync(`./src/assets/piano-full/${i}.mp3`, new Uint8Array(buf));
  } catch (e) {
    console.log("error", e);
  }
}
