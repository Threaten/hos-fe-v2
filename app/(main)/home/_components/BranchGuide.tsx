import React from "react";
import Link from "next/link";
import type { GuideContent } from "@/api/queries";
import { ArrowRight } from "../../components/Icons";

/** Paragraphs are separated by an empty line in the CMS textarea */
function paragraphs(text?: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function GuideLink({ href, label }: { href: string; label: string }) {
  const isInternal = href.startsWith("/");
  return isInternal ? (
    <Link href={href} className="hs-btn hs-btn-sm">
      {label} <ArrowRight />
    </Link>
  ) : (
    <a href={href} className="hs-btn hs-btn-sm" target="_blank" rel="noopener">
      {label} <ArrowRight />
    </a>
  );
}

export function usableFaq(content?: GuideContent | null) {
  return (content?.faq ?? []).filter((q) => q.question?.trim() && q.answer?.trim()) as Array<{
    question: string;
    answer: string;
    id?: string | null;
  }>;
}

/**
 * Text written in the CMS for people searching for a place to eat: a heading, an introduction,
 * a few sections and common questions. Every part is optional; nothing renders when it is empty.
 * `asPage` makes the heading the page's H1 (the Vietnamese page).
 */
export default function BranchGuide({
  content,
  asPage = false,
  children,
}: {
  content?: GuideContent | null;
  asPage?: boolean;
  /** Extra content under the introduction (e.g. booking buttons) */
  children?: React.ReactNode;
}) {
  if (!content) return null;
  const sections = (content.sections ?? []).filter((s) => s.heading?.trim() || s.body?.trim());
  const faq = usableFaq(content);
  const intro = paragraphs(content.intro);
  if (!content.title?.trim() && !intro.length && !sections.length && !faq.length) return null;

  const Heading = asPage ? "h1" : "h2";

  return (
    <section
      className={`hs-shell ${asPage ? "pt-8 md:pt-12" : "pt-[var(--section)]"}`}
      aria-labelledby={content.title?.trim() ? "guide-heading" : undefined}
    >
      <p className="hs-label mb-6 lg:mb-0">
        <span className="hs-rail-sticky block">{content.label}</span>
      </p>
      <div className="hs-main">
        {content.title?.trim() && (
          <Heading
            id="guide-heading"
            className={asPage ? "hs-hero max-w-[16ch]" : "hs-display max-w-[20ch]"}
            style={{ color: "var(--ink)" }}
          >
            {content.title}
          </Heading>
        )}
        {intro.map((p, i) => (
          <p key={i} className="hs-lead mt-6 max-w-[62ch]">
            {p}
          </p>
        ))}
        {children}

        {sections.length > 0 && (
          <div
            className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 border-t pt-6"
            style={{ borderColor: "var(--line)" }}
          >
            {sections.map((s, i) => (
              <div key={s.id ?? i}>
                {s.heading?.trim() && (
                  <h3 className="hs-title mb-4" style={{ color: "var(--pen)" }}>
                    {s.heading}
                  </h3>
                )}
                {paragraphs(s.body).map((p, j) => (
                  <p key={j} className="hs-lead mt-3 first:mt-0">
                    {p}
                  </p>
                ))}
                {s.linkHref?.trim() && s.linkLabel?.trim() && (
                  <div className="mt-6">
                    <GuideLink href={s.linkHref.trim()} label={s.linkLabel} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {faq.length > 0 && (
          <div className="mt-12 md:mt-16">
            {content.faqTitle?.trim() && (
              <h3 className="hs-title mb-6" style={{ color: "var(--pen)" }}>
                {content.faqTitle}
              </h3>
            )}
            <dl className="flex flex-col max-w-[760px]">
              {faq.map((q, i) => (
                <div key={q.id ?? i} className="border-t py-5" style={{ borderColor: "var(--line)" }}>
                  <dt className="text-[1.0625rem] font-medium">{q.question}</dt>
                  <dd className="mt-2 opacity-80 leading-snug">{q.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
