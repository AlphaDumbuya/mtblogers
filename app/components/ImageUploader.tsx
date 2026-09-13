"use client";

import { useState, useRef } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  uploaderType: "imageUploader" | "avatarUploader";
  label?: string;
  hint?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageUploader({
  value,
  onChange,
  uploaderType,
  label = "Upload Image",
  hint,
  maxWidth = 400,
  maxHeight = 300,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

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
        <UploadButton<OurFileRouter, typeof uploaderType>
          endpoint={uploaderType}
          onClientUploadComplete={(res) => {
            if (res?.[0]) {
              onChange(res[0].url);
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
              return "📤 Click to upload";
            },
            allowedContent({ isUploading }) {
              if (isUploading) return "";
              return "PNG, JPG, GIF (max 4MB)";
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

      {value && (
        <div
          ref={previewRef}
          style={{
            position: "relative",
            borderRadius: "9px",
            overflow: "hidden",
            background: "#f1f5f9",
            marginTop: "12px",
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: maxHeight,
              width: "auto",
              height: "auto",
              display: "block",
              borderRadius: "9px",
            }}
          />
          <button
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.8)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.6)"}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
