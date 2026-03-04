type MaterialItem = {
  seq: number;
  content: string;
};

export function splitMaterialText(text: string): MaterialItem[] {
  return text
    .replaceAll("\r\n", "\n")
    .split(/\n\s*\n+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((content, index) => ({
      seq: index + 1,
      content
    }));
}

export function joinMaterialsToText(materials: MaterialItem[]): string {
  return materials
    .slice()
    .sort((a, b) => a.seq - b.seq)
    .map((item) => item.content.trim())
    .filter((content) => content.length > 0)
    .join("\n\n");
}
