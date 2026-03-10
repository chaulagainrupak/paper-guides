
// Ported from the original Next.js parseMarkdown / renderMarkdown implementation.
// Usage: <MarkdownRenderer content={rawString} />

import { createElement, Fragment } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'underline'; children: InlineNode[] }
  | { type: 'strikethrough'; children: InlineNode[] }
  | { type: 'inlineCode'; code: string }
  | { type: 'coloredText'; children: InlineNode[]; color: string }
  | { type: 'customStyle'; className: string; children: InlineNode[] }
  | { type: 'rawBlock'; content: string };

type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'listItem'; children: InlineNode[] }
  | { type: 'horizontalRule' }
  | { type: 'codeBlock'; language: string; code: string }
  | { type: 'image'; alt: string; src: string; width: number | 'auto'; height: number | 'auto' }
  | { type: 'table'; headers: InlineNode[][]; rows: InlineNode[][][] }
  | { type: 'callout'; variant: 'exp' | 'tip' | 'warning'; children: BlockNode[] }
  | { type: 'featureBox'; variant: 'exp' | 'tip' | 'warning'; children: BlockNode[] }
  | { type: 'styledBlock'; className: string; children: BlockNode[] }
  | { type: 'customStyleBlock'; className: string; children: BlockNode[] }
  | { type: 'rawBlock'; content: string };

// ─── Parser ───────────────────────────────────────────────────────────────────

const blockPatterns = [
  // ── Multiline ──
  {
    name: 'table',
    regex: /!\[\n([\s\S]*?)\n\]/,
    multiline: true,
    handler: (match: RegExpExecArray): BlockNode => {
      const rows: string[][] = [];
      const lines = match[1].trim().split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          const cells = trimmed.slice(1, -1).trim().split(',').map(c => c.trim());
          rows.push(cells);
        }
      }
      return {
        type: 'table',
        headers: rows[0] ? rows[0].map(cell => parseInline(cell)) : [],
        rows: rows.slice(1).map(row => row.map(cell => parseInline(cell))),
      };
    },
  },
  {
    name: 'customStyleBlock',
    regex: /!{([^}]*)}\s*<\s*([\s\S]*?)\s*>/,
    multiline: true,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'customStyleBlock',
      className: match[1],
      children: parseBlock(match[2].trim()),
    }),
  },
  {
    name: 'styledBlock',
    regex: /!\s*\(([\s\S]*?)\)\s*<\s*([^>]+)\s*>/,
    multiline: true,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'styledBlock',
      className: match[2],
      children: parseBlock(match[1].trim()),
    }),
  },
  {
    name: 'callout',
    regex: /:::\s*\[(exp|tip|warning)\]\(([\s\S]*?)\)\s*:::/,
    multiline: true,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'callout',
      variant: match[1] as 'exp' | 'tip' | 'warning',
      children: parseBlock(match[2]),
    }),
  },
  {
    name: 'featureBox',
    regex: /:::\s*\[(tip|exp|warning)\|box\]\(([\s\S]*?)\)\s*:::/,
    multiline: true,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'featureBox',
      variant: match[1] as 'exp' | 'tip' | 'warning',
      children: parseBlock(match[2]),
    }),
  },
  {
    name: 'codeBlock',
    regex: /```(\w*)\n([\s\S]*?)```/,
    multiline: true,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'codeBlock',
      language: match[1] || 'text',
      code: match[2].trim(),
    }),
  },
  // ── Single-line (also usable inline) ──
  {
    name: 'rawBlock',
    regex: /!{{([\s\S]*?)}}!/,
    inline: true,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'rawBlock',
      content: match[1],
    }),
  },
  {
    name: 'heading',
    regex: /^(#{1,6})\s+(.*)/,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'heading',
      level: match[1].length,
      children: parseInline(match[2]),
    }),
  },
  {
    name: 'horizontalRule',
    regex: /^-{3,}$/,
    handler: (): BlockNode => ({ type: 'horizontalRule' }),
  },
  {
    name: 'blockquote',
    regex: />\s+(.*)/,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'blockquote',
      children: parseInline(match[1]),
    }),
  },
  {
    name: 'listItem',
    regex: /-\s+(.*)/,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'listItem',
      children: parseInline(match[1]),
    }),
  },
  {
    name: 'image',
    regex: /!\[(.*?)\]\((.*?)\)\s*(?:\((.*?),(.*?)\))?/,
    handler: (match: RegExpExecArray): BlockNode => ({
      type: 'image',
      alt: match[1],
      src: match[2],
      width: match[3] ? parseInt(match[3]) : 'auto',
      height: match[4] ? parseInt(match[4]) : 'auto',
    }),
  },
];

const inlinePatterns = [
  {
    name: 'rawBlock',
    regex: /!{{([\s\S]*?)}}!/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'rawBlock',
      content: match[1],
    }),
  },
  {
    name: 'strikethrough',
    regex: /~~(.*?)~~/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'strikethrough',
      children: parseInline(match[1]),
    }),
  },
  {
    name: 'underline',
    regex: /__(.*?)__/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'underline',
      children: parseInline(match[1]),
    }),
  },
  {
    name: 'bold',
    regex: /\*\*(.*?)\*\*/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'bold',
      children: parseInline(match[1]),
    }),
  },
  {
    name: 'italic',
    regex: /_(.*?)_/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'italic',
      children: parseInline(match[1]),
    }),
  },
  {
    name: 'coloredText',
    regex: /!\[(.*?)\]{(.*?)}/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'coloredText',
      children: parseInline(match[1]),
      color: match[2],
    }),
  },
  {
    name: 'customStyle',
    regex: /!{([^}]*?)}\[(.*?)\]/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'customStyle',
      className: match[1],
      children: parseInline(match[2]),
    }),
  },
  {
    name: 'inlineCode',
    regex: /`([^`]+)`/,
    handler: (match: RegExpExecArray): InlineNode => ({
      type: 'inlineCode',
      code: match[1],
    }),
  },
];

function parseBlock(text: string): BlockNode[] {
  const result: BlockNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;

    // Try multiline patterns first
    for (const pattern of blockPatterns.filter(p => p.multiline)) {
      const match = pattern.regex.exec(remaining);
      if (match && match.index === 0) {
        result.push(pattern.handler(match));
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Try single-line patterns
    const lineEnd = remaining.indexOf('\n');
    const line = lineEnd === -1 ? remaining : remaining.slice(0, lineEnd);
    remaining = lineEnd === -1 ? '' : remaining.slice(lineEnd + 1);

    if (line.trim() === '') continue;

    let lineMatched = false;
    for (const pattern of blockPatterns.filter(p => !p.multiline)) {
      const match = pattern.regex.exec(line);
      if (match && match.index === 0) {
        result.push(pattern.handler(match));
        lineMatched = true;
        break;
      }
    }

    if (!lineMatched) {
      result.push({ type: 'paragraph', children: parseInline(line) });
    }
  }

  return result;
}

function parseInline(text: string): InlineNode[] {
  const result: InlineNode[] = [];
  let position = 0;
  let lastIndex = 0;

  while (position < text.length) {
    let matched = false;

    for (const pattern of inlinePatterns) {
      const match = pattern.regex.exec(text.slice(position));
      if (match && match.index === 0) {
        if (position > lastIndex) {
          result.push({ type: 'text', value: text.slice(lastIndex, position) });
        }
        result.push(pattern.handler(match));
        position += match[0].length;
        lastIndex = position;
        matched = true;
        break;
      }
    }

    if (!matched) position++;
  }

  if (lastIndex < text.length) {
    result.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return result;
}

export function parseMarkdown(content: string): BlockNode[] {
  return parseBlock(content);
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

const styleMap = {
  heading: (level: number) =>
    `font-bold mb-4 mt-6 ${[
      'text-5xl sm:text-3xl',
      'text-4xl sm:text-2xl',
      'text-3xl sm:text-xl',
      'text-2xl sm:text-lg',
      'text-xl sm:text-base',
      'text-lg',
    ][level - 1] ?? 'text-base'}`,
  strikethrough: 'line-through opacity-70',
  underline: 'underline',
  bold: 'font-bold',
  italic: 'italic',
  blockquote: 'border-l-4 pl-4 italic opacity-80 my-3',
  listItem: 'ml-4 mb-1 list-disc',
  horizontalRule: 'border-t border-gray-300 opacity-60 my-4',
  coloredText: 'my-2 text-sm sm:text-base md:text-lg leading-relaxed',
  paragraph: 'my-2 text-sm sm:text-base md:text-lg leading-relaxed',
  codeBlock: 'bg-gray-800 text-green-300 p-4 rounded my-4 overflow-x-auto font-mono text-sm',
  inlineCode: 'bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono text-sm',
  table: 'table-auto border-collapse border border-gray-300 my-4 w-full',
  tableHeader: 'border border-gray-300 px-4 py-2 font-bold bg-gray-100',
  tableCell: 'border border-gray-300 px-4 py-2',
};

const variantStyles: Record<string, { color: string; title: string }> = {
  tip: { color: 'var(--blue-highlight)', title: 'TIP!' },
  exp: { color: 'var(--green-highlight)', title: 'EXPLANATION' },
  warning: { color: 'var(--pink-highlight)', title: 'WARNING!' },
};

function RenderNodes({ nodes }: { nodes: (BlockNode | InlineNode)[] }): React.ReactElement {
  return createElement(Fragment, null, ...nodes.map((node, i) => renderNode(node, i)));
}

function renderNode(node: BlockNode | InlineNode, index: number): React.ReactElement | null {
  switch (node.type) {
    case 'heading': {
      const tag = `h${node.level}` as keyof JSX.IntrinsicElements;
      return createElement(tag, { key: `h-${index}`, className: styleMap.heading(node.level) },
        createElement(RenderNodes, { nodes: node.children }));
    }

    case 'paragraph':
      return createElement('p', { key: `p-${index}`, className: styleMap.paragraph },
        createElement(RenderNodes, { nodes: node.children }));

    case 'bold':
      return createElement('strong', { key: `b-${index}`, className: styleMap.bold },
        createElement(RenderNodes, { nodes: node.children }));

    case 'italic':
      return createElement('em', { key: `i-${index}`, className: styleMap.italic },
        createElement(RenderNodes, { nodes: node.children }));

    case 'underline':
      return createElement('u', { key: `u-${index}`, className: styleMap.underline },
        createElement(RenderNodes, { nodes: node.children }));

    case 'strikethrough':
      return createElement('del', { key: `del-${index}`, className: styleMap.strikethrough },
        createElement(RenderNodes, { nodes: node.children }));

    case 'blockquote':
      return createElement('blockquote', { key: `bq-${index}`, className: styleMap.blockquote },
        createElement(RenderNodes, { nodes: node.children }));

    case 'listItem':
      return createElement('li', { key: `li-${index}`, className: styleMap.listItem },
        createElement(RenderNodes, { nodes: node.children }));

    case 'horizontalRule':
      return createElement('hr', { key: `hr-${index}`, className: styleMap.horizontalRule });

    case 'inlineCode':
      return createElement('code', { key: `ic-${index}`, className: styleMap.inlineCode }, node.code);

    case 'codeBlock':
      return createElement('pre', { key: `pre-${index}`, className: styleMap.codeBlock },
        createElement('code', null, node.code));

    case 'rawBlock':
      return createElement('span', { key: `raw-${index}` }, node.content);

    case 'text':
      return createElement('span', { key: `txt-${index}` }, node.value);

    case 'coloredText':
      return createElement('span', {
        key: `col-${index}`,
        className: styleMap.coloredText,
        style: { color: `var(--${node.color})` },
      }, createElement(RenderNodes, { nodes: node.children }));

    case 'customStyle':
      return createElement('span', { key: `cs-${index}`, className: node.className },
        createElement(RenderNodes, { nodes: node.children }));

    case 'customStyleBlock':
      return createElement('div', { key: `csb-${index}`, className: `${node.className} p-3 my-2 rounded` },
        createElement(RenderNodes, { nodes: node.children }));

    case 'styledBlock':
      return createElement('div', { key: `sb-${index}`, className: `${node.className} p-3 my-2 rounded` },
        createElement(RenderNodes, { nodes: node.children }));

    case 'image': {
      const w = node.width === 'auto' ? undefined : node.width;
      const h = node.height === 'auto' ? undefined : node.height;
      return createElement('div', {
        key: `img-${index}`,
        className: 'border rounded-md shadow-sm flex flex-col w-fit h-fit my-4 mx-auto',
      },
        createElement('img', {
          src: node.src,
          alt: node.alt,
          style: { width: w, height: h, objectFit: 'contain' },
          className: 'rounded-md mb-2',
        }),
        node.alt && createElement('p', { className: 'text-center text-xs opacity-70 italic px-2 pb-2' }, node.alt),
      );
    }

    case 'callout': {
      const { color, title } = variantStyles[node.variant] ?? variantStyles.tip;
      return createElement('details', { key: `callout-${index}`, className: 'my-6 rounded-lg w-full max-w-3xl mx-auto' },
        createElement('summary', {
          className: 'relative px-4 py-3 font-bold text-2xl text-white cursor-pointer flex items-center justify-between rounded-lg',
        },
          createElement('div', { className: 'absolute inset-0 rounded-lg', style: { backgroundColor: color } }),
          createElement('span', { className: 'relative z-10 text-center flex-grow' }, title),
          createElement('svg', {
            className: 'relative z-10 w-5 h-5',
            fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24',
          },
            createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 3, d: 'M19 9l-7 7-7-7' })
          ),
        ),
        createElement('div', { className: 'text-black px-4 py-3 bg-gray-100 rounded-b-lg' },
          createElement('div', { className: 'relative z-10' },
            createElement(RenderNodes, { nodes: node.children })
          )
        ),
      );
    }

    case 'featureBox': {
      const v = variantStyles[node.variant] ?? variantStyles.tip;
      return createElement('div', {
        key: `fb-${index}`,
        className: 'rounded-lg my-4 overflow-hidden w-full max-w-3xl mx-auto',
        style: { border: `1px dashed ${v.color}` },
      },
        createElement('div', {
          className: 'px-4 py-3 font-bold text-white text-2xl relative text-center flex items-center justify-center',
          style: { backgroundColor: v.color },
        },
          createElement('div', { className: 'absolute inset-0', style: { backgroundColor: v.color, opacity: 0.6 } }),
          createElement('span', { className: 'relative z-10' }, v.title),
        ),
        createElement('div', { className: 'text-black px-4 py-3 bg-gray-100 relative' },
          createElement('div', { className: 'absolute inset-0', style: { backgroundColor: v.color, opacity: 0.1 } }),
          createElement('div', { className: 'relative z-10' },
            createElement(RenderNodes, { nodes: node.children })
          ),
        ),
      );
    }

    case 'table':
      return createElement('div', { key: `tw-${index}`, className: 'overflow-x-auto' },
        createElement('table', { className: styleMap.table },
          createElement('thead', null,
            createElement('tr', null,
              ...node.headers.map((header, i) =>
                createElement('th', { key: `th-${i}`, className: styleMap.tableHeader },
                  createElement(RenderNodes, { nodes: header })
                )
              )
            )
          ),
          createElement('tbody', null,
            ...node.rows.map((row, ri) =>
              createElement('tr', { key: `tr-${ri}` },
                ...row.map((cell, ci) =>
                  createElement('td', { key: `td-${ci}`, className: styleMap.tableCell },
                    createElement(RenderNodes, { nodes: cell })
                  )
                )
              )
            )
          ),
        ),
      );

    default:
      return null;
  }
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function MarkdownRenderer({ content }: { content: string }) {
  const ast = parseMarkdown(content);
  return createElement('div', { className: 'markdown-content' },
    createElement(RenderNodes, { nodes: ast })
  );
}

