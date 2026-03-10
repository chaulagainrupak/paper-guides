
// "Mathematics (9709)" → "mathematics-9709"
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\(|\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// "mathematics-9709" → display fallback (real name always comes from API)
export function unslugify(slug: string): string {
  return slug.replace(/-/g, ' ');
}

// "2023 (May / June)" → { year: "2023", session: "may-june" }
export function parseYearString(yearStr: string): { year: string; session: string } | null {
  const match = yearStr.match(/^(\d{4})\s*\(([^)]+)\)$/);
  if (!match) return null;
  const year = match[1];
  const session = match[2]
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return { year, session };
}

// "2023" + "may-june" → "2023 (May / June)"
export function buildYearString(year: string, session: string): string {
  const sessionMap: Record<string, string> = {
    specimen: 'Specimen',
    'feb-mar': 'Feb / Mar',
    'may-june': 'May / June',
    'oct-nov': 'Oct / Nov',
  };
  return `${year} (${sessionMap[session] ?? session})`;
}

/**
 * Build the slug passed to getData.
 *
 * With the updated backend (searches for -question-paper- / -mark-scheme- anywhere),
 * we just need: {subjectSlug}-{question-paper|mark-scheme}-{code}-{year}-{session}
 *
 * The backend also receives ?subject=RealSubjectName so it uses that for the DB query.
 *
 * Example: "Accounting (9706)", "Question Paper", "12", "2023 (Feb / Mar)"
 *   → "accounting-9706-question-paper-12-2023-feb-mar"
 *
 * @param subjectName  Real subject name from API, e.g. "Accounting (9706)"
 * @param paperType    "Question Paper" | "Mark Scheme"
 * @param componentCode e.g. "12"
 * @param session      Raw session string from getPapers, e.g. "2023 (Feb / Mar)"
 */
export function buildPaperSlug(
  subjectName: string,
  paperType: 'Question Paper' | 'Mark Scheme',
  componentCode: string,
  session: string,
): string | null {
  const parsed = parseYearString(session);
  if (!parsed) return null;
  const subSlug = slugify(subjectName);
  const typeSlug = paperType === 'Question Paper' ? 'question-paper' : 'mark-scheme';
  const codeSlug = componentCode.toLowerCase().replace(/\s+/g, '-');
  return `${subSlug}-${typeSlug}-${codeSlug}-${parsed.year}-${parsed.session}`;
}

