export type Layout = "Full" | "Small";
import Notes from "./notes";

export function getKeyWidth(layout: Layout) {
  return `calc(100% / ${getWhiteKeys(layout).length})`;
}

export function getKeys(layout: Layout) {
  switch (layout) {
    case "Full":
      return Notes;
    case "Small": {
      const a = Notes.findIndex((i) => i.name === "C2");
      const b = Notes.findIndex((i) => i.name === "C7");
      return Notes.slice(a, b + 1);
    }
  }
}

export function getWhiteKeys(layout: Layout) {
  return getKeys(layout).filter((note) => !note.isBlack);
}

export function getBlackKeys(layout: Layout) {
  return getKeys(layout).filter((note) => note.isBlack);
}

export function getBlackOffsetX(index: number, layout: Layout) {
  switch (layout) {
    case "Full": {
      if (index === 0) {
        return 0.5;
      }
      let offset = 2.5;
      // index += 1;
      const five = ((index - 1) / 5) | 0;
      offset += five * 7;
      const mod = index % 5;
      offset += [5, 0, 1, 3, 4][mod];
      return offset;
    }
    case "Small": {
      let offset = 0.5;
      const five = (index / 5) | 0;
      offset += five * 7;
      const mod = index % 5;
      offset += [5, 0, 1, 3, 4][mod];
      return offset;
    }
  }
}
