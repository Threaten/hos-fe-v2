"use client";

import { useEffect } from "react";

/**
 * Reveals `[data-reveal]` elements as they scroll into view by adding
 * `is-revealed` (styles live in globals.css), and resets them once they have
 * left the screen entirely, so the effect plays again every time a section is
 * reached. A MutationObserver picks up elements rendered later, e.g. after
 * tenant data loads or on navigation.
 */
export default function ScrollReveal() {
  useEffect(() => {
    // Plays the effect once a little of the element is comfortably on screen
    const revealer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-revealed");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    // Resets it only when fully out of the real viewport, so nothing vanishes
    // while any part of it can still be seen
    const resetter = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) entry.target.classList.remove("is-revealed");
        }
      },
      { rootMargin: "0px", threshold: 0 },
    );

    const watch = (el: Element) => {
      revealer.observe(el);
      resetter.observe(el);
    };
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(watch);
    };
    scan(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]")) watch(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      revealer.disconnect();
      resetter.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
