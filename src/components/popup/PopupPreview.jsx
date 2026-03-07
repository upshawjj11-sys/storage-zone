import React from "react";
import { X } from "lucide-react";

const TEMPLATES = {
  centered: "centered",
  image_top: "image_top",
  image_left: "image_left",
  image_only: "image_only",
  banner: "banner",
};

export default function PopupPreview({ form }) {
  const {
    template = "centered",
    background_color = "#ffffff",
    text_color = "#111827",
    title,
    content,
    image_url,
    cta_text,
    cta_link,
    cta_bg_color = "#E8792F",
    cta_text_color = "#ffffff",
    max_width = "480px",
  } = form;

  const boxStyle = {
    backgroundColor: background_color,
    color: text_color,
    maxWidth: max_width || "480px",
    width: "100%",
    borderRadius: "1rem",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
    fontFamily: "Inter, sans-serif",
    position: "relative",
  };

  const ctaStyle = {
    backgroundColor: cta_bg_color,
    color: cta_text_color,
    padding: "10px 24px",
    borderRadius: "9999px",
    fontWeight: 600,
    fontSize: "14px",
    display: "inline-block",
    cursor: "pointer",
    border: "none",
    marginTop: "12px",
    textDecoration: "none",
  };

  const titleEl = title ? <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: text_color }}>{title}</h2> : null;
  const contentEl = content ? <div style={{ fontSize: "14px", lineHeight: 1.6, color: text_color }} dangerouslySetInnerHTML={{ __html: content }} /> : null;
  const ctaEl = cta_text ? <div style={{ marginTop: "16px" }}><span style={ctaStyle}>{cta_text}</span></div> : null;
  const imgEl = image_url ? <img src={image_url} alt="" style={{ width: "100%", display: "block", objectFit: "cover" }} /> : null;
  const placeholderImg = !image_url && (template === "image_top" || template === "image_left" || template === "image_only") ? (
    <div style={{ background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px", fontWeight: 500 }}>
      Image Preview
    </div>
  ) : null;

  const renderContent = () => {
    if (template === "image_only") {
      return (
        <div style={boxStyle}>
          {image_url ? (
            <img src={image_url} alt="" style={{ width: "100%", display: "block", maxHeight: "480px", objectFit: "cover", cursor: cta_link ? "pointer" : "default" }} />
          ) : (
            <div style={{ background: "#e5e7eb", height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px" }}>
              No image uploaded
            </div>
          )}
          <div style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color="#fff" />
          </div>
        </div>
      );
    }

    if (template === "image_top") {
      return (
        <div style={boxStyle}>
          <div style={{ height: "200px", overflow: "hidden" }}>
            {image_url ? <img src={image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ background: "#e5e7eb", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px" }}>Image Preview</div>}
          </div>
          <div style={{ padding: "24px" }}>
            {titleEl}{contentEl}{ctaEl}
          </div>
          <div style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color="#fff" />
          </div>
        </div>
      );
    }

    if (template === "image_left") {
      return (
        <div style={{ ...boxStyle, display: "flex", maxWidth: max_width || "560px" }}>
          <div style={{ width: "180px", flexShrink: 0 }}>
            {image_url ? <img src={image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ background: "#e5e7eb", height: "100%", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "12px" }}>Image</div>}
          </div>
          <div style={{ padding: "24px", flex: 1 }}>
            {titleEl}{contentEl}{ctaEl}
          </div>
          <div style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color="#fff" />
          </div>
        </div>
      );
    }

    if (template === "banner") {
      return (
        <div style={{ ...boxStyle, maxWidth: "100%", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            {titleEl}
            {contentEl}
          </div>
          {ctaEl}
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={14} color={text_color} />
          </div>
        </div>
      );
    }

    // centered (default)
    return (
      <div style={boxStyle}>
        {image_url && <div style={{ marginBottom: "16px" }}><img src={image_url} alt="" style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} /></div>}
        <div style={{ padding: "28px", textAlign: "center" }}>
          {titleEl}{contentEl}{ctaEl}
        </div>
        <div style={{ position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={14} color={text_color} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "rgba(0,0,0,0.55)", borderRadius: "0.75rem", padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
      {renderContent()}
    </div>
  );
}