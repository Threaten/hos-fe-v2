import React from "react";

/**
 * Stacked serif wordmark in the reference's style: one word per line,
 * every other line indented. Short connectors ("of", "&") stay with the
 * following word so they never sit alone on a line.
 */
function toLines(name: string): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let carry = "";
  for (const word of words) {
    if (word.length <= 2 || word === "&") {
      carry = carry ? `${carry} ${word}` : word;
      continue;
    }
    lines.push(carry ? `${carry} ${word}` : word);
    carry = "";
  }
  if (carry) {
    if (lines.length) lines[lines.length - 1] += ` ${carry}`;
    else lines.push(carry);
  }
  return lines;
}

const LINE_INDENT_EM = 1.3;

interface WordmarkProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Wordmark({ name, className = "", style }: WordmarkProps) {
  const lines = toLines(name);
  return (
    <span
      className={`inline-flex flex-col font-serif leading-[0.82] ${className}`}
      style={style}
    >
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          className="block whitespace-nowrap"
          style={{ paddingLeft: i % 2 === 1 ? `${LINE_INDENT_EM}em` : 0 }}
        >
          {line}
        </span>
      ))}
    </span>
  );
}
