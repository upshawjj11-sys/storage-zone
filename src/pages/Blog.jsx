import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Clock, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_date"),
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["page-config-blog"],
    queryFn: () => base44.entities.PageConfig.filter({ page_key: "blog" }),
  });

  const cfg = configs[0] || {};

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const layout = cfg.card_layout || "grid-3";
  const gridClass =
    layout === "grid-2"
      ? "grid md:grid-cols-2 gap-6"
      : layout === "list"
      ? "flex flex-col gap-4"
      : "grid md:grid-cols-2 lg:grid-cols-3 gap-6";

  const heroBg = cfg.hero_bg_color || "#1B365D";
  const heroTitleColor = cfg.hero_title_color || "#ffffff";
  const heroSubtitleColor = cfg.hero_subtitle_color || "#cbd5e1";
  const pageBg = cfg.page_bg_color || "#f8fafc";
  const accent = cfg.accent_color || "#E8792F";
  const cardBg = cfg.card_bg_color || "#ffffff";
  const cardTitleColor = cfg.card_title_color || "#111827";
  const cardTextColor = cfg.card_text_color || "#6b7280";

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      {/* Hero */}
      <div className="py-16 px-6 text-center" style={{ background: heroBg }}>
        <h1 className="text-3xl md:text-5xl font-bold mb-3" style={{ color: heroTitleColor }}>
          {cfg.hero_title || "Our Blog"}
        </h1>
        {cfg.hero_subtitle && (
          <p className="text-lg max-w-xl mx-auto" style={{ color: heroSubtitleColor }}>
            {cfg.hero_subtitle}
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search + Filters */}
        {(cfg.show_search !== false || cfg.show_category_filter !== false) && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {cfg.show_search !== false && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ "--tw-ring-color": accent }}
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            {cfg.show_category_filter !== false && categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition"
                    style={
                      activeCategory === cat
                        ? { background: accent, color: "#fff" }
                        : { background: "#e5e7eb", color: "#374151" }
                    }
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No posts found.</div>
        ) : (
          <div className={gridClass}>
            {filtered.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group block">
                <div
                  className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition h-full flex flex-col"
                  style={{ background: cardBg }}
                >
                  {post.cover_image && layout !== "list" && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className={`p-5 flex flex-col flex-1 ${layout === "list" ? "md:flex-row md:items-start md:gap-4" : ""}`}>
                    {post.cover_image && layout === "list" && (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0 mb-3 md:mb-0"
                      />
                    )}
                    <div className="flex flex-col flex-1">
                      {post.category && (
                        <span className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: accent }}>
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-lg font-bold mb-2 group-hover:underline" style={{ color: cardTitleColor }}>
                        {post.title}
                      </h2>
                      {cfg.show_excerpt !== false && post.excerpt && (
                        <p className="text-sm line-clamp-3 mb-3" style={{ color: cardTextColor }}>
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-3 text-xs" style={{ color: cardTextColor }}>
                        {cfg.show_date !== false && post.published_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(post.published_date), "MMM d, yyyy")}
                          </span>
                        )}
                        {cfg.show_read_time !== false && post.read_time_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time_minutes} min read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}