"use client";

import { useEffect } from "react";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function noteRenderer(content) {
  const navList = [];

  const regList = [
    {
      regex: /^(#{1,6})\s+(.*)/,
      contentPos: 2,
      tag: "h",
      dynamicLevelFrom: 1,
      styleMap: {
        default: "font-bold",
        lengthMap: {
          1: "text-5xl",
          2: "text-4xl",
          3: "text-3xl",
          4: "text-2xl",
          5: "text-xl",
          6: "text-lg",
        },
      },
    },
    {
      regex: /~~(.*?)~~/,
      contentPos: 1,
      tag: "del",
      styleMap: { default: "line-through" },
    },
    {
      regex: /__(.*?)__/,
      contentPos: 1,
      tag: "u",
      styleMap: { default: "underline" },
    },
    {
      regex: /\*\*(.*?)\*\*/,
      contentPos: 1,
      tag: "strong",
      styleMap: { default: "font-bold" },
    },
    {
      regex: /_(.*?)_/,
      contentPos: 1,
      tag: "em",
      styleMap: { default: "italic" },
    },
    {
      regex: />\s+(.*)/,
      contentPos: 1,
      tag: "blockquote",
      styleMap: {
        default: "border-l-4 pl-4 italic text-gray-500",
      },
    },
    {
      regex: /-\s+(.*)/,
      contentPos: 1,
      tag: "li",
      styleMap: { default: "" },
    },
    {
      regex: /!\[(.*?)]{(.*?)}/,
      contentPos: 1,
      tag: "span",
      dynamicLevelFrom: 2,
      styleMap: { default: "" },
      render: (tag, text, color) => {
        const Tag = tag;
        return (
          <Tag key={`${text}-${color}`} style={{ color: `var(--${color})` }}>
            {text}
          </Tag>
        );
      },
    },

    {
      regex: /!\[(.*?)\]\((.*?)\)\((.*?),(.*?)\){(.*?)}/,
      multiContentPos: [2, 5],
      multiDynamicFrom: [1, 3, 4],
      styleMap: { default: "" },
      render: (tag, alt, width, height, src) => {
        if (tag === "img") {
          const parsedWidth = parseInt(width) === 0 ? "auto" : `${width}px`;
          const parsedHeight = parseInt(height) === 0 ? "auto" : `${height}px`;
          return (
            <div
              key={`${alt}-${src}`}
              className="border rounded-md shadow-sm flex flex-col w-fit h-fit"
            >
              <img
                src={src}
                alt={alt}
                style={{
                  width: parsedWidth,
                  height: parsedHeight,
                  objectFit: "contain",
                }}
                className="rounded-md mb-2"
              />
              <p className="text-center !text-2xs dark:text-gray-500 italic bg-white">
                {alt}
              </p>
            </div>
          );
        }
        return null;
      },
    },
    {
      regex: /!\((.+?)\)<(.+?)>/,
      multiContentPos: [1, 2],
      render: (content, className) => {
        return (
          <div
            className={`flex ${className.trim()}`}
            key={`div-${content.slice(0, 10)}`}
          >
            {parseInline(content)}
          </div>
        );
      },
    },
    {
  regex: /:{3}\n?\[(exp|tip|warning)\]\n?\((.*?)\)\n?:{3}/,
  multiContentPos: [1, 2],
  render: (type, content) => {
    const titles  = { exp: "Explanation", tip: "Tip", warning: "Warning" };
    const bgClass = {
      exp:    "bg-exp",
      tip:    "bg-tip",
      warning:"bg-warning",
    }[type];

    return (
      <details
        key={`${type}-${content.slice(0,20)}`}
        className={`m-6 p-4 rounded ${bgClass}`}
      >
        <summary className="cursor-pointer text-xl font-medium">
          {titles[type]}
        </summary>
        <div className="mt-2">
          {parseInline(content)}
        </div>
      </details>
    );
  },
},

  ];

  useEffect(() => {
    const navigationDest = document.getElementById("notes-navigation");
    if (!navigationDest) return;

    navigationDest.innerHTML = "";

    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach((heading) => {
      const text = heading.innerText;
      const slug = slugify(text);
      heading.id = slug;

      const link = generateNavLink(text, slug);

      navigationDest.appendChild(link);
    });
  }, [content]);

  function parseInline(text, depth = 0) {
    const children = [];
    let pos = 0;

    while (pos < text.length) {
      let matched = false;

      for (const reg of regList) {
        reg.regex.lastIndex = 0;
        const slice = text.slice(pos);
        const match = slice.match(reg.regex);
        if (!match || match.index !== 0) continue;

        matched = true;

        if (typeof reg.render === "function") {
          if (reg.multiContentPos || reg.multiDynamicFrom || reg.foreRender) {
            children.push(reg.render(...match.slice(1)));
          } else {
            children.push(
              reg.render(
                reg.tag,
                match[reg.contentPos],
                match[reg.dynamicLevelFrom]
              )
            );
          }
        } else {
          let tagName = reg.tag;
          let className = reg.styleMap?.default || "";

          if (reg.dynamicLevelFrom && reg.styleMap?.lengthMap) {
            const level = Math.min(match[reg.dynamicLevelFrom].length, 6);
            tagName = `${reg.tag}${level}`;
            className = `${reg.styleMap.lengthMap[level]} ${className}`;
          }

          const Tag = tagName;
          const inner = parseInline(match[reg.contentPos], depth + 1);

          console.log(match[reg.contentPos]);
          navList.push(
            generateNavLink(match[reg.contentPos], `${depth}-${pos}`)
          );
          console.log(navList);
          children.push(
            <Tag
              id={`${depth}-${pos}`}
              key={`${depth}-${pos}`}
              className={`${className} inline-block`}
            >
              {inner}
            </Tag>
          );
        }

        pos += match[0].length;
        break;
      }

      if (!matched) {
        children.push(text[pos]);
        pos++;
      }
    }

    return children;
  }

  const parsedContent = content.split("\n").map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === "") return <br key={index} />;
    return <div key={index}>{parseInline(trimmedLine)}</div>;
  });

  return <>{parsedContent}</>;
}

function generateNavLink(linkText, targetId) {
  const link = document.createElement("a");
  link.href = `#${targetId}`;
  link.textContent = linkText;

  // styling
  link.style.display = "block";
  link.style.marginBottom = "0.5rem";
  link.style.padding = "0.25rem 0.5rem";
  link.style.borderRadius = "0.375rem";
  link.style.fontSize = "0.875rem";
  link.style.fontWeight = "500";
  link.style.color = "var(--blue-highlight)";
  link.style.textDecoration = "none";
  link.style.transition = "background-color 0.2s, color 0.2s";
  link.style.cursor = "pointer";

  link.onmouseenter = () => {
    link.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
    link.style.color = "#1d4ed8";
  };
  link.onmouseleave = () => {
    link.style.backgroundColor = "transparent";
    link.style.color = "var(--blue-highlight)";
  };

  return link;
}
