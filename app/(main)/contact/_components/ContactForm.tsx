"use client";
import React, { useState, useEffect } from "react";
import {
  fetchTenants,
  fetchTenantBySlug,
  getCustomerByPhone,
  createCustomer,
  createContactMessage,
  type Tenant,
} from "@/api/queries";

interface FormData {
  name: string;
  phone: string;
  branch: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  branch?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const ContactForm = ({
  initialBranch,
  currentTenant,
}: {
  initialBranch?: string;
  currentTenant?: string;
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentBranchTenant, setCurrentBranchTenant] = useState<Tenant | null>(
    null,
  );
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tenants from API and detect subdomain
  useEffect(() => {
    const loadTenants = async () => {
      try {
        // Detect if we're on a tenant subdomain
        const { getCurrentSubdomain } = await import("@/app/utils/domain");
        const subdomainSlug = getCurrentSubdomain();

        // If on subdomain, fetch that specific tenant
        if (subdomainSlug && subdomainSlug !== "admin") {
          const tenant = await fetchTenantBySlug(subdomainSlug);
          if (tenant) {
            setCurrentBranchTenant(tenant);
            setTenants([tenant]);
            setSelectedBranch(tenant.name);
          }
        } else {
          // Otherwise fetch all tenants
          const data = await fetchTenants();
          if (data && data.length > 0) {
            setTenants(data);

            // Auto-select branch based on currentTenant (subdomain) or initialBranch
            if (currentTenant) {
              const tenant = data.find(
                (t: Tenant) => t.domain === currentTenant,
              );
              if (tenant) {
                setSelectedBranch(tenant.name);
              }
            } else if (initialBranch) {
              const decodedBranch = decodeURIComponent(
                initialBranch.replace(/\+/g, " "),
              );
              setSelectedBranch(decodedBranch);
            } else {
              setSelectedBranch(data[0].name);
            }
          }
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    loadTenants();
  }, [currentTenant, initialBranch]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    branch: "",
    message: "",
  });

  // Update form data when selectedBranch changes
  useEffect(() => {
    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branch: selectedBranch,
      }));
    }
  }, [selectedBranch]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const validateVietnamesePhone = (phone: string): boolean => {
    // Vietnamese phone number patterns:
    // Mobile: 03, 05, 07, 08, 09 + 8 digits
    // Landline: 02 + 9 digits
    const mobileRegex = /^(03|05|07|08|09)[0-9]{8}$/;
    const landlineRegex = /^02[0-9]{9}$/;
    const cleanPhone = phone.replace(/\s+/g, "");
    return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 5) {
      newErrors.name = "Name must be at least 5 characters";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validateVietnamesePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Vietnamese phone number";
    }

    // Validate branch
    if (!formData.branch) {
      newErrors.branch = "Please select a branch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Check if customer exists
      let customer = await getCustomerByPhone(formData.phone);

      // Step 2: Create customer if doesn't exist
      if (!customer) {
        customer = await createCustomer(formData.name, formData.phone);
      }

      // Step 3: Ensure customer exists
      if (!customer) {
        throw new Error("Failed to create or retrieve customer");
      }

      // Step 4: Find the selected tenant
      const selectedTenant = tenants.find((t) => t.name === formData.branch);

      if (!selectedTenant) {
        throw new Error("Selected branch not found");
      }

      // Step 5: Create contact message
      await createContactMessage(
        customer.id,
        formData.message,
        selectedTenant.id,
      );

      // Show success toast
      setToast({
        message: "Message sent successfully!",
        type: "success",
      });

      // Reset form - preserve branch based on currentTenant or keep current selection
      setFormData({
        name: "",
        phone: "",
        branch: selectedBranch,
        message: "",
      });
      setErrors({});
    } catch {
      setToast({
        message: "We could not send your message. Please check the details and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="bg-paper hos-gutter pt-12 md:pt-[78px] pb-20 md:pb-[112px]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 z-50 transition-all text-paper ${
            toast.type === "success"
              ? "bg-[var(--color-ink)]"
              : "bg-red-700"
          }`}
        >
          <p className="">{toast.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-foreground/90">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[50%_1fr] gap-16 lg:gap-0">
          {/* Left Side - Info */}
          <div className="space-y-12 lg:pr-16">
            {/* Title Section */}
            <div>
              <h1 className="hos-display mb-6" style={{ color: "var(--color-main)" }}>
                Get in touch
              </h1>
              <p className="text-foreground/90 leading-relaxed">
                Have a question or feedback? We&apos;d love to hear from you.
                Fill out the form and we&apos;ll get back to you as soon as
                possible.
              </p>
            </div>

            {/* Branch Info */}
            <div>
              <h3 className="hos-label mb-4">
                {currentBranchTenant ? "Our Location" : "Our Locations"}
              </h3>
              <div className="space-y-6">
                {currentBranchTenant ? (
                  <div>
                    <p className="font-serif text-[1.6rem] leading-none mb-2" style={{ color: "var(--color-main)" }}>
                      {currentBranchTenant.name.toLowerCase()}
                    </p>
                    {currentBranchTenant.address && (
                      <p className="text-foreground/90">
                        {currentBranchTenant.address}
                      </p>
                    )}
                    {currentBranchTenant.phone && (
                      <p className="text-foreground/90">
                        {currentBranchTenant.phone}
                      </p>
                    )}
                  </div>
                ) : tenants && tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <div key={tenant.id}>
                      <p className="font-serif text-[1.6rem] leading-none mb-2" style={{ color: "var(--color-main)" }}>
                        {tenant.name.toLowerCase()}
                      </p>
                      {tenant.address && (
                        <p className="text-foreground/90">{tenant.address}</p>
                      )}
                      {tenant.phone && (
                        <p className="text-foreground/90">{tenant.phone}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-foreground/90">Loading locations...</p>
                )}
              </div>
            </div>

            <hr className="hos-rule" />

            {/* Contact Info */}
            <div>
              <h3 className="hos-label mb-4">
                Our Contact
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-medium mb-1">Email</p>
                  {(() => {
                    const tenant =
                      currentBranchTenant ||
                      tenants.find((t) => t.name === selectedBranch);
                    const email = tenant?.email;
                    return email ? (
                      <a
                        href={`mailto:${email}`}
                        className="text-foreground/90 hover:text-foreground"
                      >
                        {email}
                      </a>
                    ) : (
                      <p className="text-foreground/65">No email available</p>
                    );
                  })()}
                </div>
                <div>
                  <p className="font-medium mb-1">Phone</p>
                  {(() => {
                    const tenant =
                      currentBranchTenant ||
                      tenants.find((t) => t.name === selectedBranch);
                    const phone = tenant?.phone;
                    return phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="text-foreground/90 hover:text-foreground"
                      >
                        {phone}
                      </a>
                    ) : (
                      <p className="text-foreground/65">No phone available</p>
                    );
                  })()}
                </div>
              </div>
            </div>

            <hr className="hos-rule" />

            {/* Social Media */}
            <div>
              <h3 className="hos-label mb-4">
                Follow us
              </h3>
              <div className="flex gap-4">
                {(() => {
                  const tenant =
                    currentBranchTenant ||
                    tenants.find((t) => t.name === selectedBranch);
                  return (
                    <>
                      {tenant?.facebook && (
                        <a
                          href={tenant.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/90 hover:text-foreground transition-all duration-300 hover:opacity-70"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      )}
                      {tenant?.instagram && (
                        <a
                          href={tenant.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/90 hover:text-foreground transition-all duration-300 hover:opacity-70"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {tenant?.tiktok && (
                        <a
                          href={tenant.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/90 hover:text-foreground transition-all duration-300 hover:opacity-70"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                        </a>
                      )}
                      {tenant?.youtube && (
                        <a
                          href={tenant.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/90 hover:text-foreground transition-all duration-300 hover:opacity-70"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </a>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:border-l lg:pl-16 border-[color:var(--color-line)]">
            <h2 className="hos-display mb-8" style={{ color: "var(--color-main)" }}>
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-0 py-3 border-0 border-b focus:ring-0 focus:border-foreground outline-none transition-all bg-transparent ${
                    errors.name ? "border-red-500" : "border-foreground/20"
                  }`}
                  placeholder="Name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-0 py-3 border-0 border-b focus:ring-0 focus:border-foreground outline-none transition-all bg-transparent ${
                    errors.phone ? "border-red-500" : "border-foreground/20"
                  }`}
                  placeholder="Phone"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Branch */}
              <div>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={!!currentBranchTenant}
                  className={`w-full px-0 py-3 border-0 border-b focus:ring-0 focus:border-foreground outline-none transition-all bg-transparent appearance-none text-foreground ${
                    errors.branch ? "border-red-500" : "border-foreground/20"
                  } ${currentBranchTenant ? "opacity-60 cursor-not-allowed" : ""}`}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundPosition: "right center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.name}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="mt-1 text-sm text-red-500">{errors.branch}</p>
                )}
                {formData.branch && (() => {
                  const t = currentBranchTenant || tenants.find((t) => t.name === formData.branch);
                  return t?.address ? (
                    <p className="mt-2 text-sm text-foreground/90">{t.address}</p>
                  ) : null;
                })()}
              </div>

              {/* Message */}
              <div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-0 py-3 border-0 border-b border-foreground/20 focus:ring-0 focus:border-foreground outline-none transition-all bg-transparent resize-none"
                  placeholder="Message (Optional)"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="hos-btn hos-btn-solid w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send contact message"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
