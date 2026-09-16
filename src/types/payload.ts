export interface MediaDoc {
  id?: string;
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export type TenantStatus = "open" | "closed" | "temporarily-closed";

export interface OpeningHours {
  openingHours?: string | null;
}

export interface TenantLocation {
  latitude?: number | null;
  longitude?: number | null;
}

export interface TopbarNotification {
  enabled?: boolean | null;
  message?: string | null;
}

export interface HeroImage {
  id?: string;
  image?: MediaDoc | null;
}

export interface CollageImage {
  id?: string;
  image?: MediaDoc | null;
}

export interface NewMenuItem {
  id?: string;
  src?: MediaDoc | null;
}

export interface SpinWheelPrize {
  id?: string;
  label: string;
}

export interface MarqueeWord {
  id?: string;
  word: string;
}

export interface Tenant {
  id: string;
  status?: TenantStatus | null;
  name: string;
  domain: string;
  mainColor?: string | null;
  spinWheelPrizes?: SpinWheelPrize[] | null;
  heroImagesList?: HeroImage[] | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroDescription?: string | null;
  shortAboutCollages?: CollageImage[] | null;
  shortAboutTitle?: string | null;
  shortAboutText?: string | null;
  galleryTitle?: string | null;
  galleryText?: string | null;
  homeGalleryImage?: MediaDoc | null;
  ctaTitle?: string | null;
  ctaText?: string | null;
  aboutTitle?: string | null;
  aboutSubtitle?: string | null;
  aboutusHero?: MediaDoc | null;
  aboutus?: unknown;
  menu?: MediaDoc | null;
  newMenu?: NewMenuItem[] | null;
  logo?: MediaDoc | null;
  address?: string | null;
  location?: TenantLocation | null;
  openingHours?: string | null;
  phone?: string | null;
  email?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  heroMarqueeWords?: MarqueeWord[] | null;
  topbarNotification?: TopbarNotification | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: MediaDoc | null;
  } | null;
}

export interface HomeInformation {
  name?: string | null;
  logo?: MediaDoc | string | null;
  "quote(s)"?: Array<{ id?: string; quote: string }> | null;
  "Catch Phrase 1"?: string | null;
  "Catch Phrase Image 1"?: MediaDoc | string | null;
  "Catch Phrase 2"?: string | null;
  "Catch Phrase Image 2"?: MediaDoc | string | null;
  "Background Image (for Mobile)"?: MediaDoc | string | null;
}

export interface GalleryItem {
  id: string;
  image?: MediaDoc | null;
  caption?: string | null;
  branch?: { id: string; name: string } | null;
}

export interface Customer {
  id: string;
  customerName?: string | null;
  customerPhone?: string | null;
}
