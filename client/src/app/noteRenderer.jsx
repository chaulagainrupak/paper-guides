"use client";

import { useEffect } from "react";

export function noteRenderer(content) {
  const regList = [
    {
      regex: /^(#{1,6})\s+(.*)/,
      contentPos: 2,
      tag: "h",
      dynamicLevelFrom: 1,
      styleMap: {
        default: "font-white",
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
      regex: /__(.*?)__/,
      contentPos: 1,
      tag: "u",
      styleMap: {
        default: "underline",
      },
    },
    {
      regex: /~~(.*?)~~/,
      contentPos: 1,
      tag: "del",
      styleMap: {
        default: "underline",
      },
    },
  ];

  useEffect(() => {
    try {
      const navigationDest = document.getElementById("notes-navigation");
      const navLink = generateNavLink("My Note Title", "title");
      navigationDest.appendChild(navLink);
      return () => {
        navigationDest.removeChild(navLink);
      };
    } catch {
      console.log("No navigation found");
    }
  }, [content]);

  const parsedContent = content.split("\n").map((line, index) => {
    if (line.trim() === "") return <br key={index} />;

    let parentTag = null;
    let children = [];

    for (let reg of regList) {
      let match = line.match(reg.regex);
      console.log("MATCH: for ", reg.regex, match);
      console.log(parentTag);
      if (!match) continue;

      if (parentTag === null) {
        parentTag = document.createElement(reg.tag, {
          className: reg.styleMap.default,
        });
        continue;
      }

      console.log(parentTag);
      const content = match[reg.contentPos];
      console.log(content);
      const contentId = content.toLowerCase().replace(/\s+/g, "-");

      let tagSuffix = "";
      let className = "";

      if (reg.dynamicLevelFrom) {
        const level = Math.min(match[reg.dynamicLevelFrom].length, 6);
        tagSuffix = level;
        className = reg.styleMap?.[level] || "";
      }

      const Tag = `${reg.tag}${tagSuffix}`;

      return (
        <Tag
          key={index}
          id={contentId}
          className={`${className} font-bold my-2`}
        >
          {content}
        </Tag>
      );
    }
  });

  return <>{parsedContent}</>;
}

function generateNavLink(linkText, targetId) {
  const link = document.createElement("a");
  link.href = `#${targetId}`;
  link.textContent = linkText;
  link.style.display = "block";
  return link;
}
