"use client";

import type { Tenant } from "@/api/queries";
import { useT } from "@/app/i18n/useT";


interface InstagramEmbedProps {
  tenant?: Tenant | null;
}

type SocialNetwork = {
  key: "facebook" | "instagram" | "tiktok" | "youtube";
  label: string;
  href: string;
};

const SOCIAL_META = {
  instagram: { label: "Instagram", baseUrl: "https://www.instagram.com/" },
  facebook: { label: "Facebook", baseUrl: "https://www.facebook.com/" },
  tiktok: { label: "TikTok", baseUrl: "https://www.tiktok.com/@" },
  youtube: { label: "YouTube", baseUrl: "https://www.youtube.com/" },
} as const;

function normalizeSocialUrl(
  value: string | undefined,
  key: keyof typeof SOCIAL_META,
) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `${SOCIAL_META[key].baseUrl}${handle}`;
}

export function buildSocials(tenant?: Tenant | null): SocialNetwork[] {
  if (!tenant) return [];
  // Instagram first: it is the primary "Follow us" destination
  return (["instagram", "facebook", "tiktok", "youtube"] as const).flatMap(
    (key) => {
      const href = normalizeSocialUrl(tenant[key], key);
      return href ? [{ key, label: SOCIAL_META[key].label, href }] : [];
    },
  );
}

/** Every network as a big lowercase link in the branch colour */
export default function InstagramEmbed({ tenant }: InstagramEmbedProps) {
  const t = useT();
  const socials = buildSocials(tenant);
  if (socials.length === 0) return null;
  const name = tenant?.name || "House of Senses";

  return (
    <section className="hs-shell pt-[var(--section)]" aria-labelledby="follow-heading">
      <h2 id="follow-heading" className="hs-label mb-6 lg:mb-0 text-center lg:text-left">
        {t("Follow along")}
      </h2>
      <ul className="hs-main flex flex-wrap justify-center lg:justify-start gap-x-8 md:gap-x-12 gap-y-2" data-reveal>
        {socials.map((social) => (
          <li key={social.key}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hs-display hs-nav-link inline-flex items-start gap-2 lowercase"
              style={{ color: "var(--pen)" }}
              aria-label={t("{name} on {network}", { name, network: social.label })}
            >
              {social.label}
              <svg viewBox="0 0 16 16" className="w-[0.32em] h-[0.32em] mt-[0.12em]" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M4 12L12 4M5 4h7v7" strokeLinecap="square" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
