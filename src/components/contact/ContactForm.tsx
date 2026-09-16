"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactAction } from "@/lib/actions";

export function ContactForm({ branchId }: { branchId: string }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [rawMessage, setRawMessage] = useState("");

  if (sent) {
    return (
      <div className="passe-partout rounded-xs p-8 text-center bg-card border border-border/80 shadow-md space-y-4 animate-in fade-in duration-300">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-2xl sm:text-3xl text-foreground">
          Message Received
        </h3>
        <p className="text-foreground/75 text-sm max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out. A member of our hospitality team will
          review your message and reply promptly.
        </p>
        <div className="pt-3">
          <button
            onClick={() => setSent(false)}
            className="text-link text-xs uppercase tracking-widest text-primary font-medium"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      action={(formData) => {
        startTransition(async () => {
          formData.set("message", rawMessage.trim());

          const result = await submitContactAction(formData);
          if (result.success) {
            setSent(true);
            toast.success("Message sent — we'll be in touch soon.");
          } else {
            toast.error(result.error || "Something went wrong.");
          }
        });
      }}
    >
      <input type="hidden" name="branchId" value={branchId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" required placeholder="09xx xxx xxx" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="How can our hospitality team assist you today?"
          value={rawMessage}
          onChange={(e) => setRawMessage(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-8 py-3 text-xs uppercase tracking-widest font-semibold"
      >
        {isPending ? "Sending Message…" : "Send Message"}
      </Button>
    </form>
  );
}
