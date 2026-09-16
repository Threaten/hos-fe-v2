"use client";

import { BookOpen } from "lucide-react";

export function BookCover({
  tenantName,
  onOpen,
}: {
  tenantName: string;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="book-scene group relative flex h-[72vh] max-h-[720px] w-full max-w-[420px] flex-col items-center justify-center overflow-hidden rounded-r-md rounded-l-xs border-y border-r border-black/20"
      style={{
        background:
          "linear-gradient(135deg, var(--tenant-primary-deep, #20130d) 0%, var(--tenant-primary, #3e261b) 55%, var(--tenant-primary-deep, #1a0f0a) 100%)",
        boxShadow:
          "0 45px 90px -20px rgba(0,0,0,0.7), inset -16px 0 35px -10px rgba(0,0,0,0.6), inset 6px 0 14px rgba(255,255,255,0.08)",
        transform: "rotateY(-6deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Spine highlight and leather stitch line */}
      <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute inset-y-2 left-3 w-px bg-white/10" />
      <div className="absolute inset-y-2 right-2.5 w-px bg-white/15" />

      {/* Decorative gold hairline inner frame */}
      <div className="absolute inset-5 border border-amber-300/20 rounded-xs pointer-events-none" />
      <div className="absolute inset-6 border border-amber-300/10 rounded-xs pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5 px-10 text-center text-white/95 transition-transform duration-500 group-hover:scale-[1.02]">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-amber-300/30" />
          <span className="text-[10px] uppercase tracking-[0.55em] text-amber-200/60 font-medium">
            House of Senses
          </span>
          <span className="h-px w-6 bg-amber-300/30" />
        </div>

        <h2 className="font-heading text-4xl leading-tight sm:text-5xl text-amber-100/95 drop-shadow-md">
          {tenantName}
        </h2>

        <p className="text-xs uppercase tracking-[0.4em] text-white/50 font-mono">
          Original Menu Monograph
        </p>

        <span className="mt-8 inline-flex items-center gap-2 rounded-xs border border-amber-300/40 bg-amber-950/40 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-amber-200 backdrop-blur-xs transition-all duration-300 group-hover:border-amber-300/80 group-hover:bg-amber-900/60 shadow-md">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Open Menu</span>
        </span>
      </div>

      {/* Realistic paper-stack edge visible along the right side */}
      <div className="absolute inset-y-3 right-0 w-2.5 bg-[repeating-linear-gradient(180deg,#efe4d0_0px,#efe4d0_2px,#e2d5bc_2px,#e2d5bc_4px)] opacity-85 shadow-inner" />
    </button>
  );
}
