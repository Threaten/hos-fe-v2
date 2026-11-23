import type { Metadata } from "next";
import type { Tenant } from "@/api/queries";
import { resolveBackendMediaUrl } from "@/app/utils/media";
import { parseOpeningHours } from "@/app/utils/openingStatus";
import {
  SITE_URL,
  displayName,
  tenantSiteUrl,
  type TenantSummary,
} from "@/app/utils/tenantServer";

/*
 * SEO for houseofsenses.vn (the group) and {branch}.houseofsenses.vn (each
 * restaurant). Google picks sitelinks itself; what we control is giving every
 * page a distinct, descriptive title and description, a canonical URL, and
 * structured data that ties the branches to the group.
 */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const DEFAULT_IMAGE = `${SITE_URL}/media/IMG_0050.JPG`;

/** Branch base URL; local subdomains in development so links stay testable */
export function getTenantBaseUrl(domain: string): string {
  if (process.env.NODE_ENV === "development") {
    return `http://${domain}.localhost:3001`;
  }
  return tenantSiteUrl(domain);
}

interface PageInfo {
  /** Title shown in search results and used by Google for the sitelink label */
  label: string;
  description: (name: string, city: string) => string;
  noIndex?: boolean;
}

/** Every indexable branch page, keyed by path */
export const TENANT_PAGES: Record<string, PageInfo> = {
  menu: {
    label: "Menu",
    description: (n, c) =>
      `See the ${n} menu: dishes, drinks and set menus served at our restaurant in ${c}.`,
  },
  reservation: {
    label: "Book a Table",
    description: (n, c) =>
      `Book a table at ${n} in ${c}. Choose a date, time and party size online and we'll confirm your reservation.`,
  },
  about: {
    label: "About",
    description: (n) =>
      `The story behind ${n}: the room, the kitchen and the people who make every visit feel unhurried.`,
  },
  contact: {
    label: "Contact",
    description: (n, c) =>
      `Contact ${n} in ${c}: address, phone, email, opening hours and directions.`,
  },
  gallery: {
    label: "Gallery",
    description: (n) => `Photos of ${n}: the dining room, dishes and evenings at the table.`,
  },
  "lucky-wheel": {
    label: "Lucky Wheel",
    description: (n) => `Spin the ${n} lucky wheel.`,
    // A promotion, not something people search for
    noIndex: true,
  },
  voucher: {
    label: "Voucher",
    description: (n) => `A ${n} voucher. Show it to our team to use it.`,
    // Personal links; never in search results or the sitemap
    noIndex: true,
  },
};

function cityOf(address?: string): string {
  if (address && /h[oồ] ch[ií] minh|hcmc|s[aà]i g[oò]n/i.test(address)) {
    return "Ho Chi Minh City";
  }
  return "Vietnam";
}

function tenantImage(tenant: Tenant): string {
  return (
    resolveBackendMediaUrl(tenant.meta?.image) ||
    resolveBackendMediaUrl(tenant.photoSets?.[0]?.photos?.[0]) ||
    resolveBackendMediaUrl(tenant.aboutusHero) ||
    DEFAULT_IMAGE
  );
}

/** Collapse stray spaces typed into CMS titles ("Red Space  |  Restaurant") */
function tidy(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Language of the site's text; Open Graph should say the same as <html lang> */
const LOCALE = "en_US";
const ALTERNATE_LOCALE = "vi_VN";

/** Keep descriptions inside the ~160 characters Google shows */
function clamp(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function tenantHomeDescription(tenant: Tenant, name: string, city: string): string {
  return (
    tenant.meta?.description ||
    tenant.heroDescription ||
    `${name} is a House of Senses restaurant in ${city}. See the menu, opening hours and book a table online.`
  );
}

/** The Vietnamese page (/vi) is live for this branch */
export function hasVietnamesePage(tenant: Pick<Tenant, "vi">): boolean {
  return !!tenant.vi?.enabled;
}

/** English home and its Vietnamese version point at each other (hreflang) */
function languageAlternates(tenant: Tenant, baseUrl: string) {
  return hasVietnamesePage(tenant)
    ? { "en": `${baseUrl}/`, "vi": `${baseUrl}/vi`, "x-default": `${baseUrl}/` }
    : undefined;
}

/** Metadata for the branch page in Vietnamese (/vi); text from the CMS tab "Vietnamese page" */
function buildVietnameseMetadata(tenant: Tenant, name: string, baseUrl: string): Metadata {
  const vi = tenant.vi ?? {};
  const title = tidy(vi.metaTitle || vi.title || `${name} | Nhà hàng tại TP.HCM`);
  const description = clamp(vi.metaDescription || vi.intro || `${name}: thực đơn, giờ mở cửa và đặt bàn trực tuyến.`);
  const url = `${baseUrl}/vi`;
  const image = tenantImage(tenant);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(tenant, baseUrl) },
    openGraph: {
      title,
      description,
      url,
      siteName: name,
      locale: "vi_VN",
      alternateLocale: LOCALE,
      type: "website",
      images: [{ url: image, alt: name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: hasVietnamesePage(tenant)
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
      : { index: false, follow: true },
  };
}

/** Metadata for a branch page ("" = home, "vi", or a key of TENANT_PAGES) */
export function buildTenantMetadata(tenant: Tenant, path = ""): Metadata {
  const name = displayName(tenant.name);
  const city = cityOf(tenant.address);
  const baseUrl = getTenantBaseUrl(tenant.domain);
  if (path === "vi") return buildVietnameseMetadata(tenant, name, baseUrl);
  const page = path ? TENANT_PAGES[path] : undefined;

  // Each page gets its own title. The CMS can override any of them (SEO tab: home page
  // fields, and "Other pages" for the rest); otherwise one is written from the name and city.
  const override = page ? tenant.meta?.pages?.[path as keyof NonNullable<NonNullable<Tenant["meta"]>["pages"]>] : null;
  const title = tidy(
    page
      ? override?.title || `${page.label} | ${name}`
      : tenant.meta?.title || `${name} | House of Senses`,
  );
  const description = clamp(
    page
      ? override?.description || page.description(name, city)
      : tenantHomeDescription(tenant, name, city),
  );
  const url = page ? `${baseUrl}/${path}` : `${baseUrl}/`;
  const image = tenantImage(tenant);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, ...(page ? {} : { languages: languageAlternates(tenant, baseUrl) }) },
    openGraph: {
      title,
      description,
      url,
      siteName: name,
      locale: LOCALE,
      alternateLocale: ALTERNATE_LOCALE,
      type: "website",
      images: [{ url: image, alt: name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: page?.noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

function hasRealCoordinates(tenant: Tenant): boolean {
  const lat = tenant.location?.latitude;
  const lng = tenant.location?.longitude;
  // 0,0 is the CMS default, not a real location
  return lat != null && lng != null && !(lat === 0 && lng === 0);
}

function normalizeSocial(value: string | undefined, base: string): string | null {
  const v = value?.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `${base}${v.replace(/^@/, "")}`;
}

/** schema.org graph for a branch page: WebSite + Restaurant (+ breadcrumbs on sub pages) */
export function buildTenantJsonLd(tenant: Tenant, path = ""): object {
  const name = displayName(tenant.name);
  const baseUrl = getTenantBaseUrl(tenant.domain);
  const restaurantId = `${baseUrl}/#restaurant`;
  const page = path ? TENANT_PAGES[path] : undefined;
  const isTemporarilyClosed = /temporar/i.test(tenant.status ?? "");
  const hours = parseOpeningHours(tenant.openingHours);
  const fmt = (m: number) =>
    `${String(Math.floor((m % 1440) / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const sameAs = [
    normalizeSocial(tenant.facebook, "https://www.facebook.com/"),
    normalizeSocial(tenant.instagram, "https://www.instagram.com/"),
    normalizeSocial(tenant.tiktok, "https://www.tiktok.com/@"),
    normalizeSocial(tenant.youtube, "https://www.youtube.com/"),
  ].filter(Boolean);

  const restaurant: Record<string, unknown> = {
    "@type": "Restaurant",
    "@id": restaurantId,
    name,
    alternateName: tenant.name,
    url: `${baseUrl}/`,
    description: tenantHomeDescription(tenant, name, cityOf(tenant.address)),
    image: tenantImage(tenant),
    servesCuisine: ["Vietnamese", "Contemporary", "International"],
    hasMenu: `${baseUrl}/menu`,
    acceptsReservations: `${baseUrl}/reservation`,
    parentOrganization: { "@id": ORGANIZATION_ID },
  };
  if (tenant.address) {
    restaurant.address = {
      "@type": "PostalAddress",
      streetAddress: tenant.address,
      addressLocality: cityOf(tenant.address),
      addressCountry: "VN",
    };
  }
  if (tenant.phone) restaurant.telephone = tenant.phone;
  if (tenant.email) restaurant.email = tenant.email;
  if (sameAs.length) restaurant.sameAs = sameAs;
  if (hasRealCoordinates(tenant)) {
    restaurant.geo = {
      "@type": "GeoCoordinates",
      latitude: tenant.location!.latitude,
      longitude: tenant.location!.longitude,
    };
  }
  // Publish hours only while the branch is operating normally
  if (hours && !isTemporarilyClosed) {
    restaurant.openingHoursSpecification = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: fmt(hours.open),
      closes: fmt(hours.close),
    };
  }

  const graph: object[] = [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name,
      alternateName: [tenant.name, `${name} by House of Senses`],
      url: `${baseUrl}/`,
      inLanguage: ["en", "vi"],
      publisher: { "@id": ORGANIZATION_ID },
    },
    restaurant,
  ];

  // Questions written in the CMS, on the page that shows them
  const faqSource = path === "vi" ? (hasVietnamesePage(tenant) ? tenant.vi : null) : path ? null : tenant.guide;
  const faq = (faqSource?.faq ?? []).filter((q) => q.question?.trim() && q.answer?.trim());
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${baseUrl}/${path}#faq`,
      inLanguage: path === "vi" ? "vi" : "en",
      mainEntity: faq.map((q) => ({
        "@type": "Question",
        name: q.question!.trim(),
        acceptedAnswer: { "@type": "Answer", text: q.answer!.trim() },
      })),
    });
  }

  if (page) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name, item: `${baseUrl}/` },
        { "@type": "ListItem", position: 2, name: page.label, item: `${baseUrl}/${path}` },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/* ── Group site: houseofsenses.vn ── */

export function buildRootMetadata(branches: TenantSummary[]): Metadata {
  const names = branches.map((b) => displayName(b.name));
  const title = "House of Senses | Restaurants in Ho Chi Minh City";
  const description = clamp(
    names.length
      ? `House of Senses is a family of restaurants in Ho Chi Minh City: ${names.join(", ")}. Find a branch, see menus and opening hours, and book a table.`
      : "House of Senses is a family of restaurants in Ho Chi Minh City. Find a branch, see menus and opening hours, and book a table.",
  );
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/`,
      siteName: "House of Senses",
      locale: LOCALE,
      alternateLocale: ALTERNATE_LOCALE,
      type: "website",
      images: [{ url: DEFAULT_IMAGE, alt: "House of Senses" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_IMAGE] },
    robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  };
}

export function buildRootJsonLd(branches: TenantSummary[], logoUrl?: string | null): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "House of Senses",
        alternateName: ["houseofsenses.vn", "House of Senses Vietnam"],
        url: `${SITE_URL}/`,
        inLanguage: ["en", "vi"],
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "House of Senses",
        url: `${SITE_URL}/`,
        ...(logoUrl ? { logo: logoUrl } : {}),
        // Each branch is its own site; linking them here tells Google they belong together
        subOrganization: branches.map((b) => ({
          "@type": "Restaurant",
          "@id": `${tenantSiteUrl(b.domain)}/#restaurant`,
          name: displayName(b.name),
          url: `${tenantSiteUrl(b.domain)}/`,
          ...(b.address
            ? { address: { "@type": "PostalAddress", streetAddress: b.address, addressCountry: "VN" } }
            : {}),
          ...(b.phone ? { telephone: b.phone } : {}),
        })),
      },
    ],
  };
}
