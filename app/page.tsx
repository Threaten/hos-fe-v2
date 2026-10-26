import type { Metadata } from "next";
import Welcome from "./_components/Welcome";
import { JsonLd } from "./components/JsonLd";
import { buildRootJsonLd, buildRootMetadata } from "./utils/seo";
import { fetchHomeInformationServer, fetchTenantsServer } from "./utils/tenantServer";
import type { Tenant } from "@/api/queries";

// Branch list and opening details change in the CMS; refresh every 5 minutes
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata(await fetchTenantsServer());
}

export default async function Home() {
  const [branches, homeInfo] = await Promise.all([
    fetchTenantsServer(),
    fetchHomeInformationServer(),
  ]);

  return (
    <>
      <JsonLd data={buildRootJsonLd(branches, homeInfo?.logo?.url)} />
      <Welcome initialBranches={branches as Tenant[]} initialHomeInfo={homeInfo} />
    </>
  );
}
