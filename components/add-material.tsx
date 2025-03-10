"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { File, Link2, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const ACCEPTED_FILE_TYPES = {
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ],
  maxSize: 10 * 1024 * 1024, // 10MB
};

export function AddMaterial() {
  const { user } = useUser();
  const pathname = usePathname();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [materialType, setMaterialType] = useState<"note" | "pdf" | "link">();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    url: "",
    tags: [] as string[],
    priority: "medium" as "high" | "medium" | "low",
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([
    "Biology",
    "Chemistry",
    "Physics",
    "Lab Work",
    "Research",
    "Mathematics",
    "Engineering",
    "Computer Science",
    "History",
    "Literature",
  ]);

  // Fetch user's past tags from the database
  useEffect(() => {
    if (user) {
      fetch(`/api/materials?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const tags = data.flatMap((material: any) => material.tags || []);
          const uniqueTags = Array.from(new Set(tags)) as string[];
          setUserTags(uniqueTags);
        })
        .catch((error) => console.error("Failed to fetch user tags:", error));
    }
  }, [user]);

  // Combine user tags and popular tags for suggestions
  useEffect(() => {
    setSuggestedTags(Array.from(new Set([...userTags, ...popularTags])));
  }, [userTags, popularTags]);

  // Set initial material type based on current route
  useEffect(() => {
    switch (pathname) {
      case "/notes":
        setMaterialType("note");
        setStep(2);
        break;
      case "/documents":
        setMaterialType("pdf");
        setStep(2);
        break;
      case "/links":
        setMaterialType("link");
        setStep(2);
        break;
    }
  }, [pathname]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!ACCEPTED_FILE_TYPES.document.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, Word, or PowerPoint document.",
      });
      return;
    }

    if (file.size > ACCEPTED_FILE_TYPES.maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 10MB.",
      });
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      title: file.name.split(".")[0],
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a title for your material.",
      });
      return false;
    }

    switch (materialType) {
      case "note":
        if (!formData.content.trim()) {
          toast({
            variant: "destructive",
            title: "Content required",
            description: "Please enter some content for your note.",
          });
          return false;
        }
        break;
      case "pdf":
        if (!selectedFile) {
          toast({
            variant: "destructive",
            title: "File required",
            description: "Please select a document to upload.",
          });
          return false;
        }
        break;
      case "link":
        if (!formData.url.trim()) {
          toast({
            variant: "destructive",
            title: "URL required",
            description: "Please enter a valid URL.",
          });
          return false;
        }
        break;
    }

    return true;
  };

  const resetForm = () => {
    setStep(1);
    setMaterialType(undefined);
    setFormData({
      title: "",
      content: "",
      url: "",
      tags: [],
      priority: "medium",
    });
    setSelectedFile(null);
    setOpen(false);
  };

  async function handleSubmit() {
    if (!user || !validateForm()) return;
    setLoading(true);

    try {
      let fileId: string | undefined;
      let fileSize: number | undefined;

      // Handle file upload for PDF materials
      if (materialType === "pdf" && selectedFile) {
        const uploadedFile = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!,
          ID.unique(),
          selectedFile,
        );
        fileId = uploadedFile.$id;
        fileSize = selectedFile.size; // Add file size
      }

      // Prepare the payload
      const payload: any = {
        userId: user.id,
        title: formData.title,
        type: materialType,
        priority: formData.priority,
        tags: formData.tags,
      };

      // Add type-specific fields
      switch (materialType) {
        case "note":
          payload.content = formData.content;
          break;
        case "pdf":
          payload.fileId = fileId;
          payload.fileSize = fileSize;
          break;
        case "link":
          payload.url = formData.url;
          break;
      }

      console.log("Payload:", payload); // Debugging: Log the payload

      // Send the request to the API
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Handle response errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create material");
      }

      // Success: Show toast and reset the form
      toast({
        title: "Success!",
        description: "Your material has been added successfully.",
      });
      resetForm();
    } catch (error) {
      console.error("Error creating material:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error instanceof Error ? error.message : "Failed to create material. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 shadow-lg bg-[#319795] hover:bg-[#2C7A7B] transition-all duration-300 hover:scale-105"
          size="lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>Upload your study materials and organize them efficiently.</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: "note" as const, icon: File, label: "Text Note" },
                { type: "pdf" as const, icon: File, label: "Document" },
                { type: "link" as const, icon: Link2, label: "Web Link" },
              ].map((item) => (
                <Card
                  key={item.type}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#319795] hover:shadow-md",
                    materialType === item.type && "border-[#319795] scale-105 shadow-md",
                  )}
                  onClick={() => setMaterialType(item.type)}
                >
                  <CardHeader className="text-center">
                    <item.icon className="w-8 h-8 mx-auto text-[#319795]" />
                    <CardTitle className="text-sm">{item.label}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <Button
              className="bg-[#319795] hover:bg-[#2C7A7B] transition-all duration-300"
              disabled={!materialType}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter material title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {materialType === "note" && (
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your notes here..."
                    className="h-32"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
              )}

              {materialType === "pdf" && (
                <div className="grid gap-2">
                  <Label htmlFor="file">Upload Document</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive ? "border-[#319795] bg-[#319795]/5" : "border-gray-200",
                      "hover:border-[#319795] hover:bg-[#319795]/5",
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInput.current?.click()}
                  >
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept={ACCEPTED_FILE_TYPES.document.join(",")}
                      ref={fileInput}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="w-8 h-8 text-[#319795]" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Drag and drop your document here, or click to browse</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Supports PDF, Word, and PowerPoint files up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {materialType === "link" && (
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as "high" | "medium" | "low" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer bg-[#319795] text-white hover:bg-[#2C7A7B]"
                      onClick={() => {
                        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
                      }}
                    >
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Type or select tags"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        const newTag = e.currentTarget.value.trim();
                        if (!formData.tags.includes(newTag)) {
                          setFormData({ ...formData, tags: [...formData.tags, newTag] });
                        }
                        e.currentTarget.value = ""; // Clear the input
                      }
                    }}
                  />
                  {/* Display tag suggestions */}
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {suggestedTags
                      .filter((tag) => !formData.tags.includes(tag)) // Exclude already selected tags
                      .map((tag) => (
                        <div
                          key={tag}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            if (!formData.tags.includes(tag)) {
                              setFormData({ ...formData, tags: [...formData.tags, tag] });
                            }
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              {!pathname.includes("/notes") && !pathname.includes("/documents") && !pathname.includes("/links") && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button
                className={cn(
                  "bg-[#319795] hover:bg-[#2C7A7B] transition-all duration-300",
                  loading && "opacity-50 cursor-not-allowed",
                )}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Material"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}