"use server";

import { createContactMessage, createReservation, upsertCustomer } from "@/lib/data";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function submitReservationAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const time = String(formData.get("time") || "").trim();
    const guests = Number(formData.get("guests") || 0);
    const notes = String(formData.get("notes") || "").trim();
    const branchId = String(formData.get("branchId") || "").trim();

    if (!name || !phone || !date || !time || !guests || !branchId) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const customer = await upsertCustomer(name, phone);
    const reservationDateTime = new Date(`${date}T${time}:00`).toISOString();

    await createReservation({
      customerId: customer.id,
      reservationDateTime,
      numberOfGuests: guests,
      specialRequests: notes || undefined,
      branchId,
    });

    return { success: true };
  } catch (err) {
    console.error("Reservation submission failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitContactAction(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const branchId = String(formData.get("branchId") || "").trim();

    if (!name || !phone || !branchId) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const customer = await upsertCustomer(name, phone);
    await createContactMessage({ customerId: customer.id, message, branchId });

    return { success: true };
  } catch (err) {
    console.error("Contact submission failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
