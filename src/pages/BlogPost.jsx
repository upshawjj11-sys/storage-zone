import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import RichTextRenderer from "../components/shared/RichTextRenderer";

export default function BlogPost() {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const results = await base44.entities.BlogPost.filter({ slug, status: "published" });
      return results[0] || null;
    },
    enabled: !!slug,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["blog-related", post?.category],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published", category: post.category }, "-published_date", 4),
    enabled: !!post?.category,
  });

  const relatedFiltered = related.filter(p => p.id !== post?.id).slice(0, 3);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-32">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
        <p className="text-gray-500 mb-6">This post may have been moved or deleted.</p>
        <Link to="/Blog" className="text-[#E8792F] font-semibold hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover image */}
      {post.cover_image && (
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        <Link to="/Blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B365D] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Meta */}
        {post.category && (
          <span className="text-xs text-[#E8792F] uppercase tracking-wide font-semibold">{post.category}</span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b">
          {post.author_name && (
            <div className="flex items-center gap-2">
              {post.author_avatar ? (
                <img src={post.author_avatar} alt={post.author_name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1B365D] flex items-center justify-center text-white text-xs font-bold">
                  {post.author_name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-700">{post.author_name}</span>
            </div>
          )}
          {post.published_date && (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(post.published_date), "MMMM d, yyyy")}</span>
          )}
          {post.read_time_minutes && (
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.read_time_minutes} min read</span>
          )}
        </div>

        {/* Content */}
        <div className="rich-text-content prose prose-lg max-w-none text-gray-700">
          <RichTextRenderer content={post.content} />
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map(tag => (
              <Badge key={tag} className="bg-gray-100 text-gray-600 border-0">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Related posts */}
        {relatedFiltered.length > 0 && (
          <div className="mt-16 pt-10 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Posts</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedFiltered.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group">
                  {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-32 object-cover rounded-xl mb-3 group-hover:opacity-90 transition" />}
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#1B365D] transition text-sm line-clamp-2">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}