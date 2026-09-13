"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface UploadedDocument {
  url: string;
  name: string;
  key: string;
}

interface DocumentUploaderProps {
  value: UploadedDocument[];
  onChange: (docs: UploadedDocument[]) => void;
  label?: string;
  hint?: string;
  maxFiles?: number;
}

export function DocumentUploader({
  value,
  onChange,
  label = "Upload Documents",
  hint,
  maxFiles = 5,
}: DocumentUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function removeDocument(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {label && (
        <label style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
        }}>
          {label}
        </label>
      )}

      {value.length < maxFiles && (
        <div style={{
          border: "2px dashed #d5dee8",
          borderRadius: "9px",
          padding: "20px",
          textAlign: "center",
          background: "#f8fafc",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1c9366";
            (e.currentTarget as HTMLElement).style.background = "#ecfdf5";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#d5dee8";
            (e.currentTarget as HTMLElement).style.background = "#f8fafc";
          }}
        >
          <UploadButton<OurFileRouter, "documentUploader">
            endpoint="documentUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                const newDoc: UploadedDocument = {
                  url: res[0].url,
                  name: res[0].name || "Document",
                  key: res[0].key,
                };
                onChange([...value, newDoc]);
                setError("");
              }
            }}
            onUploadError={(error: Error) => {
              setError(error.message);
            }}
            onUploadBegin={() => {
              setLoading(true);
            }}
            content={{
              button({ ready, isUploading }) {
                if (!ready) return "Getting ready…";
                if (isUploading) return "Uploading…";
                return "📎 Click to upload";
              },
              allowedContent({ isUploading }) {
                if (isUploading) return "";
                return "PDF or images (max 8MB for PDF, 4MB for images)";
              },
            }}
            appearance={{
              button: {
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1c9366",
                padding: "12px 20px",
              } as any,
              container: {
                margin: "0",
                gap: "8px",
              } as any,
              allowedContent: {
                fontSize: "12px",
                color: "#64748b",
                marginTop: "8px",
              } as any,
            }}
          />
        </div>
      )}

      {hint && (
        <p style={{
          fontSize: 12,
          color: "#64748b",
          margin: 0,
        }}>
          {hint}
        </p>
      )}

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "9px",
          padding: "10px 12px",
          fontSize: 12,
          color: "#991b1b",
          fontWeight: 600,
        }}>
          ⚠️ {error}
        </div>
      )}

      {value.length > 0 && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "9px",
          padding: "12px",
        }}>
          <p style={{
            margin: "0 0 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#0f7652",
          }}>
            {value.length} document{value.length !== 1 ? "s" : ""} uploaded
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {value.map((doc, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#0f7652" }}>📄 {doc.name}</span>
                <button
                  type="button"
                  onClick={() => removeDocument(idx)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "0 4px",
                    fontWeight: 600,
                  }}
                  title="Remove document"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
