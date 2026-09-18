import { notFound } from "next/navigation";
import { fetchTenantByDomain } from "@/lib/data";
import LuckyWheel from "@/components/wheel/LuckyWheel";

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantLuckyWheelPage({ params }: PageProps) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantByDomain(slug);
  if (!tenant) notFound();

  return <LuckyWheel tenant={tenant} />;
}
