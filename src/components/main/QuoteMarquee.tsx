"use client";

const DEFAULT_QUOTES = [
  "Good food, warm company, and a place to stay awhile.",
  "Artistry on every plate, crafted with seasonal devotion.",
  "The pleasure of conversation around a generous table.",
  "Where Saigon's vibrant pulse meets intimate hospitality.",
  "Every evening is an occasion worth celebrating.",
];

export function QuoteMarquee({ quotes }: { quotes?: string[] }) {
  const items = quotes && quotes.length > 0 ? quotes : DEFAULT_QUOTES;
  const track = [...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden border-y border-border/70 bg-secondary/30 py-4 backdrop-blur-xs select-none"
      aria-label="Sensory hospitality quotes"
    >
      <div className="flex w-max animate-[marquee_45s_linear_infinite] items-center gap-12 whitespace-nowrap">
        {track.map((quote, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="font-heading italic text-base sm:text-lg tracking-wide text-foreground/85 font-normal">
              “{quote}”
            </span>
            <span className="text-primary/50 text-xs select-none" aria-hidden>
              ✦
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
