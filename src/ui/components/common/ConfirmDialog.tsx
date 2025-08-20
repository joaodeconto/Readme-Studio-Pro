"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@ui/components/ui/button";

export interface ConfirmDialogProps {
  /** Controls visibility of the dialog */
  open: boolean;
  /** Message displayed to the user */
  message: string;
  /** Called when the user confirms the action */
  onConfirm: () => void;
  /** Optional callback for cancellation */
  onCancel?: () => void;
}

export default function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure the dialog renders only on the client side
  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="modal">
      <div className="box">
        <p>{message}</p>
        <div className="actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
