"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

// Same Google Form used by FeedbackModal — email lands in entry.604396617
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSem6dKR3YRJanOP0k0xt5jxtxiQv3vvgISGphRAt6EaODqVfw/formResponse";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError("");

    const formData = new URLSearchParams();
    // Tag this row so it's easy to filter from bug reports in the Google Sheet
    formData.append("entry.1927203179", "📧 Newsletter Subscription");
    formData.append("entry.764717073", "");          // videoUrl — not used
    formData.append("entry.1731587350", "");          // photoProof — not used
    formData.append("entry.438806369", "Newsletter subscription from fluxplays.live/newsletter");
    formData.append("entry.604396617", email.trim()); // email field

    try {
      // no-cors: Google Forms doesn't allow cross-origin reads, but the POST still lands
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      setSubmitted(true);
    } catch {
      setError("Could not submit. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center p-6 glass-panel rounded-2xl border border-primary/20 bg-primary/5">
        <div className="flex items-center justify-center mb-3">
          <CheckCircle2 className="w-10 h-10 text-primary animate-bounce" />
        </div>
        <p className="font-semibold text-on-surface mb-1">You&apos;re subscribed!</p>
        <p className="text-sm text-on-surface-variant">
          Welcome aboard. You&apos;ll receive the next edition in your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isSubmitting}
          className="flex-1 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 premium-button-gradient button-glow-ring rounded-xl font-bold text-on-primary hover:scale-[1.02] active:scale-95 transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Subscribing…</span>
            </>
          ) : (
            "Subscribe Free"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-error text-xs p-3 bg-error/10 border border-error/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
