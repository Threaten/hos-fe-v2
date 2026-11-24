"use client";

import React, { useEffect, useRef, useState } from "react";

type TabID = "pdf" | "text";

const TABS: Array<{ id: TabID; label: string }> = [
  { id: "pdf", label: "Menu" },
  { id: "text", label: "Text" },
];

/** Linkable: /menu#menu-text opens the text tab */
const TEXT_HASH = "#menu-text";

/**
 * The menu in two tabs: the flip book (PDF) and the dishes as text by category.
 * The text panel is always in the page, only hidden, so search engines and
 * screen readers still read it. The flip book mounts the first time its tab
 * is shown and then stays, keeping its page.
 */
export default function MenuTabs({ pdf, text }: { pdf: React.ReactNode; text: React.ReactNode }) {
  const [active, setActive] = useState<TabID>("pdf");
  const [pdfMounted, setPdfMounted] = useState(true);
  const tabRefs = useRef<Record<TabID, HTMLButtonElement | null>>({ pdf: null, text: null });

  useEffect(() => {
    if (window.location.hash === TEXT_HASH) {
      setActive("text");
      setPdfMounted(false);
    }
  }, []);

  const select = (id: TabID, focus = false) => {
    setActive(id);
    if (id === "pdf") setPdfMounted(true);
    window.history.replaceState(null, "", id === "text" ? TEXT_HASH : window.location.pathname + window.location.search);
    if (focus) tabRefs.current[id]?.focus();
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    select(TABS[next].id, true);
  };

  return (
    <div>
      <div className="hs-shell pt-8 md:pt-12">
        <div
          role="tablist"
          aria-label="How to view the menu"
          className="hs-main flex justify-center lg:justify-start gap-2"
          onKeyDown={onKeyDown}
        >
          {TABS.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={`menu-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`menu-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(tab.id)}
                className={`hs-btn hs-btn-sm ${selected ? "hs-btn-solid" : ""}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id="menu-panel-pdf" aria-labelledby="menu-tab-pdf" hidden={active !== "pdf"}>
        {pdfMounted && pdf}
      </div>
      <div role="tabpanel" id="menu-panel-text" aria-labelledby="menu-tab-text" hidden={active !== "text"}>
        {text}
      </div>
    </div>
  );
}
