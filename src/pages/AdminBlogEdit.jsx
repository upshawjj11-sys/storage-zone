import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, ArrowLeft, Upload, Trash2, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from "../components/admin/RichTextEditor";

const CATEGORIES = ["News", "Tips & Tricks", "Industry Insights", "Company Updates", "Storage Tips", "Moving Tips", "Business", "Announcements"];

export default function AdminBlogEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", cover_image: "",
    author_name: "", author_avatar: "", category: "", tags: [],
    status: "draft", published_date: "", featured: false, read_time_minutes: 5,
  });

  const { data: existing } = useQuery({
    queryKey: ["blog-post", postId],
    queryFn: () => base44.entities.BlogPost.filter({ id: postId }).then(r => r[0]),
    enabled: !!postId,
  });

  useEffect(() => {
    if (existing) setForm({ ...form, ...existing });
  }, [existing]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (val) => {
    update("title", val);
    if (!postId) update("slug", autoSlug(val));
  };

  const handleSave = async (status) => {
    setSaving(true);
    const data = { ...form, status: status || form.status };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (postId) {
      await base44.entities.BlogPost.update(postId, data);
    } else {
      await base44.entities.BlogPost.create(data);
    }
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    navigate(createPageUrl("AdminBlog"));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("cover_image", file_url);
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("AdminBlog"))} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{postId ? "Edit Post" : "New Blog Post"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {form.status === "published" && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                <Globe className="w-4 h-4" /> View Live
              </Button>
            </a>
          )}
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>Save Draft</Button>
          <Button onClick={() => handleSave("published")} disabled={saving} className="gap-2" style={{ background: "#E8792F" }}>
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Post Title</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="My Awesome Blog Post" className="text-lg font-semibold mt-1" />
              </div>
              <div>
                <Label>URL Slug</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">/blog/</span>
                  <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="my-awesome-blog-post" />
                </div>
              </div>
              <div>
                <Label>Excerpt <span className="text-gray-400 font-normal text-xs">(shown in cards/previews)</span></Label>
                <Textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="A brief summary of the post..." rows={3} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Post Content</CardTitle></CardHeader>
            <CardContent>
              <RichTextEditor value={form.content} onChange={(v) => update("content", v)} placeholder="Write your blog post here..." />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Settings */}
          <Card>
            <CardHeader><CardTitle className="text-base">Post Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Publish Date</Label>
                <Input type="date" value={form.published_date} onChange={(e) => update("published_date", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Read Time (minutes)</Label>
                <Input type="number" min={1} value={form.read_time_minutes || ""} onChange={(e) => update("read_time_minutes", parseInt(e.target.value))} className="mt-1 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Featured Post</Label>
                <Switch checked={!!form.featured} onCheckedChange={(v) => update("featured", v)} />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader><CardTitle className="text-base">Cover Image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.cover_image && (
                <div className="relative">
                  <img src={form.cover_image} alt="Cover" className="w-full h-40 object-cover rounded-lg" />
                  <Button size="sm" variant="destructive" className="absolute top-2 right-2 w-7 h-7 p-0" onClick={() => update("cover_image", "")}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <Input value={form.cover_image} onChange={(e) => update("cover_image", e.target.value)} placeholder="https://..." />
              <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit text-sm">
                <Upload className="w-3 h-3" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader><CardTitle className="text-base">Category & Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Category</Label>
                <Select value={form.category || ""} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input className="mt-2" placeholder="Or type custom..." value={form.category || ""} onChange={(e) => update("category", e.target.value)} />
              </div>
              <div>
                <Label className="text-sm">Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add tag..." />
                  <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
                </div>
                {form.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map(tag => (
                      <Badge key={tag} className="bg-blue-50 text-blue-700 border-0 gap-1 cursor-pointer" onClick={() => update("tags", form.tags.filter(t => t !== tag))}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader><CardTitle className="text-base">Author</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Author Name</Label>
                <Input value={form.author_name} onChange={(e) => update("author_name", e.target.value)} placeholder="Jane Smith" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Author Avatar URL</Label>
                <Input value={form.author_avatar} onChange={(e) => update("author_avatar", e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}