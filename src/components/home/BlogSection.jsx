import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function BlogSection({ section }) {
  const data = section.data || {};
  const layout = data.layout || "cards";
  const count = data.post_count || 3;
  const showExcerpt = data.show_excerpt !== false;
  const showDate = data.show_date !== false;
  const showReadTime = data.show_read_time !== false;
  const showCategory = data.show_category !== false;
  const accentColor = data.accent_color || "#E8792F";
  const cardBg = data.card_bg || "#ffffff";
  const textColor = data.text_color || "#111827";
  const btnBg = data.btn_bg || "#E8792F";
  const btnText = data.btn_text_color || "#ffffff";
  const viewAllUrl = data.view_all_url || "/Blog";

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["home-blog-posts", count],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_date", count),
  });

  if (isLoading) {
    return (
      <section className="py-16 px-6" style={{ background: section.bg_color || "#f9fafb" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-64 bg-gray-200 animate-pulse" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  const sectionHeader = (
    <div className={`mb-10 ${layout === "centered_hero" ? "text-center" : ""}`}>
      {section.title && <h2 className="text-3xl font-bold" style={{ color: textColor }}>{section.title}</h2>}
      {section.subtitle && <p className="mt-2 text-gray-500">{section.subtitle}</p>}
    </div>
  );

  const PostMeta = ({ post }) => (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-auto pt-3">
      {showDate && post.published_date && (
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(post.published_date), "MMM d, yyyy")}</span>
      )}
      {showReadTime && post.read_time_minutes && (
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time_minutes} min</span>
      )}
    </div>
  );

  const viewAllBtn = data.show_view_all !== false && (
    <div className={`mt-10 ${layout === "centered_hero" ? "text-center" : ""}`}>
      <Link to={viewAllUrl}>
        <button className="px-6 py-2.5 rounded-full font-semibold text-sm transition hover:opacity-90" style={{ background: btnBg, color: btnText }}>
          View All Posts <ArrowRight className="inline w-4 h-4 ml-1" />
        </button>
      </Link>
    </div>
  );

  /* ── LAYOUT: cards (default grid) ── */
  if (layout === "cards") {
    return (
      <section className="py-16 px-6" style={{ background: section.bg_color || "#f9fafb" }}>
        <div className="max-w-7xl mx-auto">
          {sectionHeader}
          <div className={`grid gap-6 ${count === 2 ? "sm:grid-cols-2" : count >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-1 max-w-md"}`}>
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col" style={{ background: cardBg }}>
                {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />}
                <div className="p-5 flex-1 flex flex-col">
                  {showCategory && post.category && <span className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: accentColor }}>{post.category}</span>}
                  <h3 className="font-bold mb-2 line-clamp-2 group-hover:opacity-80 transition" style={{ color: textColor }}>{post.title}</h3>
                  {showExcerpt && post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>}
                  <PostMeta post={post} />
                </div>
              </Link>
            ))}
          </div>
          {viewAllBtn}
        </div>
      </section>
    );
  }

  /* ── LAYOUT: list ── */
  if (layout === "list") {
    return (
      <section className="py-16 px-6" style={{ background: section.bg_color || "#f9fafb" }}>
        <div className="max-w-4xl mx-auto">
          {sectionHeader}
          <div className="space-y-5">
            {posts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-5 rounded-2xl p-4 shadow-sm hover:shadow-md transition group" style={{ background: cardBg }}>
                {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  {showCategory && post.category && <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: accentColor }}>{post.category}</span>}
                  <h3 className="font-bold mt-0.5 group-hover:opacity-80 transition line-clamp-1" style={{ color: textColor }}>{post.title}</h3>
                  {showExcerpt && post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{post.excerpt}</p>}
                  <PostMeta post={post} />
                </div>
                <ArrowRight className="w-5 h-5 flex-shrink-0 self-center text-gray-300 group-hover:translate-x-1 transition" />
              </Link>
            ))}
          </div>
          {viewAllBtn}
        </div>
      </section>
    );
  }

  /* ── LAYOUT: magazine (first post large, rest small) ── */
  if (layout === "magazine") {
    const [hero, ...others] = posts;
    return (
      <section className="py-16 px-6" style={{ background: section.bg_color || "#f9fafb" }}>
        <div className="max-w-7xl mx-auto">
          {sectionHeader}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Hero post */}
            <Link to={`/blog/${hero.slug}`} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col" style={{ background: cardBg }}>
              {hero.cover_image && <img src={hero.cover_image} alt={hero.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />}
              <div className="p-6 flex-1 flex flex-col">
                {showCategory && hero.category && <span className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: accentColor }}>{hero.category}</span>}
                <h3 className="text-xl font-bold mb-2 group-hover:opacity-80 transition" style={{ color: textColor }}>{hero.title}</h3>
                {showExcerpt && hero.excerpt && <p className="text-sm text-gray-500 line-clamp-3 flex-1">{hero.excerpt}</p>}
                <PostMeta post={hero} />
              </div>
            </Link>
            {/* Side posts */}
            <div className="space-y-4">
              {others.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-4 rounded-2xl p-4 shadow-sm hover:shadow-md transition group" style={{ background: cardBg }}>
                  {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    {showCategory && post.category && <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: accentColor }}>{post.category}</span>}
                    <h3 className="font-bold mt-0.5 group-hover:opacity-80 transition line-clamp-2 text-sm" style={{ color: textColor }}>{post.title}</h3>
                    <PostMeta post={post} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {viewAllBtn}
        </div>
      </section>
    );
  }

  /* ── LAYOUT: centered_hero (single large featured style) ── */
  if (layout === "centered_hero") {
    return (
      <section className="py-16 px-6" style={{ background: section.bg_color || "#f9fafb" }}>
        <div className="max-w-5xl mx-auto">
          {sectionHeader}
          <div className="space-y-8">
            {posts.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className={`grid ${post.cover_image ? "md:grid-cols-2" : ""} gap-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group`} style={{ background: cardBg }}>
                {post.cover_image && <img src={post.cover_image} alt={post.title} className={`w-full h-56 object-cover ${i % 2 === 1 ? "md:order-2" : ""} group-hover:scale-105 transition-transform duration-300`} />}
                <div className="p-8 flex flex-col justify-center">
                  {showCategory && post.category && <Badge className="border-0 w-fit mb-3 text-xs" style={{ background: `${accentColor}20`, color: accentColor }}>{post.category}</Badge>}
                  <h3 className="text-xl font-bold mb-3 group-hover:opacity-80 transition" style={{ color: textColor }}>{post.title}</h3>
                  {showExcerpt && post.excerpt && <p className="text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>}
                  <div className="flex items-center gap-2 mt-4">
                    <PostMeta post={post} />
                    <span className="ml-auto text-sm font-semibold flex items-center gap-1" style={{ color: accentColor }}>Read More <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {viewAllBtn}
        </div>
      </section>
    );
  }

  return null;
}