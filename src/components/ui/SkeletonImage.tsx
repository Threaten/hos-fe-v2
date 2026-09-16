"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Drop-in replacement for Next.js Image that shows a pulsing skeleton
 * until the image finishes loading. Requires the parent to have
 * `position: relative` (i.e. the `relative` Tailwind class) when using `fill`.
 */
export default function SkeletonImage({
  className,
  onLoad,
  alt = "",
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}
      <Image
        {...props}
        alt={alt}
        className={className}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </>
  );
}
