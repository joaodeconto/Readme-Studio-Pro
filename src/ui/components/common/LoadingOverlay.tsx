"use client";
import React from "react";

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  show: boolean;
  /** Optional progress value between 0 and 100. If omitted, a spinner is shown. */
  progress?: number;
  /** Optional status message displayed below the indicator */
  message?: string;
}

export default function LoadingOverlay({
  show,
  progress,
  message,
}: LoadingOverlayProps) {
  if (!show) return null;

  const hasProgress = typeof progress === "number";
  const clamped = Math.min(100, Math.max(0, progress ?? 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="flex flex-col items-center space-y-4"
        role="status"
        aria-live="polite"
      >
        {hasProgress ? (
          <div className="w-64">
            <div className="h-2 w-full rounded bg-subtle">
              <div
                className="h-full rounded bg-accent"
                style={{ width: `${clamped}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clamped}
              />
            </div>
          </div>
        ) : (
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        )}
        {message && <span className="text-base">{message}</span>}
      </div>
    </div>
  );
}
