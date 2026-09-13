"use client";

import { useState } from "react";
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
  maxWidth = 500,
  maxHeight = 320,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const hasImage = Boolean(value && value.trim().length > 0);
  const isAvatar = uploaderType === "avatarUploader";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            {label}
          </label>
          {!hasImage && (
            <button
              type="button"
              onClick={() => setShowUrlInput(s => !s)}
              style={{
                background: "none",
                border: "none",
                color: "#1c9366",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              {showUrlInput ? "Use File Upload" : "Paste URL Instead"}
            </button>
          )}
        </div>
      )}

      {/* Manual URL Input Alternative */}
      {!hasImage && showUrlInput && (
        <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 8 }}>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            style={{
              flex: 1,
              padding: "9px 12px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: 13,
              background: "#fff",
            }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (urlDraft.trim()) {
                onChange(urlDraft.trim());
                setUrlDraft("");
                setShowUrlInput(false);
              }
            }}
            style={{
              padding: "9px 16px",
              fontSize: 13,
              background: "#1c9366",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Apply
          </button>
        </div>
      )}

      {/* Preview Card when Image Exists */}
      {hasImage && !isReplacing && (
        <div style={{
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f8fafc",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          {/* Visual Preview */}
          <div style={{
            position: "relative",
            background: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: isAvatar ? 160 : 200,
            maxHeight: maxHeight,
            overflow: "hidden",
            padding: 8,
          }}>
            <img
              src={value}
              alt="Uploaded preview"
              style={{
                maxWidth: "100%",
                maxHeight: maxHeight - 16,
                width: isAvatar ? 140 : "100%",
                height: isAvatar ? 140 : "auto",
                objectFit: isAvatar ? "cover" : "contain",
                borderRadius: isAvatar ? "50%" : 8,
                display: "block",
                boxShadow: isAvatar ? "0 4px 12px rgba(0,0,0,0.25)" : "none",
              }}
              onError={(e) => {
                // If broken link, inform the user
                const target = e.currentTarget;
                target.style.opacity = "0.5";
              }}
            />
            <span style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(4px)",
              color: "#10b981",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
              Preview Ready
            </span>
          </div>

          {/* Action Bar */}
          <div style={{
            padding: "10px 14px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            borderTop: "1px solid #e2e8f0",
          }}>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              🔍 Open Full Image ↗
            </a>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsReplacing(true)}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f7652",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                🔄 Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsReplacing(false);
                }}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                ✕ Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone (shown when empty or replacing) */}
      {(!hasImage || isReplacing) && (
        <div style={{
          border: "2px dashed #cbd5e1",
          borderRadius: 12,
          padding: "24px 16px",
          textAlign: "center",
          background: "#f8fafc",
          transition: "all 0.2s ease",
          position: "relative",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#1c9366";
            e.currentTarget.style.background = "#f0fdf4";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.background = "#f8fafc";
          }}
        >
          {isReplacing && (
            <button
              type="button"
              onClick={() => setIsReplacing(false)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                fontSize: 11,
                color: "#64748b",
                background: "#e2e8f0",
                border: "none",
                padding: "3px 8px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Cancel Replace
            </button>
          )}

          <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>
            {isReplacing ? "Upload a replacement image" : "Upload your image"}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>
            Directly uploads to fast CDN storage
          </div>

          <UploadButton<OurFileRouter, typeof uploaderType>
            endpoint={uploaderType}
            onClientUploadComplete={(res) => {
              setLoading(false);
              if (res?.[0]) {
                const uploadedUrl = res[0].ufsUrl ?? res[0].url;
                onChange(uploadedUrl);
                setError("");
                setIsReplacing(false);
              }
            }}
            onUploadError={(err: Error) => {
              setLoading(false);
              setError(err.message);
            }}
            onUploadBegin={() => {
              setLoading(true);
              setError("");
            }}
            content={{
              button({ ready, isUploading }) {
                if (!ready) return "Preparing uploader…";
                if (isUploading || loading) return "Uploading to server…";
                return "📤 Choose Image";
              },
              allowedContent({ isUploading }) {
                if (isUploading) return "";
                return "PNG, JPG, WEBP, GIF (up to 4MB)";
              },
            }}
            appearance={{
              button: {
                background: "#1c9366",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                color: "#ffffff",
                padding: "8px 18px",
                boxShadow: "0 2px 4px rgba(28, 147, 102, 0.2)",
              } as any,
              container: {
                margin: "0 auto",
                gap: "6px",
              } as any,
              allowedContent: {
                fontSize: "11px",
                color: "#64748b",
                marginTop: "6px",
              } as any,
            }}
          />
        </div>
      )}

      {hint && (
        <p style={{ fontSize: 11.5, color: "#64748b", margin: "2px 0 0" }}>
          💡 {hint}
        </p>
      )}

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12,
          color: "#991b1b",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
