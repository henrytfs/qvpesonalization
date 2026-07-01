export function splitTextIntoLines(value: string, maxChars = 42): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function textAnchor(align?: "left" | "center" | "right") {
  if (align === "left") return "start";
  if (align === "right") return "end";
  return "middle";
}
