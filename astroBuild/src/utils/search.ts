// utils/search.ts
function trigrams(str: string): Set<string> {
  const s = ` ${str.toLowerCase()} `;
  const result = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    result.add(s.slice(i, i + 3));
  }
  return result;
}

export function score(query: string, target: string): number {
  if (!query.trim()) return 1;
  if (target.toLowerCase().includes(query.toLowerCase())) return 1; // exact match always wins

  const qTri = trigrams(query);
  const tTri = trigrams(target);
  const intersection = [...qTri].filter((t) => tTri.has(t)).length;
  return (2 * intersection) / (qTri.size + tTri.size); // Dice coefficient
}

export function fuzzyFilter<T extends { name: string }>(
  items: T[],
  query: string,
  threshold = 0.2
): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, s: score(query, item.name) }))
    .filter(({ s }) => s >= threshold)
    .sort((a, b) => b.s - a.s)
    .map(({ item }) => item);
}