import { notFound } from "next/navigation";
import { fetchTenantByDomain } from "@/lib/data";
import { ReservationForm } from "@/components/reservation/ReservationForm";
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/tenant/SocialIcons";

export default async function TenantReservationPage({
  params,
}: PageProps<"/t/[tenant]/reservation">) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantByDomain(slug);
  if (!tenant) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
        {/* Left Column matching Image #2 */}
        <div className="lg:col-span-5 space-y-10">
          {/* Title Section */}
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl text-foreground font-semibold mb-4">
              Our Restaurant
            </h2>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              Experience fine dining at its best. Reserve your table and let us
              create an unforgettable culinary experience for you.
            </p>
          </div>

          {/* Hotline Info */}
          <div>
            <h3 className="font-heading text-xl sm:text-2xl text-foreground font-semibold mb-2">
              Hotline
            </h3>
            <p className="text-sm sm:text-base text-foreground/75 mb-4 leading-relaxed">
              For last-minute reservations or special occasion arrangements,
              please contact us directly.
            </p>
            <div className="space-y-1.5 text-foreground/80 text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-foreground">
                {tenant.name.toLowerCase()}
              </p>
              {tenant.phone && (
                <p>
                  <a
                    href={`tel:${tenant.phone}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {tenant.phone}
                  </a>
                </p>
              )}
              {tenant.address && <p>{tenant.address}</p>}
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-xl sm:text-2xl text-foreground font-semibold mb-4">
              Our Contact
            </h3>
            <div className="grid grid-cols-2 gap-8 text-sm sm:text-base">
              <div>
                <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider text-foreground/75">
                  Email
                </p>
                {tenant.email ? (
                  <a
                    href={`mailto:${tenant.email}`}
                    className="text-foreground/85 hover:text-primary transition-colors break-all"
                  >
                    {tenant.email}
                  </a>
                ) : (
                  <p className="text-foreground/70 italic">
                    No email available
                  </p>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider text-foreground/75">
                  Phone
                </p>
                {tenant.phone ? (
                  <a
                    href={`tel:${tenant.phone}`}
                    className="text-foreground/85 hover:text-primary transition-colors"
                  >
                    {tenant.phone}
                  </a>
                ) : (
                  <p className="text-foreground/70 italic">
                    No phone available
                  </p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Social Media */}
          <div>
            <h3 className="font-heading text-xl sm:text-2xl text-foreground font-semibold mb-4">
              Follow us
            </h3>
            <div className="flex items-center gap-4 text-foreground/80">
              {tenant.facebook && (
                <a
                  href={tenant.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-transform hover:scale-110"
                  aria-label={`${tenant.name} on Facebook`}
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {tenant.instagram && (
                <a
                  href={tenant.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-transform hover:scale-110"
                  aria-label={`${tenant.name} on Instagram`}
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {tenant.tiktok && (
                <a
                  href={tenant.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-transform hover:scale-110"
                  aria-label={`${tenant.name} on TikTok`}
                >
                  <TiktokIcon className="w-5 h-5" />
                </a>
              )}
              {tenant.youtube && (
                <a
                  href={tenant.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-transform hover:scale-110"
                  aria-label={`${tenant.name} on YouTube`}
                >
                  <YoutubeIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Form */}
        <div className="lg:col-span-7 bg-card/60 p-6 sm:p-10 rounded-xs border border-border/80 shadow-xs">
          <div className="mb-6 space-y-1">
            <h2 className="font-heading text-2xl text-foreground">
              Book a Table
            </h2>
            <p className="text-xs text-foreground/65">
              {tenant.openingHours ? `Hours: ${tenant.openingHours}. ` : ""}
              Please select your preferred date, time, and party size.
            </p>
          </div>
          <ReservationForm branchId={tenant.id} />
        </div>
      </div>
    </div>
  );
}
