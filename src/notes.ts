import { getNoteName, isBlack } from "./keymap";
export type Note = {
  midi: number;
  name: string;
  isBlack: boolean;
};
export const Notes: Note[] = Array(88).fill(0).map((_, i) => {
  const midi = i + 21;
  const name = getNoteName(midi);
  return {
    midi,
    name,
    isBlack: isBlack(midi),
  };
});
