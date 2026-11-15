import type { Tenant } from "@/api/queries";
import { photoGroups } from "@/app/utils/photos";
import Hero from "./Hero";
import Collection from "./Collection";
import Story from "./Story";
import InstagramEmbed from "../../components/InstagramEmbed";

/** The branch home page: headline, photo index, story, socials */
export default function HomeSections({
  tenant,
  prioritizeImages = true,
}: {
  tenant: Tenant | null;
  /** Set false when something covers the page on load (e.g. the updates modal) */
  prioritizeImages?: boolean;
}) {
  const name = tenant?.name ?? "House of Senses";
  const groups = photoGroups(tenant);

  return (
    <div>
      <Hero tenant={tenant} />
      <Collection groups={groups} name={name} priority={prioritizeImages} pageSize={9} />
      <Story tenant={tenant} />
      <InstagramEmbed tenant={tenant} />
    </div>
  );
}
