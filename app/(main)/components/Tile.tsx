import React from "react";
import Image from "next/image";

interface TileProps {
  src?: string;
  alt: string;
  /** CSS aspect-ratio of the image box, e.g. "4 / 5" */
  aspect?: string;
  /** Outlined chip in the top-left corner */
  tag?: React.ReactNode;
  /** Small mono line under the image (grey) */
  label?: React.ReactNode;
  /** Title under the image (branch colour, uppercase mono) */
  title?: React.ReactNode;
  /** Description under the title */
  text?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  /** "scroll" fades in when scrolled into view; "load" fades in on page load */
  reveal?: "scroll" | "load";
  revealDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  imgClassName?: string;
  /** Render with spans so the tile can sit inside a button */
  inline?: boolean;
}

/** A photo on a flat sand ground, with an optional chip and caption */
export default function Tile({
  src,
  alt,
  aspect = "4 / 5",
  tag,
  label,
  title,
  text,
  sizes = "(max-width: 768px) 92vw, 30vw",
  priority = false,
  reveal,
  revealDelay,
  className = "",
  style,
  imgClassName = "",
  inline = false,
}: TileProps) {
  const Root = inline ? "span" : "figure";
  const Box = inline ? "span" : "div";
  const Cap = inline ? "span" : "figcaption";
  const hasCaption = label || title || text;
  return (
    <Root
      className={`hs-tile ${reveal === "load" ? "hs-fade-in" : ""} ${className}`}
      style={{
        ...(revealDelay != null ? { ["--reveal-delay" as string]: `${revealDelay}s` } : {}),
        ...style,
      }}
      data-reveal={reveal === "scroll" ? "" : undefined}
    >
      <Box className="hs-tile-img" style={{ aspectRatio: aspect }}>
        {tag && <span className="hs-chip">{tag}</span>}
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            className={`object-cover ${imgClassName}`}
          />
        ) : null}
      </Box>
      {hasCaption && (
        <Cap className="block pt-4 hs-ui">
          {label && <span className="block mb-3" style={{ color: "var(--ink-faint)" }}>{label}</span>}
          {title && (
            <span className="block text-[1.125rem] mb-2" style={{ color: "var(--pen)" }}>
              {title}
            </span>
          )}
          {text && <span className="block" style={{ color: "var(--ink)" }}>{text}</span>}
        </Cap>
      )}
    </Root>
  );
}
