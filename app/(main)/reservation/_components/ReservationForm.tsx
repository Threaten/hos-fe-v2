"use client";
import React, { useState, useEffect, useRef } from "react";
import { isReservationClosed } from "@/app/utils/openingStatus";

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
        id="date"
        onClick={() => setOpen((o) => !o)}
        className="hs-input text-left flex justify-between items-center"
        aria-invalid={hasError}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{ color: displayValue ? "var(--ink)" : "var(--ink-faint)" }}
      >
        <span>{displayValue || "Pick a day"}</span>
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" style={{ color: "var(--pen)" }}>
          <rect x="2" y="3" width="12" height="11" />
          <path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute z-50 mt-2 w-[19rem] max-w-[calc(100vw-48px)] p-4 border"
          style={{ background: "var(--paper)", borderColor: "var(--line)", borderRadius: 3, boxShadow: "0 16px 32px -20px oklch(20% 0.01 60 / 0.35)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-9 h-9 flex items-center justify-center transition-transform hover:-translate-x-0.5" aria-label="Previous month" style={{ color: "var(--pen)" }}>
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M10 3L5 8l5 5" strokeLinecap="square" />
              </svg>
            </button>
            <span className="hs-ui" style={{ color: "var(--ink)" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="w-9 h-9 flex items-center justify-center transition-transform hover:translate-x-0.5" aria-label="Next month" style={{ color: "var(--pen)" }}>
              <svg viewBox="0 0 16 16" className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M10 3L5 8l5 5" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="hs-ui text-center text-[0.75rem] pb-1" style={{ color: "var(--ink-soft)" }}>
                {d}
              </div>
            ))}
          </div>

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
                  aria-pressed={sel}
                  aria-label={`${day} ${MONTH_NAMES[viewMonth]}`}
                  className="w-9 h-9 mx-auto flex items-center justify-center text-[0.9rem] tabular-nums transition-colors"
                  style={{
                    color: sel ? "var(--on-pen)" : "var(--ink)",
                    backgroundColor: sel ? "var(--pen)" : "transparent",
                    border: tod && !sel ? "1px solid var(--pen)" : "1px solid transparent",
                    borderRadius: 3,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.3 : 1,
                    textDecoration: disabled ? "line-through" : "none",
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
import VisitNotes from "../../components/VisitNotes";

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

    if (reservationsClosed) return;

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

  const activeTenant =
    currentBranchTenant || tenants.find((t) => t.name === selectedBranch) || null;
  const reservationsClosed = isReservationClosed(activeTenant);
  const hourValue = formData.time ? formData.time.split(":")[0] : "";
  const minuteValue = formData.time ? formData.time.split(":")[1] : "";

  return (
    <div>
      {toast && (
        <div role="status" className={`hs-toast ${toast.type === "success" ? "hs-toast-success" : "hs-toast-error"}`}>
          {toast.type === "success" ? "Table requested! We'll call to confirm shortly." : toast.message}
        </div>
      )}

      <section className="hs-shell pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-8 items-start">
          <h1 className="hs-hero animate-rise text-center lg:text-left">book a table</h1>
          <p className="text-[1.1875rem] leading-[1.25] tracking-[-0.015em] xl:pt-3 text-center lg:text-left max-w-[34ch] mx-auto lg:mx-0 animate-rise" style={{ color: "var(--pen)" }}>
            Pick a day and a time and we&apos;ll call to confirm. For tonight,
            or anything special, just ring us.
          </p>
        </div>
      </section>

      <section className="hs-shell" aria-labelledby="reservation-heading">
        <h2 id="reservation-heading" className="hs-label mb-8 lg:mb-0">
          <span className="hs-rail-sticky block">Your reservation</span>
        </h2>
        <div className="hs-main grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] gap-x-10 gap-y-10">
        <div>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-8 max-w-[720px]"
            data-reveal
          >
            {reservationsClosed && (
              <p role="status" className="hs-note">
                {activeTenant?.name ?? "This branch"} is closed at the moment, so we can&apos;t take
                reservations. Please check back soon{activeTenant?.phone ? ` or call ${activeTenant.phone}` : ""}.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
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
            </div>

            <div className="hs-field">
              <label htmlFor="branch" className="hs-label">Which home</label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                disabled={!!currentTenant}
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
              {formData.branch && branchAddresses[formData.branch] && (
                <p className="hs-meta mt-1">{branchAddresses[formData.branch]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              <div className="hs-field">
                <label htmlFor="date" className="hs-label">Day</label>
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
                {errors.date && <p className="hs-error">{errors.date}</p>}
              </div>

              <div className="hs-field">
                <span className="hs-label" id="time-label">Time</span>
                <div className="flex items-center gap-2" role="group" aria-labelledby="time-label">
                  <select
                    aria-label="Hour"
                    value={hourValue}
                    onChange={(e) => {
                      const minute = formData.time ? formData.time.split(":")[1] : "00";
                      const time = `${e.target.value}:${minute || "00"}`;
                      setFormData((prev) => ({ ...prev, time }));
                      setErrors((prev) => ({
                        ...prev,
                        time: validateNotInPast(formData.date, time) ?? undefined,
                      }));
                    }}
                    className="hs-input tabular-nums"
                    aria-invalid={!!errors.time}
                    style={{ color: hourValue ? "var(--ink)" : "var(--ink-faint)" }}
                  >
                    <option value="" disabled>
                      hour
                    </option>
                    {[16, 17, 18, 19, 20, 21, 22].map((h) => (
                      <option key={h} value={String(h).padStart(2, "0")} disabled={isHourPast(h)}>
                        {String(h).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span className="hs-ui text-[1.2rem]" style={{ color: "var(--pen)" }} aria-hidden="true">:</span>
                  <select
                    aria-label="Minute"
                    value={minuteValue}
                    onChange={(e) => {
                      const hour = formData.time ? formData.time.split(":")[0] : "16";
                      const time = `${hour || "16"}:${e.target.value}`;
                      setFormData((prev) => ({ ...prev, time }));
                      setErrors((prev) => ({
                        ...prev,
                        time: validateNotInPast(formData.date, time) ?? undefined,
                      }));
                    }}
                    className="hs-input tabular-nums"
                    aria-invalid={!!errors.time}
                    style={{ color: minuteValue ? "var(--ink)" : "var(--ink-faint)" }}
                  >
                    <option value="" disabled>
                      min
                    </option>
                    {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                      <option key={m} value={m} disabled={isMinutePast(m)}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.time && <p className="hs-error">{errors.time}</p>}
                <p className="hs-meta mt-1">Last order 30 minutes before closing.</p>
              </div>
            </div>

            <div className="hs-field">
              <span className="hs-label" id="guests-label">How many of you</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="guests-label">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                  const on = formData.quantity === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={`${num} ${num === 1 ? "guest" : "guests"}`}
                      onClick={() => setFormData((prev) => ({ ...prev, quantity: num }))}
                      className="hs-ui w-11 h-11 text-[0.9375rem] tabular-nums transition-[background-color,color] duration-300"
                      style={{
                        border: "1px solid var(--pen)",
                        borderRadius: 3,
                        backgroundColor: on ? "var(--pen)" : "transparent",
                        color: on ? "var(--on-pen)" : "var(--pen)",
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hs-field">
              <label htmlFor="notes" className="hs-label">Anything we should know? <span style={{ color: "var(--ink-faint)" }}>(optional)</span></label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="a birthday, a quiet corner, no coriander…"
                className="hs-input"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || reservationsClosed}
              className="hs-btn hs-btn-solid self-start mt-2"
              aria-label="Submit reservation"
            >
              {isSubmitting ? "Sending…" : "Reserve my table"}
            </button>
          </form>
        </div>
        <VisitNotes tenant={activeTenant} />
        </div>
      </section>
    </div>
  );
};

export default ReservationForm;
