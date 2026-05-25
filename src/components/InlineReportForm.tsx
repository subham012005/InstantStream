"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Send, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InlineReportFormProps {
  /** The URL that triggered the error — pre-filled silently into the POST body. */
  videoUrl: string;
  /** Called when the user explicitly dismisses the form via the close button. */
  onDismiss?: () => void;
}

interface InlineReportFormState {
  videoUrl: string;
  description: string;
  email: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  submitError: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Hard-coded — not user-editable. Maps to entry.1927203179 in Google Forms. */
const FEEDBACK_TYPE = "⚡ Stream Performance Issue" as const;

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSem6dKR3YRJanOP0k0xt5jxtxiQv3vvgISGphRAt6EaODqVfw/formResponse";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * InlineReportForm — Task 1.1 scaffold.
 *
 * Renders a compact, single-column report form directly beneath the error
 * banner. The `videoUrl` prop is silently pre-filled into the Google Forms
 * POST body; it is never shown as an editable input. `feedbackType` is
 * hard-coded to "⚡ Stream Performance Issue".
 *
 * Layout: single-column, `min-w-0 w-full` — works at 320 px minimum width
 * without horizontal overflow.
 *
 * Form fields and submit logic are wired in task 1.2.
 */
export function InlineReportForm({ videoUrl, onDismiss }: InlineReportFormProps) {
  const [state, setState] = useState<InlineReportFormState>({
    videoUrl: videoUrl,
    description: "",
    email: "",
    isSubmitting: false,
    isSuccess: false,
    submitError: "",
  });

  const { videoUrl: stateVideoUrl, description, email, isSubmitting, isSuccess, submitError } = state;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const setField = <K extends keyof InlineReportFormState>(
    key: K,
    value: InlineReportFormState[K]
  ) => setState((prev) => ({ ...prev, [key]: value }));

  // ── Submit handler ───────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: description is required (button should already be disabled, but
    // defend in the handler too in case of programmatic submission).
    if (description.trim() === "") return;

    // Guard: videoUrl is required
    if (stateVideoUrl.trim() === "") {
      setField("submitError", "Please enter the video URL.");
      return;
    }

    // Email validation — only when a value is present.
    if (email.length > 0 && (!email.includes("@") || !email.includes("."))) {
      setField("submitError", 'Please enter a valid email address (must contain "@" and a domain).');
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, submitError: "" }));

    const formData = new URLSearchParams();
    formData.append("entry.1927203179", FEEDBACK_TYPE);
    formData.append("entry.764717073", stateVideoUrl);
    formData.append("entry.1731587350", ""); // no photo proof in this form
    formData.append("entry.438806369", description);
    formData.append("entry.604396617", email);

    try {
      // no-cors POST — response is opaque; a resolved fetch means success.
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      setState((prev) => ({ ...prev, isSubmitting: false, isSuccess: true }));
    } catch {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: "Could not send report. Please check your internet connection and try again.",
      }));
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0 w-full mt-3 rounded-2xl border border-black/10 dark:border-white/10 bg-surface-container-low/95 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-bold text-on-surface truncate">
            Report this stream
          </span>
          {/* feedbackType badge — hard-coded, not editable */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
            {FEEDBACK_TYPE}
          </span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss report form"
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 py-2"
            >
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-on-surface font-medium">
                Report sent — thanks! We&apos;ll look into this stream.
              </p>
            </motion.div>
          ) : (
            /* ── Form state ── */
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSubmit}
              className="space-y-3 min-w-0 w-full"
              noValidate
            >
              {/* Inline error message */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Video URL — required */}
              <div className="min-w-0 w-full">
                <label
                  htmlFor="inline-report-url"
                  className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  Video URL{" "}
                  <span className="text-primary" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="inline-report-url"
                  type="url"
                  value={stateVideoUrl}
                  onChange={(e) => setField("videoUrl", e.target.value)}
                  placeholder="https://example.com/video.mp4 or paste link…"
                  required
                  disabled={isSubmitting}
                  className="min-w-0 w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none transition-all duration-300 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,112,243,0.15)] focus:ring-0 placeholder:text-on-surface-variant/40 disabled:opacity-60 break-all"
                />
                <p className="text-xs text-on-surface-variant/60 mt-1">
                  The link to the video you're reporting
                </p>
              </div>

              {/* Description — required, max 2000 chars */}
              <div className="min-w-0 w-full">
                <label
                  htmlFor="inline-report-description"
                  className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  What went wrong?{" "}
                  <span className="text-primary" aria-hidden="true">
                    *
                  </span>
                </label>
                <textarea
                  id="inline-report-description"
                  value={description}
                  onChange={(e) => setField("description", e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Describe the issue — e.g. stream won't load, buffering constantly…"
                  required
                  disabled={isSubmitting}
                  className="min-w-0 w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none transition-all duration-300 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,112,243,0.15)] focus:ring-0 placeholder:text-on-surface-variant/40 resize-none disabled:opacity-60"
                />
                <p className="text-right text-xs text-on-surface-variant/50 mt-1 tabular-nums">
                  {description.length}/2000
                </p>
              </div>

              {/* Email — optional */}
              <div className="min-w-0 w-full">
                <label
                  htmlFor="inline-report-email"
                  className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
                >
                  Your email{" "}
                  <span className="text-on-surface-variant/50 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="inline-report-email"
                  type="email"
                  value={email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="min-w-0 w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none transition-all duration-300 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,112,243,0.15)] focus:ring-0 placeholder:text-on-surface-variant/40 disabled:opacity-60"
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || description.trim() === "" || stateVideoUrl.trim() === ""}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl premium-button-gradient text-white font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send report</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
