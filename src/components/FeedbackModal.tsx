"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState("🐛 Bug / Error");
  const [videoUrl, setVideoUrl] = useState("");
  const [photoProof, setPhotoProof] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe your feedback or the issue you found.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Mapped Google Form submission parameters
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSem6dKR3YRJanOP0k0xt5jxtxiQv3vvgISGphRAt6EaODqVfw/formResponse";
    
    const formData = new URLSearchParams();
    formData.append("entry.1927203179", feedbackType);
    formData.append("entry.764717073", videoUrl);
    formData.append("entry.1731587350", photoProof);
    formData.append("entry.438806369", description);
    formData.append("entry.604396617", email);

    try {
      // no-cors mode ensures the form post is dispatched to Google Forms without failing due to CORS policies
      await fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });
      
      // Since Google Form submission is blind, we assume success after successful dispatch
      setIsSuccess(true);
      
      // Reset inputs after delay
      setTimeout(() => {
        setFeedbackType("🐛 Bug / Error");
        setVideoUrl("");
        setPhotoProof("");
        setDescription("");
        setEmail("");
      }, 500);

    } catch (err) {
      setError("Could not submit feedback. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-surface-container-low/95 z-10 overflow-hidden"
          >
            {/* Ambient gradients */}
            <div className="absolute top-[-50px] right-[-50px] w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-24 h-24 bg-secondary/10 rounded-full blur-xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">rate_review</span>
                <h3 className="font-headline-md text-on-surface text-xl">Feedback & Reports</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {isSuccess ? (
              /* Success Animation Layout */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl animate-bounce">check_circle</span>
                </div>
                <h4 className="font-headline-md text-on-surface text-lg mb-2">Thank you so much!</h4>
                <p className="text-on-surface-variant font-body-md text-sm max-w-sm mx-auto mb-8">
                  Your feedback has been logged in our system. We review every submission immediately to keep fluxplays ultra-fast and bug-free.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Close Panel
                </button>
              </motion.div>
            ) : (
              /* Form Layout */
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {error && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex gap-2 items-center">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Dropdown for Feedback Type */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Feedback Type <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full appearance-none bg-surface-container-high border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="🐛 Bug / Error">🐛 Bug / Error</option>
                      <option value="💡 Suggestion / Feature Request">💡 Suggestion / Feature Request</option>
                      <option value="⚡ Stream Performance Issue">⚡ Stream Performance Issue</option>
                      <option value="❓ Other / General Feedback">❓ Other / General Feedback</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Two inputs side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste the streaming link"
                      className="w-full bg-surface-container-high border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Screenshot Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={photoProof}
                      onChange={(e) => setPhotoProof(e.target.value)}
                      placeholder="Imgur or postimg link"
                      className="w-full bg-surface-container-high border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </div>

                {/* Description (Required) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Description <span className="text-primary">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide details about what happened, steps to reproduce the bug, or your awesome suggestion..."
                    className="w-full bg-surface-container-high border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/40 resize-none"
                    required
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to get updates"
                    className="w-full bg-surface-container-high border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/40"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl border border-black/10 dark:border-white/10 text-on-surface font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl premium-button-gradient text-on-primary-container font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
