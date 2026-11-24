/**
 * The menu as text, by category (the "Text" tab of the Menu page): what guests
 * on a slow connection, search engines and screen readers read.
 * From the branch's "Menu as text" field: "## Section" lines start a section, other lines
 * are "Name | short description | price" (description and price optional).
 */
type Item = { name: string; description?: string; price?: string };
type Section = { title?: string; items: Item[] };

function parse(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section = { items: [] };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current.title || current.items.length) sections.push(current);
      current = { title: heading[1].trim(), items: [] };
      continue;
    }
    const [name, description, price] = line.replace(/^[-•*]\s*/, "").split("|").map((part) => part.trim());
    if (name) current.items.push({ name, description: description || undefined, price: price || undefined });
  }
  if (current.title || current.items.length) sections.push(current);
  return sections;
}

export default function MenuText({ text, tenantName }: { text?: string | null; tenantName: string }) {
  const sections = text ? parse(text) : [];
  if (!sections.length) return null;

  const anchor = (i: number) => `menu-category-${i + 1}`;
  const titled = sections.map((section, i) => ({ ...section, i })).filter((s) => s.title);

  return (
    <section className="hs-shell pt-8 md:pt-10" aria-labelledby="menu-text-heading">
      <h2 id="menu-text-heading" className="hs-label mb-6 lg:mb-0">
        <span className="hs-rail-sticky block">On the menu</span>
      </h2>
      <div className="hs-main flex flex-col gap-10">
        {/* Jump to a category */}
        {titled.length > 1 && (
          <nav aria-label="Menu categories">
            <ul className="flex flex-wrap gap-2">
              {titled.map((section) => (
                <li key={anchor(section.i)}>
                  <a href={`#${anchor(section.i)}`} className="hs-chip hover:opacity-60 transition-opacity">
                    {section.title}
                    <span className="hs-count" aria-label={`${section.items.length} dishes`}>
                      {section.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {sections.map((section, i) => (
          <div key={`${section.title ?? "menu"}-${i}`} id={anchor(i)} className="scroll-mt-[calc(var(--site-header-h,0px)+24px)]">
            {section.title && (
              <h3 className="hs-title mb-5" style={{ color: "var(--pen)" }}>
                {section.title}
              </h3>
            )}
            <ul className="flex flex-col gap-4 max-w-[720px]" aria-label={section.title ?? `${tenantName} menu`}>
              {section.items.map((item, j) => (
                <li key={`${item.name}-${j}`} className="border-b pb-4" style={{ borderColor: "var(--line)" }}>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="text-[1.0625rem] font-medium">{item.name}</span>
                    {item.price && <span className="shrink-0 tabular-nums">{item.price}</span>}
                  </div>
                  {item.description && <p className="mt-1 opacity-80 leading-snug">{item.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
