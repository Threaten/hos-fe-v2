import { MainLanding } from "@/components/main/MainLanding";
import { fetchHomeInformation, fetchTenants } from "@/lib/data";

export default async function Home() {
  const [home, tenants] = await Promise.all([
    fetchHomeInformation(),
    fetchTenants(),
  ]);

  return <MainLanding home={home} tenants={tenants} />;
}
