import type { Tenant } from "@/api/queries";

type Place = Pick<Tenant, "name" | "address" | "location">;

/**
 * What to search for: the address when there is one, else the coordinates.
 * The CMS defaults coordinates to 0,0 (the Gulf of Guinea), so those count
 * as missing.
 */
function query(place: Place): string {
  if (place.address) return place.address;
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (typeof lat === "number" && typeof lng === "number" && (lat !== 0 || lng !== 0)) return `${lat},${lng}`;
  return place.name;
}

/** Opens Google Maps on the branch */
export function mapsUrl(place: Place): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(place))}`;
}

/** Keyless Google Maps embed for an <iframe> */
export function mapsEmbedUrl(place: Place): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query(place))}&z=16&output=embed`;
}
