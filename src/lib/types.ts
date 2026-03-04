export interface InboxItemRow {
  id: number;
  text: string;
  created_at: string;
  resolved_at: string | null;
  destination: string | null;
}

export interface InboxItemDisplay {
  id: number;
  text: string;
  created_at: string;
  date: string;
  age: string;
  stale: boolean;
}
