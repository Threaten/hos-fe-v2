import { notFound } from "next/navigation";
import { fetchTenantByDomain } from "@/lib/data";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/tenant/SocialIcons";

export default async function TenantContactPage({
  params,
}: PageProps<"/t/[tenant]/contact">) {
  const { tenant: slug } = await params;
  const tenant = await fetchTenantByDomain(slug);
  if (!tenant) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
        {/* Left Column matching Image #1 */}
        <div className="lg:col-span-5 space-y-10">
          {/* Title Section */}
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl text-foreground font-semibold mb-4">
              Get in Touch
            </h2>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              Have a question or feedback? We&apos;d love to hear from you. Fill
              out the form and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {/* Location Info */}
          <div>
            <h3 className="font-heading text-xl sm:text-2xl text-foreground font-semibold mb-3">
              Our Location
            </h3>
            <div className="space-y-1.5 text-foreground/80 text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-foreground">
                {tenant.name.toLowerCase()}
              </p>
              {tenant.address && <p>{tenant.address}</p>}
              {tenant.phone && <p>{tenant.phone}</p>}
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

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-card/60 p-6 sm:p-10 rounded-xs border border-border/80 shadow-xs">
          <div className="mb-6 space-y-1">
            <h2 className="font-heading text-2xl text-foreground">
              Send us a Message
            </h2>
            <p className="text-xs text-foreground/65">
              We respond to all inquiries as promptly as possible.
            </p>
          </div>
          <ContactForm branchId={tenant.id} />
        </div>
      </div>
    </div>
  );
}
