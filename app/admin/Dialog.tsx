"use client";

import { ReactNode } from "react";

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
  isLoading?: boolean;
}

export function Dialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false,
}: DialogProps) {
  if (!isOpen) return null;

  const colors: Record<string, { icon: string; btnColor: string }> = {
    warning: { icon: "⚠️", btnColor: "#f59e0b" },
    danger: { icon: "🗑️", btnColor: "#dc2626" },
    info: { icon: "ℹ️", btnColor: "#0891b2" },
  };

  const { icon, btnColor } = colors[type];

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9998,
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          zIndex: 9999,
          maxWidth: 420,
          width: "90vw",
          padding: 0,
          overflow: "hidden",
          animation: "dialogIn 0.3s ease-out",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "24px 28px 20px",
          textAlign: "center",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
          <h2 style={{
            margin: "0 0 6px",
            fontSize: 18,
            fontWeight: 700,
            color: "#060d1f",
          }}>
            {title}
          </h2>
          <p style={{
            margin: 0,
            fontSize: 13.5,
            color: "#64748b",
            lineHeight: 1.5,
          }}>
            {message}
          </p>
        </div>

        <div style={{
          padding: "16px 28px 20px",
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 8,
              background: "#ffffff",
              color: "#1f2937",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!isLoading) (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "#ffffff";
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: btnColor,
              color: "#ffffff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!isLoading) (e.currentTarget as HTMLElement).style.opacity = "0.9";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.opacity = isLoading ? "0.7" : "1";
            }}
          >
            {isLoading ? "..." : confirmText}
          </button>
        </div>

        <style>{`
          @keyframes dialogIn {
            from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
