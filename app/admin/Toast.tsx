"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: ToastContextType = {
    toast: addToast,
    success: (msg, dur) => addToast("success", msg, dur),
    error: (msg, dur) => addToast("error", msg, dur),
    warning: (msg, dur) => addToast("warning", msg, dur),
    info: (msg, dur) => addToast("info", msg, dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
    success: {
      bg: "#f0fdf4",
      border: "#86efac",
      text: "#166534",
      icon: "✓",
    },
    error: {
      bg: "#fef2f2",
      border: "#fca5a5",
      text: "#991b1b",
      icon: "⚠",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fed7aa",
      text: "#92400e",
      icon: "!",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      text: "#1e40af",
      icon: "ℹ",
    },
  };

  const style = styles[toast.type];

  return (
    <div
      style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: 10,
        padding: "12px 16px",
        color: style.text,
        fontSize: 13.5,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 360,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        pointerEvents: "auto",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: 16,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
