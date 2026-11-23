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
import VisitNotes from "../../components/VisitNotes";

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
  initialTenant,
}: {
  initialBranch?: string;
  currentTenant?: string;
  /** The branch, fetched on the server: the page then arrives complete (address, phone, form) */
  initialTenant?: Tenant | null;
}) => {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenant ? [initialTenant] : []);
  const [currentBranchTenant, setCurrentBranchTenant] = useState<Tenant | null>(
    initialTenant ?? null,
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(initialTenant?.name ?? "");
  const [isLoading, setIsLoading] = useState(!initialTenant);

  // Fetch tenants from API and detect subdomain (not needed when the server passed the branch)
  useEffect(() => {
    if (initialTenant) return;
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
  }, [currentTenant, initialBranch, initialTenant]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    branch: initialTenant?.name ?? "",
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

  const activeTenant =
    currentBranchTenant || tenants.find((t) => t.name === selectedBranch) || null;

  return (
    <div>
      {toast && (
        <div role="status" className={`hs-toast ${toast.type === "success" ? "hs-toast-success" : "hs-toast-error"}`}>
          {toast.type === "success" ? "Got it! We'll be in touch soon." : toast.message}
        </div>
      )}

      {isLoading ? (
        <p className="hs-note min-h-[400px] flex items-center justify-center animate-pulse">Loading…</p>
      ) : (
        <>
        <section className="hs-shell pt-8 md:pt-12 pb-8 md:pb-12">
          <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-8 items-start">
            <h1 className="hs-hero animate-rise text-center lg:text-left">get in touch</h1>
            <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] xl:pt-3 text-center lg:text-left max-w-[34ch] mx-auto lg:mx-0 animate-rise" style={{ color: "var(--pen)" }}>
              A question, a kind word, or a party of twelve? Leave us a note and
              we&apos;ll get back to you soon.
            </p>
          </div>
        </section>
        <section className="hs-shell" aria-labelledby="note-heading">
          <h2 id="note-heading" className="hs-label mb-8 lg:mb-0">
            <span className="hs-rail-sticky block">Leave us a note</span>
          </h2>
          <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-10">
          <div>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-8 max-w-[640px]"
              data-reveal
            >

              <div className="hs-field">
                <label htmlFor="name" className="hs-label">Your name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="hs-input"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" className="hs-error">{errors.name}</p>}
              </div>

              <div className="hs-field">
                <label htmlFor="phone" className="hs-label">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="09xx xxx xxx"
                  className="hs-input"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && <p id="phone-error" className="hs-error">{errors.phone}</p>}
              </div>

              <div className="hs-field">
                <label htmlFor="branch" className="hs-label">Which home</label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={!!currentBranchTenant}
                  className="hs-input"
                  aria-invalid={!!errors.branch}
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.name}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                {errors.branch && <p className="hs-error">{errors.branch}</p>}
              </div>

              <div className="hs-field">
                <label htmlFor="message" className="hs-label">Message <span style={{ color: "var(--ink-faint)" }}>(optional)</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="hs-input"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="hs-btn hs-btn-solid self-start mt-2"
                aria-label="Send contact message"
              >
                {isSubmitting ? "Sending…" : "Send the note"}
              </button>
            </form>
          </div>
          <VisitNotes tenant={activeTenant} />
          </div>
        </section>
        </>
      )}
    </div>
  );
};

export default ContactForm;
