import type { Metadata } from 'next'
import { buildTenantJsonLd, buildTenantMetadata } from '@/app/utils/seo'
import { fetchTenantServer } from '@/app/utils/tenantServer'
import { JsonLd } from '@/app/components/JsonLd'

interface SlugLayoutProps {
  children: React.ReactNode
  params: Promise<{ tenant: string; slug?: string[] }>
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug?: string[] }>
}): Promise<Metadata> {
  const { tenant: slug, slug: path } = await params
  const tenant = await fetchTenantServer(slug)
  if (!tenant) return { title: 'House of Senses', robots: { index: false } }
  return buildTenantMetadata(tenant, path?.[0] ?? '')
}

export default async function SlugLayout({ children, params }: SlugLayoutProps) {
  const { tenant: slug, slug: path } = await params
  const tenant = await fetchTenantServer(slug)
  const mainColor = tenant?.mainColor?.trim()

  return (
    <>
      {/* Brand color from the backend, applied on the server so there is no flash of the default */}
      {mainColor && HEX_COLOR.test(mainColor) && (
        <style>{`:root { --color-main: ${mainColor}; }`}</style>
      )}
      {tenant && <JsonLd data={buildTenantJsonLd(tenant, path?.[0] ?? '')} />}
      {children}
    </>
  )
}
