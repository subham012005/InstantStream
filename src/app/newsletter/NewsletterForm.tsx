"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integrate with email provider here (e.g., ConvertKit, Resend, Mailchimp)
    if (email) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center p-6 glass-panel rounded-2xl border border-primary/20 bg-primary/5">
        <div className="text-4xl mb-3">🎉</div>
        <p className="font-semibold text-on-surface mb-1">You&apos;re subscribed!</p>
        <p className="text-sm text-on-surface-variant">
          Welcome aboard. You&apos;ll receive the next edition in your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,112,243,0.1)] transition-all"
      />
      <button
        type="submit"
        className="px-6 py-3 premium-button-gradient button-glow-ring rounded-xl font-bold text-on-primary hover:scale-[1.02] active:scale-95 transition-all duration-200 whitespace-nowrap"
      >
        Subscribe Free
      </button>
    </form>
  );
}
