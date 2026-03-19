import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

function PopupDisplay({ popup, onClose }) {
  const {
    template = "centered",
    background_color = "#ffffff",
    text_color = "#111827",
    title,
    content,
    image_url,
    image_link,
    cta_text,
    cta_link,
    cta_bg_color = "#E8792F",
    cta_text_color = "#ffffff",
    max_width = "480px",
  } = popup;

  const boxStyle = {
    backgroundColor: background_color,
    color: text_color,
    maxWidth: max_width || "480px",
    width: "calc(100vw - 32px)",
    borderRadius: "1rem",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
    fontFamily: "inherit",
    position: "relative",
  };

  const ctaStyle = {
    backgroundColor: cta_bg_color,
    color: cta_text_color,
    padding: "10px 28px",
    borderRadius: "9999px",
    fontWeight: 600,
    fontSize: "14px",
    display: "inline-block",
    cursor: "pointer",
    border: "none",
    marginTop: "14px",
    textDecoration: "none",
  };

  const closeBtn = (
    <button
      onClick={onClose}
      style={{
        position: "absolute", top: "10px", right: "10px",
        width: "28px", height: "28px", borderRadius: "50%",
        background: "rgba(0,0,0,0.3)", display: "flex",
        alignItems: "center", justifyContent: "center",
        border: "none", cursor: "pointer", zIndex: 10,
      }}
    >
      <X size={14} color="#fff" />
    </button>
  );

  const titleEl = title ? <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: text_color }}>{title}</h2> : null;
  const contentEl = content ? <div style={{ fontSize: "14px", lineHeight: 1.6, color: text_color }} dangerouslySetInnerHTML={{ __html: content }} /> : null;
  const ctaEl = cta_text && cta_link ? <div><a href={cta_link} style={ctaStyle} onClick={onClose}>{cta_text}</a></div> : null;

  if (template === "image_only") {
    const imgContent = image_url ? (
      <img
        src={image_url} alt=""
        style={{ width: "100%", display: "block", maxHeight: "480px", objectFit: "cover", cursor: (image_link || cta_link) ? "pointer" : "default" }}
        onClick={() => { if (image_link || cta_link) window.open(image_link || cta_link, "_blank"); }}
      />
    ) : null;
    return (
      <div style={boxStyle}>
        {imgContent}
        {closeBtn}
      </div>
    );
  }

  if (template === "image_top") {
    return (
      <div style={boxStyle}>
        {image_url && <div style={{ height: "200px", overflow: "hidden" }}><img src={image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
        <div style={{ padding: "24px" }}>{titleEl}{contentEl}{ctaEl}</div>
        {closeBtn}
      </div>
    );
  }

  if (template === "image_left") {
    return (
      <div style={{ ...boxStyle, display: "flex" }}>
        {image_url && (
          <div style={{ width: "160px", flexShrink: 0 }}>
            <img src={image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ padding: "24px", flex: 1 }}>{titleEl}{contentEl}{ctaEl}</div>
        {closeBtn}
      </div>
    );
  }

  if (template === "banner") {
    return (
      <div style={{ ...boxStyle, maxWidth: "640px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", gap: "16px" }}>
        <div style={{ flex: 1 }}>{titleEl}{contentEl}</div>
        {ctaEl}
        <button
          onClick={onClose}
          style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}
        >
          <X size={14} color={text_color} />
        </button>
      </div>
    );
  }

  // centered (default)
  return (
    <div style={boxStyle}>
      {image_url && (
        <div style={{ maxHeight: "220px", overflow: "hidden" }}>
          <img src={image_url} alt="" style={{ width: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "28px", textAlign: "center" }}>{titleEl}{contentEl}{ctaEl}</div>
      {closeBtn}
    </div>
  );
}

const PAGE_NAME_MAP = {
  "/": "Home",
  "/Home": "Home",
  "/Locations": "Locations",
  "/FacilityPage": "FacilityPage",
  "/PayMyBill": "PayMyBill",
  "/PublicPage": "PublicPage",
};

export default function PopupRenderer({ currentPageName, facilityId, slugFromPath }) {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    let timer;
    const loadPopup = async () => {
      const today = new Date().toISOString().split("T")[0];
      const allPopups = await base44.entities.Popup.filter({ status: "active" });

      // For facility slug pages, load all facilities to match by slug/id
      let resolvedFacilityId = facilityId;
      if (!resolvedFacilityId && slugFromPath) {
        const facilities = await base44.entities.Facility.list();
        const fullPath = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
        const matched = facilities.find((f) =>
          f.id === slugFromPath ||
          f.slug === fullPath ||
          f.slug === fullPath + "/" ||
          f.slug === slugFromPath
        );
        resolvedFacilityId = matched?.id || null;
      }

      const matching = allPopups.filter((p) => {
        if (p.start_date && today < p.start_date) return false;
        if (p.end_date && today > p.end_date) return false;
        const pages = p.show_on_pages || [];
        if (pages.length === 0) return true; // show everywhere
        // Match by page name or facility id
        return pages.includes(currentPageName) || (resolvedFacilityId && pages.includes(resolvedFacilityId));
      });

      if (!matching.length) return;
      const chosen = matching[0];
      setPopup(chosen);

      const trigger = chosen.trigger || "on_load";
      const delay = (chosen.delay_seconds || 3) * 1000;

      if (trigger === "on_load") {
        timer = setTimeout(() => setVisible(true), 300);
      } else if (trigger === "after_delay") {
        timer = setTimeout(() => setVisible(true), delay);
      } else if (trigger === "on_scroll") {
        const handleScroll = () => {
          if (window.scrollY > 200 && !triggered) {
            setTriggered(true);
            setVisible(true);
            window.removeEventListener("scroll", handleScroll);
          }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      } else if (trigger === "on_exit") {
        const handleMouseLeave = (e) => {
          if (e.clientY <= 0 && !triggered) {
            setTriggered(true);
            setVisible(true);
            document.removeEventListener("mouseleave", handleMouseLeave);
          }
        };
        document.addEventListener("mouseleave", handleMouseLeave);
        return () => document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    loadPopup();
    return () => clearTimeout(timer);
  }, [currentPageName, facilityId]);

  if (!popup || !visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
    >
      <PopupDisplay popup={popup} onClose={() => setVisible(false)} />
    </div>
  );
}