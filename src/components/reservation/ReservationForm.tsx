"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReservationAction } from "@/lib/actions";

export function ReservationForm({ branchId }: { branchId: string }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

  if (sent) {
    return (
      <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-3xl text-foreground">
          Reservation Request Received
        </h3>
        <p className="text-foreground/70 text-sm max-w-md mx-auto leading-relaxed">
          Thank you. We&apos;ve received your table request and our host will
          call you shortly to confirm your booking.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-link text-xs uppercase tracking-widest text-primary font-medium"
          >
            <span>Book another table</span>
            <span aria-hidden>↺</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      action={(formData) => {
        setError("");
        startTransition(async () => {
          const result = await submitReservationAction(formData);
          if (result.success) {
            setSent(true);
            toast.success("Reservation request sent!");
          } else {
            setError(
              result.error ||
                "We could not send your request. Please check your information and try again.",
            );
          }
        });
      }}
    >
      <input type="hidden" name="branchId" value={branchId} />

      {/* Guest Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="09xx xxx xxx"
          />
        </div>
      </div>

      {/* Date, Time, Guests */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            min={today}
            defaultValue={today}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            name="time"
            type="time"
            defaultValue="19:00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={30}
            defaultValue={2}
            required
          />
        </div>
      </div>

      {/* Special requests (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Special Requests (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Seating preference, dietary requirements, occasion…"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-widest font-semibold"
        >
          {isPending ? "Submitting…" : "Request Reservation"}
        </Button>
      </div>
    </form>
  );
}
