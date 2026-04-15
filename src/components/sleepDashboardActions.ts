export interface EditableSleepEntry {
  date: string;
  score: number;
}

export function beginEntryEdit(
  entry: EditableSleepEntry,
  setDate: (date: string) => void,
  setScore: (score: number) => void
) {
  setDate(entry.date);
  setScore(entry.score);
}
