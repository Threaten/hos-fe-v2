import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/tenant/SocialIcons";
import type { Tenant } from "@/types/payload";

export function SocialLinks({
  tenant,
  className = "",
}: {
  tenant: Tenant;
  className?: string;
}) {
  const links = [
    { href: tenant.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: tenant.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: tenant.tiktok, Icon: TiktokIcon, label: "TikTok" },
    { href: tenant.youtube, Icon: YoutubeIcon, label: "YouTube" },
  ].filter((l) => l.href);

  if (!links.length) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ href, Icon, label }) => (
        <a
          key={label}
          href={href!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-primary hover:text-primary"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
