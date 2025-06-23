"use client";

export function noteRenderer(content) {
  const navList = [];

  function extractHtmlBlocks(content) {
    return content.replace(
      /!\(\s*((?:<[^>]+>)[\s\S]*?)\s*\)/g,
      (match, html) => `[[PARSEHTMLBLOCK:${btoa(html)}]]`
    );
  }

  function parseCustomBlocks(text) {
    let i = 0;
    const stack = [];
    while (i < text.length) {
      if (text.slice(i, 2) === '!(') {
        stack.push(i);
        i += 2;
      } else if (text[i] === ')' && stack.length) {
        const start = stack.pop();
        const inside = text.slice(start + 2, i);
        const after = text.slice(i + 1);
        const classMatch = after.match(/^<([\w-\s]+?)>/);
        if (classMatch) {
          const className = classMatch[1];
          const end = i + classMatch[0].length + 1;
          const wrapped = `!( ${parseCustomBlocks(inside)} )<${className}>`;
          text = text.slice(0, start) + wrapped + text.slice(end);
          i = start + wrapped.length;
          continue;
        }
        i++;
      } else {
        i++;
      }
    }
    return text;
  }

  const regList = [
    { regex: /^(#{1,6})\s+(.*)/, contentPos: 2, tag: "h", dynamicLevelFrom: 1, styleMap: { default: "font-bold mb-4 mt-6", lengthMap: { 1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl", 2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl", 3: "text-lg sm:text-xl md:text-2xl lg:text-3xl", 4: "text-base sm:text-lg md:text-xl", 5: "text-sm sm:text-base md:text-lg", 6: "text-sm" } } },
    { regex: /~~(.*?)~~/, contentPos: 1, tag: "del", styleMap: { default: "line-through opacity-70" } },
    { regex: /__(.*?)__/, contentPos: 1, tag: "u", styleMap: { default: "underline" } },
    { regex: /\*\*(.*?)\*\*/, contentPos: 1, tag: "strong", styleMap: { default: "font-bold" } },
    { regex: /_(.*?)_/, contentPos: 1, tag: "em", styleMap: { default: "italic" } },
    { regex: />\s+(.*)/, contentPos: 1, tag: "blockquote", styleMap: { default: "border-l-4 pl-4 italic opacity-80 my-3" } },
    { regex: /-\s+(.*)/, contentPos: 1, tag: "li", styleMap: { default: "ml-4 mb-1" } },
    { regex: /^-{3,}$/, render: () => <hr key={`hr-${Math.random().toString(36).slice(2)}`} className="border-t border-gray-300 opacity-60" /> },
    { regex: /!\[(.*?)]{(.*?)}/, contentPos: 1, tag: "span", dynamicLevelFrom: 2, styleMap: { default: "my-2 text-sm sm:text-base md:text-lg leading-relaxed" }, render: (tag, text, color) => { const Tag = tag; return <Tag key={`${text}-${color}`} style={{ color: `var(--${color})` }}>{text}</Tag>; } },
    { regex: /!\[(.*?)\]\((.*?)\)\((.*?),(.*?)\){(.*?)}/, multiContentPos: [2,5], multiDynamicFrom: [1,3,4], styleMap: { default: "my-2 text-sm sm:text-base md:text-lg leading-relaxed" }, render: (tag, alt, width, height, src) => { if (tag === "img") { const parsedWidth = parseInt(width) === 0 ? "auto" : `${width}px`; const parsedHeight = parseInt(height) === 0 ? "auto" : `${height}px`; return (<div key={`${alt}-${src}`} className="border rounded-md shadow-sm flex flex-col w-fit h-fit my-4"><img src={src} alt={alt} style={{ width: parsedWidth, height: parsedHeight, objectFit: "contain" }} className="rounded-md mb-2" /><p className="text-center text-xs opacity-70 italic px-2 pb-2">{alt}</p></div>); } return null; } },
    { regex: /!\((.+?)\)<(.+?)>/, multiContentPos: [1,2], render: (content, className) => (<div className={`${className.trim()} p-3 my-2 rounded`} key={`div-${content.slice(0,10)}`}>{parseInline(content)}</div>) },
    { regex: /:{3}\n?\[(exp|tip|warning)\]\n?\((.*?)\)\n?:{3}/, multiContentPos: [1,2], render: (type, content) => { const titles = { exp: "Explanation", tip: "Tip", warning: "Warning" }; const bgColor = { exp: "var(--green-highlight)", tip: "var(--blue-highlight)", warning: "var(--pink-highlight)" }[type]; return (<details key={`${type}-${content.slice(0,20)}`} className={`m-6 rounded overflow-hidden outline-[${bgColor}]`}><summary className="relative px-4 py-2 font-bold text-white cursor-pointer text-xl text-center"><div className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: 0.6 }} /><span className="relative z-10">{titles[type]}</span></summary><div className="relative px-4 py-3 text-center"><div className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: 0.1 }} /><div className="relative z-10">{parseInline(content)}</div></div></details>); } },
    { regex: /:::\[(tip|exp|warning)\|box\]\(([\s\S]*?)\):::/, multiContentPos: [1,2], render: (type, content) => { const titles = { tip: "TIP!", exp: "EXPLANATION", warning: "WARNING!" }; const colors = { tip: "var(--blue-highlight)", exp: "var(--green-highlight)", warning: "var(--pink-highlight)" }; return (<div key={`box-${type}-${content.slice(0,10)}`} className={`${type}-box rounded my-4 overflow-hidden w-fit max-w-full`} style={{ outline: `1px dashed ${colors[type]}` }}><div className="px-3 sm:px-4 py-2 font-bold text-white relative text-center text-sm sm:text-base md:text-lg" style={{ backgroundColor: colors[type] }}><div className="absolute inset-0" style={{ backgroundColor: colors[type], opacity: 0.6 }} /><span className="relative z-10">{titles[type]}</span></div><div className={`${type}-box-text px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base md:text-lg relative text-center`}><div className="absolute inset-0" style={{ backgroundColor: colors[type], opacity: ру0.1 }} /><div className="relative z-10">{parseInline(content)}</div></div></div>); } }
  ];

  function parseInline(text, depth = 0) {
    const children = [];
    const htmlBlockRegex = /\[\[PARSEHTMLBLOCK:(.*?)\]\]/;
    if (htmlBlockRegex.test(text)) {
      const match = text.match(htmlBlockRegex);
      const decoded = atob(match[1]);
      return parseInline(decoded, depth + 1);
    }
    let pos = 0;
    while (pos < text.length) {
      let matched = false;
      for (const reg of regList) {
        reg.regex.lastIndex = 0;
        const slice = text.slice(pos);
        const match = slice.match(reg.regex);
        if (!match || match.index !== 0) continue;
        matched = true;
        if (typeof reg.render === 'function') {
          children.push(reg.render(...match.slice(1)));
        } else {
          let tagName = reg.tag;
          let className = reg.styleMap?.default || '';
          if (reg.dynamicLevelFrom && reg.styleMap?.lengthMap) {
            const lvl = Math.min(match[reg.dynamicLevelFrom].length, 6);
            tagName = `${reg.tag}${lvl}`;
            className = `${reg.styleMap.lengthMap[lvl]} ${className}`;
          }
          const Tag = tagName;
          const content = parseInline(match[reg.contentPos], depth + 1);
          children.push(<Tag key={`${depth}-${pos}`} className={className}>{content}</Tag>);
        }
        pos += match[0].length;
        break;
      }
      if (!matched) {
        let nextPos = text.length;
        for (const reg of regList) {
          const m = text.slice(pos).match(reg.regex);
          if (m && m.index >= 0) nextPos = Math.min(nextPos, pos + m.index);
        }
        children.push(text.slice(pos, nextPos));
        pos = nextPos;
      }
    }
    return children;
  }

  const pre = extractHtmlBlocks(parseCustomBlocks(content));
  const parsed = pre.split('\n').map((line, idx) => {
    const t = line.trim();
    if (!t) return <br key={idx}/>;
    return <div key={idx} className="text-base sm:text-lg md:text-xl leading-relaxed max-w-full sm:px-0">{parseInline(t)}</div>;
  });
  return <>{parsed}</>;
}
