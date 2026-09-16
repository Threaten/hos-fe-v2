import { CMS_PROXY_PATH } from "@/lib/graphql";
import type { MediaDoc } from "@/types/payload";

/**
 * Real CMS content can contain dangling relationships (the referenced media
 * doc was deleted but the raw ID string remains on the parent doc). Payload
 * then returns that bare ID instead of null, even for fields marked
 * `required: true`. Treat anything that isn't a populated object as absent.
 */
function isPopulatedMedia(value: unknown): value is MediaDoc {
  return typeof value === "object" && value !== null && ("url" in value || "filename" in value);
}

/**
 * Builds a browser-usable URL for a Payload media document, routed through
 * the same-origin `/api/cms` proxy so it works for both dev and prod.
 */
export function mediaUrl(media?: MediaDoc | string | null): string {
  if (!isPopulatedMedia(media)) return "";
  if (media.url?.startsWith("http")) return media.url;
  if (media.url) return `${CMS_PROXY_PATH}${media.url}`;
  if (media.filename) return `${CMS_PROXY_PATH}/api/media/file/${media.filename}`;
  return "";
}
