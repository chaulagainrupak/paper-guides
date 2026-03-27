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
  if (target.toLowerCase().includes(query.toLowerCase())) return 1;
  const qTri = trigrams(query);
  const tTri = trigrams(target);
  const intersection = [...qTri].filter((t) => tTri.has(t)).length;
  return (2 * intersection) / (qTri.size + tTri.size);
}

export function fuzzyFilter<T extends { name: string }>(
  items: T[],
  query: string,
  {
    initialThreshold = 0.4,
    minThreshold = 0.1,
    step = 0.05,
  }: {
    initialThreshold?: number;
    minThreshold?: number;
    step?: number;
  } = {}
): T[] {
  if (!query.trim()) return items;

  // Pass 1: exact / substring matches
  const exactMatches = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  if (exactMatches.length > 0) return exactMatches;

  // Pass 2: fuzzy with progressive threshold relaxation
  const scored = items.map((item) => ({ item, s: score(query, item.name) }));

  let threshold = initialThreshold;
  while (threshold >= minThreshold) {
    const matches = scored
      .filter(({ s }) => s >= threshold)
      .sort((a, b) => b.s - a.s)
      .map(({ item }) => item);

    if (matches.length > 0) return matches;
    threshold = parseFloat((threshold - step).toFixed(10));
  }

  return [];
}