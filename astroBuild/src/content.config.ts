import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

// Notes live at src/content/notes/<board>/<subject>/<topic-slug>.md
// No board/subject/topic frontmatter needed — all derived from the file path
// and looked up in paperPaths.json at build time.
const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    board: z.string(),
    subject: z.string(),
    topic: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, notes };
