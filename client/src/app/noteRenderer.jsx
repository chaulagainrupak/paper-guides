"use client";

// MARKDOWN PARSER
export function parseMarkdown(content) {
  const ast = [];
  const blockPatterns = [
    // Raw blocks - must come first
    {
      name: "rawBlock",
      regex: /!{{([\s\S]*?)}}!/,
      handler: (match) => ({
        type: "rawBlock",
        content: match[1],
      }),
      inline: true
    },
    // Headings
    {
      name: "heading",
      regex: /^(#{1,6})\s+(.*)/,
      handler: (match) => ({
        type: "heading",
        level: match[1].length,
        children: parseInline(match[2]),
      }),
    },
    // Horizontal rule must come before other patterns
    {
      name: "horizontalRule",
      regex: /^-{3,}$/,
      handler: () => ({ type: "horizontalRule" }),
    },
    // Block elements
    {
      name: "blockquote",
      regex: />\s+(.*)/,
      handler: (match) => ({
        type: "blockquote",
        children: parseInline(match[1]),
      }),
    },
    {
      name: "listItem",
      regex: /-\s+(.*)/,
      handler: (match) => ({
        type: "listItem",
        children: parseInline(match[1]),
      }),
    },
    // Callouts - moved higher in priority
    {
      name: "callout",
      regex: /:::\s*\[(exp|tip|warning)\]\((.*?)\)\s*:::/s,
      handler: (match) => ({
        type: "callout",
        variant: match[1],
        children: parseBlock(match[2]),
      }),
    },
    {
      name: "featureBox",
      regex: /:::\s*\[(tip|exp|warning)\|box\]\(([\s\S]*?)\)\s*:::/s,
      handler: (match) => ({
        type: "featureBox",
        variant: match[1],
        children: parseBlock(match[2]),
      }),
    },
    // Custom styling blocks
    {
      name: "customStyleBlock",
      regex: /!{([^}]*)}\s*<\s*([\s\S]*?)\s*>/s,
      handler: (match) => ({
        type: "customStyleBlock",
        className: match[1],
        children: parseBlock(match[2].trim()),
      }),
    },
    {
      name: "styledBlock",
      regex: /!\s*\(([\s\S]*?)\)\s*<\s*([^>]+)\s*>/s,
      handler: (match) => ({
        type: "styledBlock",
        className: match[2],
        children: parseBlock(match[1].trim()),
      }),
    },
    // Text decorations
    {
      name: "strikethrough",
      regex: /~~(.*?)~~/,
      handler: (match) => ({
        type: "strikethrough",
        children: parseInline(match[1]),
      }),
      inline: true
    },
    {
      name: "underline",
      regex: /__(.*?)__/,
      handler: (match) => ({
        type: "underline",
        children: parseInline(match[1]),
      }),
      inline: true
    },
    {
      name: "bold",
      regex: /\*\*(.*?)\*\*/,
      handler: (match) => ({
        type: "bold",
        children: parseInline(match[1]),
      }),
      inline: true
    },
    {
      name: "italic",
      regex: /_(.*?)_/,
      handler: (match) => ({
        type: "italic",
        children: parseInline(match[1]),
      }),
      inline: true
    },
    // Custom styling
    {
      name: "coloredText",
      regex: /!\[(.*?)\]{(.*?)}/,
      handler: (match) => ({
        type: "coloredText",
        children: parseInline(match[1]),
        color: match[2],
      }),
      inline: true
    },
    {
      name: "customStyle",
      regex: /!{([^}]*)}\[(.*?)\]/,
      handler: (match) => ({
        type: "customStyle",
        className: match[1],
        children: parseInline(match[2]),
      }),
      inline: true
    },
    // Images
    {
      name: "image",
      regex: /!\[(.*?)\]\((.*?)\)\s*(?:\((.*?),(.*?)\))/,
      handler: (match) => ({
        type: "image",
        alt: match[1],
        src: match[2],
        width: match[3] ? parseInt(match[3]) : auto,
        height: match[4] ? parseInt(match[4]) : auto,
      }),
    },
    // Code blocks
    {
      name: "codeBlock",
      regex: /```(\w*)\n([\s\S]*?)```/,
      handler: (match) => ({
        type: "codeBlock",
        language: match[1] || "text",
        code: match[2].trim(),
      }),
    },
    {
      name: "inlineCode",
      regex: /`([^`]+)`/,
      handler: (match) => ({
        type: "inlineCode",
        code: match[1],
      }),
      inline: true
    },
  ];

  function parseBlock(text) {
    const result = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.trim() === '') continue;

      let matched = false;
      for (const pattern of blockPatterns) {
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(line);
        if (match && match.index === 0) {
          result.push(pattern.handler(match));
          matched = true;
          break;
        }
      }

      if (!matched) {
        result.push({
          type: "paragraph",
          children: parseInline(line),
        });
      }
    }

    return result;
  }

  function parseInline(text) {
    const result = [];
    let position = 0;
    let lastIndex = 0;

    while (position < text.length) {
      let matched = false;

      for (const pattern of blockPatterns.filter(p => p.inline)) {
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(text.slice(position));

        if (match && match.index === 0) {
          if (position > lastIndex) {
            result.push({
              type: "text",
              value: text.slice(lastIndex, position),
            });
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
      result.push({
        type: "text",
        value: text.slice(lastIndex),
      });
    }

    return result;
  }

  // Process content
  return parseBlock(content);
}

// MARKDOWN RENDERER
export function renderMarkdown(ast) {
  const styleMap = {
    heading: (level) =>
      `font-bold mb-4 mt-6 ${["text-5xl sm:text-3xl", "text-4xl sm:text-2xl", "text-3lg sm:text-xl",
        "text-base sm:text-lg", "text-sm sm:text-base", "text-xs"][level - 1]
      }`,
    strikethrough: "line-through opacity-70",
    underline: "underline",
    bold: "font-bold",
    italic: "italic",
    blockquote: "border-l-4 pl-4 italic opacity-80 my-3",
    listItem: "ml-4 mb-1",
    horizontalRule: "border-t border-gray-300 opacity-60 my-4",
    coloredText: "my-2 text-sm sm:text-base md:text-lg leading-relaxed",
    paragraph: "my-2 text-sm sm:text-base md:text-lg leading-relaxed",
    codeBlock: "bg-gray-800 text-white p-4 rounded my-4 overflow-x-auto font-mono text-sm",
    inlineCode: "bg-gray-200 px-1.5 py-0.5 rounded font-mono text-sm",
    rawBlock: "", // No styling for raw blocks
  };

  const variantStyles = {
    tip: {
      color: "var(--blue-highlight)",
      title: "TIP!"
    },
    exp: {
      color: "var(--green-highlight)",
      title: "EXPLANATION"
    },
    warning: {
      color: "var(--pink-highlight)",
      title: "WARNING!"
    },
  };

  const renderNode = (node, index) => {
    switch (node.type) {
      case "heading":
        const HeadingTag = `h${node.level}`;
        return (
          <HeadingTag
            key={`heading-${index}`}
            className={styleMap.heading(node.level)}
          >
            {renderMarkdown(node.children)}
          </HeadingTag>
        );

      case "strikethrough":
        return (
          <del key={`del-${index}`} className={styleMap.strikethrough}>
            {renderMarkdown(node.children)}
          </del>
        );

      case "underline":
        return (
          <u key={`u-${index}`} className={styleMap.underline}>
            {renderMarkdown(node.children)}
          </u>
        );

      case "bold":
        return (
          <strong key={`strong-${index}`} className={styleMap.bold}>
            {renderMarkdown(node.children)}
          </strong>
        );

      case "italic":
        return (
          <em key={`em-${index}`} className={styleMap.italic}>
            {renderMarkdown(node.children)}
          </em>
        );

      case "blockquote":
        return (
          <blockquote key={`blockquote-${index}`} className={styleMap.blockquote}>
            {renderMarkdown(node.children)}
          </blockquote>
        );

      case "listItem":
        return (
          <li key={`li-${index}`} className={styleMap.listItem}>
            {renderMarkdown(node.children)}
          </li>
        );

      case "horizontalRule":
        return <hr key={`hr-${index}`} className={styleMap.horizontalRule} />;

      case "coloredText":
        return (
          <span
            key={`color-${index}`}
            className={styleMap.coloredText}
            style={{ color: `var(--${node.color})` }}
          >
            {renderMarkdown(node.children)}
          </span>
        );

      case "customStyle":
      case "customStyleBlock":
        return (
          <div
            key={`custom-${index}`}
            className={`${node.className} p-3 my-2 rounded`}
          >
            {renderMarkdown(node.children)}
          </div>
        );

      case "image":
        const width = node.width || "auto";
        const height = node.height || "auto";
        return (
          <div key={`img-${index}`} className="border rounded-md shadow-sm flex flex-col w-fit h-fit my-4">
            <img
              src={node.src}
              alt={node.alt}
              style={{ width, height, objectFit: "contain" }}
              className="rounded-md mb-2"
            />
            <p className="text-center text-xs opacity-70 italic px-2 pb-2">
              {node.alt}
            </p>
          </div>
        );

      case "styledBlock":
        return (
          <div
            key={`styled-${index}`}
            className={`${node.className} p-3 my-2 rounded`}
          >
            {renderMarkdown(node.children)}
          </div>
        );

      case "callout":
        const { color, title } = variantStyles[node.variant];
        return (
          <details
            key={`callout-${index}`}
            className="my-6 rounded-lg  w-full max-w-3xl mx-auto"
            style={{}}
          >
            <summary className="relative px-4 py-3 font-bold text-2xl text-white cursor-pointer flex items-center justify-between rounded-lg">
              <div
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: color}}
              />
              <span className="relative z-10 text-center flex-grow">{title}</span>
              <svg
                className="relative z-10 w-5 h-5 transition-transform duration-200 transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="text-black relative px-4 py-3 bg-gray-100 rounded-b-lg">
              <div className="relative z-10">
                {renderMarkdown(node.children)}
              </div>
            </div>
          </details>
        );

      case "featureBox":
        const variant = variantStyles[node.variant];
        return (
          <div
            key={`feature-${index}`}
            className="rounded-lg my-4 overflow-hidden w-fit max-w-full mx-auto"
            style={{ border: `1px dashed ${variant.color}` }}
          >
            <div
              className="px-4 py-3 font-bold text-white text-2xl relative text-center flex items-center justify-center"
              style={{ backgroundColor: variant.color }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: variant.color, opacity: 0.6 }}
              />
              <span className="relative z-10">{variant.title}</span>
            </div>
            <div className="text-black px-4 py-3 bg-gray-100 relative">
              <div
                className="absolute inset-0"
                style={{ backgroundColor: variant.color, opacity: 0.1 }}
              />
              <div className="relative z-10">
                {renderMarkdown(node.children)}
              </div>
            </div>
          </div>
        );
      case "codeBlock":
        return (
          <pre key={`pre-${index}`} className={styleMap.codeBlock}>
            <code>{node.code}</code>
          </pre>
        );

      case "inlineCode":
        return (
          <code key={`code-${index}`} className={styleMap.inlineCode}>
            {node.code}
          </code>
        );

      case "rawBlock":
        return (
          <span key={`raw-${index}`} className={styleMap.rawBlock}>
            {node.content}
          </span>
        );

      case "paragraph":
        return (
          <p key={`p-${index}`} className={styleMap.paragraph}>
            {renderMarkdown(node.children)}
          </p>
        );

      case "text":
        return <span key={`text-${index}`}>{node.value}</span>;

      default:
        return null;
    }
  };

  if (Array.isArray(ast)) {
    return ast.map((node, index) => renderNode(node, index));
  }
  return renderNode(ast, 0);
}

// MAIN COMPONENT
export function noteRenderer(content) {
  const ast = parseMarkdown(content);
  return <div className="markdown-content">{renderMarkdown(ast)}</div>;
}