"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// useToast() gives you:
//   toast.success("Saved"), toast.error("Something failed"), toast.info("FYI")
//   await toast.confirm({ title, message, confirmText, danger })  -> true / false
const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const icons = {
  success: <path d="M4 10.5l4 4 8-9" />,
  error: <path d="M6 6l8 8M14 6l-8 8" />,
  info: <path d="M10 9.5v5M10 6h.01" />,
};
const bars = { success: "bg-leaf", error: "bg-clay", info: "bg-ink" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = ++nextId.current;
      setToasts((t) => [...t.slice(-2), { id, type, message }]); // at most 3 on screen
      setTimeout(() => dismiss(id), type === "error" ? 6000 : 3500);
    },
    [dismiss]
  );

  const confirm = useCallback((options) => new Promise((resolve) => setDialog({ ...options, resolve })), []);

  const api = useMemo(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
      confirm,
    }),
    [push, confirm]
  );

  const closeDialog = useCallback(
    (answer) => {
      dialog?.resolve(answer);
      setDialog(null);
    },
    [dialog]
  );

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => e.key === "Escape" && closeDialog(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog, closeDialog]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-stretch overflow-hidden rounded-md border border-ink/10 bg-white shadow-lg sm:w-auto sm:min-w-[18rem]"
          >
            <span className={`w-1.5 shrink-0 ${bars[t.type]}`} />
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`ml-3 mt-3.5 h-5 w-5 shrink-0 ${
                t.type === "success" ? "text-leaf" : t.type === "error" ? "text-clay" : "text-ink"
              }`}
            >
              {icons[t.type]}
            </svg>
            <p className="flex-1 px-3 py-3 text-sm">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="px-3 text-lg leading-none text-ink/40 hover:text-ink"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {dialog && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeDialog(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-sm animate-toast-in rounded-md bg-cream p-6 shadow-xl"
          >
            <h2 id="confirm-title" className="text-xl font-semibold">
              {dialog.title || "Are you sure?"}
            </h2>
            {dialog.message && <p className="mt-2 text-sm text-ink/70">{dialog.message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => closeDialog(false)} className="btn-outline">
                {dialog.cancelText || "Cancel"}
              </button>
              <button
                autoFocus
                onClick={() => closeDialog(true)}
                className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 ${
                  dialog.danger ? "bg-clay" : "bg-leaf"
                }`}
              >
                {dialog.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
