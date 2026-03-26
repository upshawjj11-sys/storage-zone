import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, BookOpen, Pencil, Trash2, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminBlog() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: () => base44.entities.BlogPost.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] }),
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Manage your blog content and articles.</p>
        </div>
        <Link to={createPageUrl("AdminBlogEdit")}>
          <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 && !isLoading ? (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-500 mb-6">Create your first blog post.</p>
            <Link to={createPageUrl("AdminBlogEdit")}>
              <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-4">
                {post.cover_image ? (
                  <img src={post.cover_image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />}
                    <Badge className={`border-0 text-xs ${post.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {post.status}
                    </Badge>
                    {post.category && (
                      <Badge className="border-0 text-xs bg-blue-100 text-blue-700">{post.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {post.excerpt ? post.excerpt.substring(0, 80) + (post.excerpt.length > 80 ? "…" : "") : "No excerpt"}
                    {post.published_date && ` · ${format(new Date(post.published_date), "MMM d, yyyy")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/blog/${post.slug}`}>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl("AdminBlogEdit") + `?id=${post.id}`}>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}