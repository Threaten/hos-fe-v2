/**
 * The menu as text, under the flip book: what search engines and screen readers read.
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

  return (
    <section className="hs-shell pt-12 md:pt-16" aria-labelledby="menu-text-heading">
      <h2 id="menu-text-heading" className="hs-label mb-8 lg:mb-0">
        <span className="hs-rail-sticky block">On the menu</span>
      </h2>
      <div className="hs-main flex flex-col gap-12">
        {sections.map((section, i) => (
          <div key={`${section.title ?? "menu"}-${i}`}>
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
