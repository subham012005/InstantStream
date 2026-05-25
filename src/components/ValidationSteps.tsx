"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
  Lock,
  Database,
  Play,
} from "lucide-react";
import type { ValidationStepState, ValidationResponse } from "@/types/validation";

interface ValidationStepsProps {
  isValidating: boolean;
  validationResponse?: ValidationResponse;
  onValidationComplete?: (response: ValidationResponse) => void;
  isLaunching?: boolean;
}

const stepIcons: Record<string, React.ReactNode> = {
  format: <Zap className="w-5 h-5" />,
  connection: <Lock className="w-5 h-5" />,
  filetype: <Database className="w-5 h-5" />,
  streaming: <Clock className="w-5 h-5" />,
  preparing: <Play className="w-5 h-5" />,
};

export const ValidationSteps: React.FC<ValidationStepsProps> = ({
  isValidating,
  validationResponse,
  onValidationComplete,
  isLaunching = false,
}) => {
  const [displaySteps, setDisplaySteps] = useState<ValidationStepState[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (validationResponse?.steps) {
      setDisplaySteps(validationResponse.steps);
      setShowWarning(
        validationResponse.valid &&
          !validationResponse.supportsStreaming &&
          !validationResponse.warning
      );
    }
  }, [validationResponse]);

  if (!isValidating && displaySteps.length === 0) {
    return null;
  }

  const isComplete =
    !isValidating && displaySteps.every((step) => step.status !== "checking");
  const hasError = displaySteps.some((step) => step.status === "error");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-3"
      >
        {/* Steps Container */}
        <div className="space-y-2">
          {displaySteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.status === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                  : step.status === "error"
                    ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {step.status === "checking" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                )}
                {step.status === "success" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                )}
                {step.status === "error" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </motion.div>
                )}
                {step.status === "pending" && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.status === "success"
                      ? "text-emerald-900 dark:text-emerald-300"
                      : step.status === "error"
                        ? "text-red-900 dark:text-red-300"
                        : "text-blue-900 dark:text-blue-300"
                  }`}
                >
                  {step.label}
                </p>
                {step.message && (
                  <p
                    className={`text-xs truncate ${
                      step.status === "success"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : step.status === "error"
                          ? "text-red-700 dark:text-red-400"
                          : "text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {step.message}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streaming Warning */}
        {showWarning && validationResponse?.supportsStreaming === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                Limited streaming support
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Video detected, but seeking may not work because the server may not support streaming.
              </p>
            </div>
          </motion.div>
        )}

        {/* Loading Indicator */}
        {isValidating && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Validating link...</p>
          </motion.div>
        )}

        {/* Error Summary */}
        {hasError && isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          >
            <p className="text-sm font-medium text-red-900 dark:text-red-300">
              {validationResponse?.error ||
                "Validation failed. Please check the URL and try again."}
            </p>
          </motion.div>
        )}

        {/* Success Summary */}
        {!hasError && isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              isLaunching
                ? "bg-primary/10 border-primary/30 animate-pulse"
                : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
            }`}
          >
            {isLaunching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="shrink-0"
                >
                  <Loader2 className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    Launching player…
                  </p>
                  <p className="text-xs text-primary/70 truncate">
                    {validationResponse?.title}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                ✓ Ready to play: <span className="font-normal">{validationResponse?.title}</span>
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
