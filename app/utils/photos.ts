import type { CmsMedia, Tenant } from "@/api/queries";
import { resolveBackendMediaUrl } from "@/app/utils/media";
import type { CollectionGroup, CollectionImage } from "@/app/(main)/home/_components/Collection";

/** A CMS photo as a tile: its caption doubles as alt text */
export function toImage(media: CmsMedia | null | undefined, fallbackAlt: string): CollectionImage | null {
  const src = resolveBackendMediaUrl(media);
  if (!src) return null;
  const caption = media?.caption?.trim() || undefined;
  return { src, alt: media?.alt?.trim() || caption || fallbackAlt, caption };
}

/** The branch's photo sets as photo-index filters, empty sets dropped */
export function photoGroups(tenant: Tenant | null | undefined): CollectionGroup[] {
  const name = tenant?.name ?? "House of Senses";
  return (tenant?.photoSets ?? []).flatMap((set, i) => {
    const images = (set.photos ?? []).flatMap((photo, j) => {
      const img = toImage(photo, `${set.title} at ${name}, photo ${j + 1}`);
      return img ? [img] : [];
    });
    return images.length ? [{ key: set.id || `set-${i}`, label: set.title, images }] : [];
  });
}
