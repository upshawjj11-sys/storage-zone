import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-blog-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_date"),
  });

  const categories = ["All", ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured || featured?.id !== p.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1B365D] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-lg text-white/70 mb-8">Tips, news, and insights on storage and more.</p>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="max-w-md mx-auto bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeCategory === cat ? "bg-[#1B365D] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No posts found.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link to={`/blog/${featured.slug}`} className="block mb-10">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition grid md:grid-cols-2">
                  {featured.cover_image && (
                    <img src={featured.cover_image} alt={featured.title} className="w-full h-64 md:h-auto object-cover" />
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <Badge className="bg-[#E8792F]/10 text-[#E8792F] border-0 mb-3 w-fit">Featured</Badge>
                    {featured.category && <span className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{featured.category}</span>}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{featured.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {featured.published_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(featured.published_date), "MMM d, yyyy")}</span>}
                      {featured.read_time_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.read_time_minutes} min read</span>}
                    </div>
                    <span className="mt-4 text-[#E8792F] font-semibold flex items-center gap-1 text-sm">Read More <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    {post.category && <span className="text-xs text-[#E8792F] uppercase tracking-wide font-semibold mb-2">{post.category}</span>}
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1B365D] transition">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {post.published_date && <span>{format(new Date(post.published_date), "MMM d, yyyy")}</span>}
                        {post.read_time_minutes && <span>{post.read_time_minutes} min</span>}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E8792F] opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}