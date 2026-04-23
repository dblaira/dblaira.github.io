import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type ParableFrontmatter = {
  title: string;
  summary: string;
  date: string;
  slug: string;
};

export type ParableListItem = ParableFrontmatter;

export type Parable = ParableFrontmatter & {
  body: string;
};

const PARABLES_DIR = path.join(process.cwd(), "src", "content", "parables");

function readParableFiles(): string[] {
  if (!fs.existsSync(PARABLES_DIR)) return [];
  return fs
    .readdirSync(PARABLES_DIR)
    .filter((f) => f.endsWith(".md"));
}

// YAML parses bare YYYY-MM-DD into a Date object. Normalize to an ISO string
// (YYYY-MM-DD) so downstream formatters can treat it consistently.
function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

export function getAllParables(): ParableListItem[] {
  const files = readParableFiles();
  const items = files.map((file): ParableListItem => {
    const raw = fs.readFileSync(path.join(PARABLES_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      title: data.title ?? "",
      summary: data.summary ?? "",
      date: normalizeDate(data.date),
      slug: data.slug ?? file.replace(/\.md$/, ""),
    };
  });
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getParable(slug: string): Promise<Parable | null> {
  const filePath = path.join(PARABLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  return {
    title: data.title ?? "",
    summary: data.summary ?? "",
    date: normalizeDate(data.date),
    slug: data.slug ?? slug,
    body: processed.toString(),
  };
}

export function getAllParableSlugs(): string[] {
  return readParableFiles().map((f) => f.replace(/\.md$/, ""));
}
