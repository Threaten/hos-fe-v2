import type { ReactNode } from "react";

/**
 * Editorial renderer for Payload's Lexical richtext JSON — covers paragraphs,
 * headings, lists, blockquotes, links, horizontal rules, and inline text formatting
 * (bold / italic / underline), styled like a high-end food monograph.
 */

interface LexicalTextNode {
  type: "text";
  text: string;
  format?: number;
}

interface LexicalElementNode {
  type: string;
  tag?: string;
  listType?: string;
  fields?: { url?: string; newTab?: boolean };
  children?: LexicalNode[];
}

type LexicalNode = LexicalTextNode | LexicalElementNode;

const BOLD = 1;
const ITALIC = 2;
const UNDERLINE = 8;

function renderText(node: LexicalTextNode, key: number): ReactNode {
  let el: ReactNode = node.text;
  const format = node.format ?? 0;
  if (format & BOLD)
    el = (
      <strong key={`b-${key}`} className="font-semibold text-foreground">
        {el}
      </strong>
    );
  if (format & ITALIC)
    el = (
      <em key={`i-${key}`} className="italic font-serif">
        {el}
      </em>
    );
  if (format & UNDERLINE)
    el = (
      <u key={`u-${key}`} className="underline underline-offset-4">
        {el}
      </u>
    );
  return <span key={key}>{el}</span>;
}

function renderChildren(children: LexicalNode[] = []): ReactNode[] {
  return children.map((child, i) => renderNode(child, i));
}

function isTextNode(node: LexicalNode): node is LexicalTextNode {
  return node.type === "text";
}

function renderNode(node: LexicalNode, key: number): ReactNode {
  if (isTextNode(node)) return renderText(node, key);

  const el = node as LexicalElementNode;

  switch (el.type) {
    case "paragraph":
      return (
        <p
          key={key}
          className="mb-6 leading-relaxed text-foreground/80 text-base sm:text-lg first-of-type:drop-cap"
        >
          {renderChildren(el.children)}
        </p>
      );
    case "heading": {
      const Tag = (el.tag || "h2") as keyof React.JSX.IntrinsicElements;
      return (
        <div key={key} className="mt-12 mb-6 first:mt-0">
          <Tag className="font-heading text-3xl sm:text-4xl text-foreground tracking-tight leading-snug">
            {renderChildren(el.children)}
          </Tag>
          <div className="h-px w-12 bg-primary/40 mt-3" />
        </div>
      );
    }
    case "quote":
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-8 pl-6 border-l-2 border-primary italic font-serif text-xl sm:text-2xl text-foreground/90 leading-relaxed bg-secondary/20 py-4 pr-4 rounded-r-xs"
        >
          {renderChildren(el.children)}
        </blockquote>
      );
    case "list": {
      const Tag = el.listType === "number" ? "ol" : "ul";
      return (
        <Tag
          key={key}
          className={`mb-6 ml-6 space-y-2 text-foreground/80 text-base leading-relaxed ${
            el.listType === "number" ? "list-decimal" : "list-disc"
          }`}
        >
          {renderChildren(el.children)}
        </Tag>
      );
    }
    case "listitem":
      return (
        <li key={key} className="pl-1">
          {renderChildren(el.children)}
        </li>
      );
    case "link":
      return (
        <a
          key={key}
          href={el.fields?.url || "#"}
          target={el.fields?.newTab ? "_blank" : undefined}
          rel={el.fields?.newTab ? "noopener noreferrer" : undefined}
          className="text-primary underline underline-offset-4 hover:text-foreground transition-colors font-medium"
        >
          {renderChildren(el.children)}
        </a>
      );
    case "horizontalrule":
      return (
        <div
          key={key}
          className="my-12 flex items-center justify-center gap-4 text-primary/40"
        >
          <span className="h-px w-16 bg-border" />
          <span className="text-xs">✦</span>
          <span className="h-px w-16 bg-border" />
        </div>
      );
    default:
      return <span key={key}>{renderChildren(el.children)}</span>;
  }
}

export function LexicalRenderer({ data }: { data: unknown }) {
  const root = (data as { root?: LexicalElementNode })?.root;
  if (!root?.children) return null;
  return (
    <div className="mx-auto max-w-3xl font-sans">
      {renderChildren(root.children)}
    </div>
  );
}
