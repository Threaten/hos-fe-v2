"use client";
import React, { useState, useEffect, useRef } from "react";

// ─── Calendar Picker ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Bookable window: first slot 16:00, last slot 22:00
const FIRST_SLOT_MINUTES = 16 * 60;
const LAST_SLOT_MINUTES = 22 * 60;

/**
 * "YYYY-MM-DD" (+ "HH:MM") as a local Date. `new Date("YYYY-MM-DD")` parses
 * as UTC midnight, which is 07:00 in Vietnam and breaks same-day checks.
 */
function toLocalDateTime(date: string, time = "00:00"): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function CalendarPicker({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value + "T00:00:00") : null;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? today.getMonth(),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const select = (day: number) => {
    const yyyy = viewYear;
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d < today) return true;
    // Today is closed once the last bookable slot is no longer in the future
    const now = new Date();
    return isSameLocalDay(d, now) && minutesSinceMidnight(now) >= LAST_SLOT_MINUTES;
  };
  const isSelected = (day: number) =>
    !!selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const displayValue = selected
    ? selected.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-0 py-3 border-0 border-b focus:ring-0 outline-none transition-all bg-transparent text-left flex justify-between items-center ${
          hasError ? "border-red-400" : ""
        }`}
        style={{
          borderBottomColor: hasError
            ? undefined
            : "color-mix(in srgb, var(--color-tan) 40%, transparent)",
          color: displayValue ? "var(--foreground)" : "var(--color-sand)",
        }}
      >
        <span className="text-[13px] tracking-[0.04em]">
          {displayValue || "Select date"}
        </span>
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: "var(--color-sand)", opacity: 0.85 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 p-4 w-72"
          style={{
            backgroundColor: "var(--background)",
            border:
              "1px solid color-mix(in srgb, var(--color-tan) 40%, transparent)",
            boxShadow:
              "0 8px 32px color-mix(in srgb, var(--color-earth) 8%, transparent)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 transition-opacity hover:opacity-50"
              aria-label="Previous month"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: "var(--color-sand)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span
              className="text-[11px] tracking-[0.18em] uppercase font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 transition-opacity hover:opacity-50"
              aria-label="Next month"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: "var(--color-sand)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center text-[9px] tracking-[0.15em] uppercase pb-1"
                style={{ color: "var(--color-sand)" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array(firstDayOfWeek)
              .fill(null)
              .map((_, i) => (
                <div key={`e-${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const disabled = isDisabled(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => select(day)}
                  className="w-8 h-8 mx-auto flex items-center justify-center text-[12px] rounded-full transition-opacity"
                  style={{
                    color: disabled
                      ? "var(--color-tan)"
                      : sel
                        ? "var(--color-parchment)"
                        : "var(--foreground)",
                    backgroundColor: sel
                      ? "var(--color-earth)"
                      : tod && !sel
                        ? "transparent"
                        : "transparent",
                    border:
                      tod && !sel
                        ? "1px solid color-mix(in srgb, var(--color-gold) 60%, transparent)"
                        : "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.35 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
import {
  fetchTenants,
  fetchTenantBySlug,
  getCustomerByPhone,
  createCustomer,
  createReservation,
  type Tenant,
} from "@/api/queries";

interface FormData {
  name: string;
  phone: string;
  branch: string;
  date: string;
  time: string;
  quantity: number;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  branch?: string;
  date?: string;
  time?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const ReservationForm = ({
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
          if (data.length > 0) {
            setTenants(data);

            // Auto-select branch based on currentTenant (subdomain) or initialBranch
            if (currentTenant) {
              // Try exact match first, then case-insensitive match
              let tenant = data.find((t: Tenant) => t.domain === currentTenant);
              if (!tenant) {
                tenant = data.find(
                  (t: Tenant) =>
                    t.domain?.toLowerCase() === currentTenant.toLowerCase(),
                );
              }
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
      } catch {}
    };

    loadTenants();
  }, [currentTenant, initialBranch]);

  const branchAddresses: Record<string, string> = tenants.reduce(
    (acc, tenant) => {
      if (tenant.address) {
        acc[tenant.name] = tenant.address;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    branch: "",
    date: "",
    time: "",
    quantity: 2,
    notes: "",
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

  const validateDate = (date: string, time: string): string | null => {
    if (!date) return "Date is required";

    const selectedDate = toLocalDateTime(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Date must be today or later";
    }

    if (
      isSameLocalDay(selectedDate, today) &&
      minutesSinceMidnight(new Date()) >= LAST_SLOT_MINUTES
    ) {
      return "Today's last booking time has passed. Please choose another day";
    }

    return null;
  };

  /** The chosen date + time must be strictly later than now. */
  const validateNotInPast = (date: string, time: string): string | null => {
    if (!date || !time) return null;
    if (toLocalDateTime(date, time) <= new Date()) {
      return "Please choose a time later than now";
    }
    return null;
  };

  const validateTime = (time: string): string | null => {
    if (!time) return "Time is required";

    const [hours, minutes] = time.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;

    if (timeInMinutes < FIRST_SLOT_MINUTES || timeInMinutes > LAST_SLOT_MINUTES) {
      return "Time must be between 16:00 and 22:00";
    }

    return null;
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

    // Validate date
    const dateError = validateDate(formData.date, formData.time);
    if (dateError) {
      newErrors.date = dateError;
    }

    // Validate time, then that date + time is still in the future
    const timeError =
      validateTime(formData.time) ??
      (newErrors.date ? null : validateNotInPast(formData.date, formData.time));
    if (timeError) {
      newErrors.time = timeError;
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
      // First, check if customer exists by phone
      let customer = await getCustomerByPhone(formData.phone);

      // If customer doesn't exist, create them
      if (!customer) {
        customer = await createCustomer(formData.name, formData.phone);
      }

      // Ensure customer exists
      if (!customer) {
        throw new Error("Failed to create or retrieve customer");
      }

      // Find the branch/tenant ID by name
      const selectedTenant = tenants.find((t) => t.name === formData.branch);
      if (!selectedTenant) {
        throw new Error("Branch not found");
      }

      // Combine date and time into ISO datetime string
      const reservationDateTime = new Date(
        `${formData.date}T${formData.time}`,
      ).toISOString();

      // Now create the reservation with the customer ID
      await createReservation(
        customer.id,
        reservationDateTime,
        formData.quantity,
        formData.notes || undefined,
        selectedTenant.id,
      );

      // Show success toast
      setToast({
        message: "Reservation submitted successfully!",
        type: "success",
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        branch: selectedBranch || tenants[0]?.name || "",
        date: "",
        time: "",
        quantity: 2,
        notes: "",
      });
      setErrors({});
    } catch {
      setToast({
        message: "We could not submit the reservation. Please check the details and try again.",
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
      [name]: name === "quantity" ? parseInt(value) : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // When today is selected, slots at or before the current minute can't be booked
  const now = new Date();
  const nowMinutes = minutesSinceMidnight(now);
  const isTodaySelected =
    !!formData.date && isSameLocalDay(toLocalDateTime(formData.date), now);
  const selectedHour = formData.time ? formData.time.split(":")[0] : "";
  const lastMinuteOfHour = (h: number) => (h * 60 >= LAST_SLOT_MINUTES ? 0 : 55);
  const isHourPast = (h: number) =>
    isTodaySelected && h * 60 + lastMinuteOfHour(h) <= nowMinutes;
  const isMinutePast = (m: string) =>
    isTodaySelected &&
    !!selectedHour &&
    Number(selectedHour) * 60 + Number(m) <= nowMinutes;

  return (
    <div
      className="hos-gutter pt-12 md:pt-[78px] pb-20 md:pb-[112px]"
      style={{ backgroundColor: "var(--background)" }}
    >
      {toast && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 z-50 transition-all ${
            toast.type === "success"
              ? "bg-[var(--color-ink)] text-paper"
              : "bg-red-700 text-paper"
          }`}
        >
          <p className="text-sm tracking-wide">{toast.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[50%_1fr] gap-16 lg:gap-0">
        <div className="space-y-12 lg:pr-16">
          <div>
            <h1 className="hos-display mb-6" style={{ color: "var(--color-main)" }}>
              Book a table
            </h1>
            <p className="text-[color:var(--color-ink)] leading-relaxed">
              Choose a branch, date, and time. The team will confirm your table
              shortly.
            </p>
          </div>

          <div>
            <h3 className="hos-label mb-4">
              Hotline
            </h3>
            <label className="text-base text-[color:var(--color-ink)]">
              For last-minute reservations or special occasion arrangements,
              please contact us directly.
            </label>
            <div className="space-y-2 text-[color:var(--color-ink)] mt-4">
              {(() => {
                const tenant =
                  currentBranchTenant ||
                  tenants.find((t) => t.name === selectedBranch);
                return (
                  <>
                    <p className="font-medium">
                      {tenant?.name.toLowerCase() || "houseofsenses.vn"}
                    </p>
                    <a
                      href={`tel:${tenant?.phone}`}
                      className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                    >
                      {tenant?.phone}
                    </a>
                    <br />
                    <p className="hover:text-[color:var(--color-ink)]">
                      {tenant?.address || "No address available"}
                    </p>
                  </>
                );
              })()}
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
                      className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                    >
                      {email}
                    </a>
                  ) : (
                    <p className="text-[color:var(--color-ink-muted)]">No email available</p>
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
                      className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)]"
                    >
                      {phone}
                    </a>
                  ) : (
                    <p className="text-[color:var(--color-ink-muted)]">No phone available</p>
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
                        className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] transition-all duration-300 hover:opacity-70"
                        aria-label="Facebook"
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
                        className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] transition-all duration-300 hover:opacity-70"
                        aria-label="Instagram"
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
                        className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] transition-all duration-300 hover:opacity-70"
                        aria-label="TikTok"
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
                        className="text-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] transition-all duration-300 hover:opacity-70"
                        aria-label="YouTube"
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
        <div
          className="lg:border-l lg:pl-16"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-tan) 35%, transparent)",
          }}
        >
          <h2 className="hos-display mb-8" style={{ color: "var(--color-main)" }}>
            Your reservation
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
                className="w-full px-0 py-3 border-0 border-b focus:ring-0 outline-none transition-all bg-transparent text-[13px] tracking-[0.04em] placeholder:text-(--color-sand)"
                style={{
                  borderBottomColor: errors.name
                    ? "rgb(239 68 68)"
                    : "color-mix(in srgb, var(--color-tan) 40%, transparent)",
                  color: "var(--foreground)",
                }}
                placeholder="Full Name"
              />
              {errors.name && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "rgb(239 68 68)" }}
                >
                  {errors.name}
                </p>
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
                className="w-full px-0 py-3 border-0 border-b focus:ring-0 outline-none transition-all bg-transparent text-[13px] tracking-[0.04em] placeholder:text-(--color-sand)"
                style={{
                  borderBottomColor: errors.phone
                    ? "rgb(239 68 68)"
                    : "color-mix(in srgb, var(--color-tan) 40%, transparent)",
                  color: "var(--foreground)",
                }}
                placeholder="Phone Number"
                autoComplete="tel"
                inputMode="tel"
              />
              {errors.phone && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "rgb(239 68 68)" }}
                >
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Branch */}
            <div>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                disabled={!!currentTenant}
                className="w-full px-0 py-3 border-0 border-b focus:ring-0 outline-none transition-all bg-transparent appearance-none text-[13px] tracking-[0.04em]"
                style={{
                  borderBottomColor: errors.branch
                    ? "rgb(239 68 68)"
                    : "color-mix(in srgb, var(--color-tan) 40%, transparent)",
                  color: "var(--foreground)",
                  opacity: currentTenant ? 0.55 : 1,
                  backgroundImage: currentTenant
                    ? "none"
                    : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238a7d6a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundPosition: "right center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  pointerEvents: currentTenant ? "none" : "auto",
                }}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.name}>
                    {tenant.name}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "rgb(239 68 68)" }}
                >
                  {errors.branch}
                </p>
              )}
              {formData.branch && (
                <p
                  className="mt-2 text-[11px] leading-relaxed"
                  style={{ color: "var(--color-sand)" }}
                >
                  {branchAddresses[formData.branch]}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <CalendarPicker
                value={formData.date}
                hasError={!!errors.date}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, date: value }));
                  setErrors((prev) => ({
                    ...prev,
                    date: undefined,
                    time: validateNotInPast(value, formData.time) ?? undefined,
                  }));
                }}
              />
              {errors.date && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "rgb(239 68 68)" }}
                >
                  {errors.date}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <div
                className="flex items-center gap-2 border-b py-3 transition-all"
                style={{
                  borderBottomColor: errors.time
                    ? "rgb(239 68 68)"
                    : "color-mix(in srgb, var(--color-tan) 40%, transparent)",
                }}
              >
                <select
                  value={formData.time ? formData.time.split(":")[0] : ""}
                  onChange={(e) => {
                    const minute = formData.time
                      ? formData.time.split(":")[1]
                      : "00";
                    const time = `${e.target.value}:${minute || "00"}`;
                    setFormData((prev) => ({ ...prev, time }));
                    setErrors((prev) => ({
                      ...prev,
                      time: validateNotInPast(formData.date, time) ?? undefined,
                    }));
                  }}
                  className="flex-1 bg-transparent border-0 outline-none focus:ring-0 appearance-none cursor-pointer text-[13px]"
                  style={{
                    color:
                      formData.time && formData.time.split(":")[0]
                        ? "var(--foreground)"
                        : "var(--color-sand)",
                  }}
                >
                  <option value="" disabled>
                    Hour
                  </option>
                  {[16, 17, 18, 19, 20, 21, 22].map((h) => (
                    <option
                      key={h}
                      value={String(h).padStart(2, "0")}
                      disabled={isHourPast(h)}
                    >
                      {String(h).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "var(--color-tan)" }}
                >
                  :
                </span>
                <select
                  value={formData.time ? formData.time.split(":")[1] : ""}
                  onChange={(e) => {
                    const hour = formData.time
                      ? formData.time.split(":")[0]
                      : "16";
                    const time = `${hour || "16"}:${e.target.value}`;
                    setFormData((prev) => ({ ...prev, time }));
                    setErrors((prev) => ({
                      ...prev,
                      time: validateNotInPast(formData.date, time) ?? undefined,
                    }));
                  }}
                  className="flex-1 bg-transparent border-0 outline-none focus:ring-0 appearance-none cursor-pointer text-[13px]"
                  style={{
                    color:
                      formData.time && formData.time.split(":")[1]
                        ? "var(--foreground)"
                        : "var(--color-sand)",
                  }}
                >
                  <option value="" disabled>
                    Min
                  </option>
                  {[
                    "00",
                    "05",
                    "10",
                    "15",
                    "20",
                    "25",
                    "30",
                    "35",
                    "40",
                    "45",
                    "50",
                    "55",
                  ].map((m) => (
                    <option key={m} value={m} disabled={isMinutePast(m)}>
                      {m}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "var(--color-sand)", opacity: 0.85 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {errors.time && (
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "rgb(239 68 68)" }}
                >
                  {errors.time}
                </p>
              )}
              <p
                className="mt-2 text-[11px]"
                style={{ color: "var(--color-sand)" }}
              >
                Last order: 30 minutes before closing.
              </p>
            </div>

            {/* Quantity */}
            <div>
              <select
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-0 py-3 border-0 border-b focus:ring-0 outline-none transition-all bg-transparent appearance-none text-[13px] tracking-[0.04em]"
                style={{
                  borderBottomColor:
                    "color-mix(in srgb, var(--color-tan) 40%, transparent)",
                  color: "var(--foreground)",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238a7d6a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                  backgroundPosition: "right center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-0 py-3 border-0 border-b focus:ring-0 outline-none transition-all bg-transparent resize-none text-[13px] tracking-[0.04em] placeholder:text-(--color-sand)"
                style={{
                  borderBottomColor:
                    "color-mix(in srgb, var(--color-tan) 40%, transparent)",
                  color: "var(--foreground)",
                }}
                placeholder="Special Requests (Optional)"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="hos-btn hos-btn-solid w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit reservation"
            >
              {isSubmitting ? "Submitting..." : "Reserve a table"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
