"use client"

import { useState, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import mammoth from "mammoth"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storage } from "@/lib/appwrite"
import { useToast } from "@/hooks/use-toast"
import type { Material } from "@prisma/client"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface MaterialViewerProps {
  material: Material
}

export function MaterialViewer({ material }: MaterialViewerProps) {
  const { toast } = useToast()
  const [content, setContent] = useState<string>("")
  const [numPages, setNumPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (material.type === "note") {
        setContent(material.content || "")
        setLoading(false)
        return
      }

      if (material.type === "link") {
        setContent(material.url || "")
        setLoading(false)
        return
      }

      if (!material.fileId) {
        throw new Error("No file associated with this material")
      }

      const result = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, material.fileId)

      const blob = new Blob([result])

      if (material.type === "pdf") {
        // PDF files are handled directly by react-pdf
        setContent(URL.createObjectURL(blob))
      } else if (material.type.includes("word")) {
        // Convert DOCX to HTML
        const arrayBuffer = await blob.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        setContent(result.value)
      } else {
        // Text and code files
        const text = await blob.text()
        setContent(text)
      }
    } catch (error) {
      console.error("Error loading file:", error)
      setError("Failed to load file content. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [material])

  useEffect(() => {
    loadFile()
  }, [loadFile])

  const handleDownload = async () => {
    try {
      if (!material.fileId) {
        throw new Error("No file associated with this material")
      }

      const result = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, material.fileId)

      // Create a download link
      const url = URL.createObjectURL(result)
      const a = document.createElement("a")
      a.href = url
      a.download = material.title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "File downloaded successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file.",
      })
    }
  }

  const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "js":
        return "javascript"
      case "ts":
        return "typescript"
      case "py":
        return "python"
      case "java":
        return "java"
      case "cpp":
        return "cpp"
      case "cs":
        return "csharp"
      case "html":
        return "html"
      case "css":
        return "css"
      case "json":
        return "json"
      default:
        return "text"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // PDF Viewer
  if (material.type === "pdf") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <Document
            file={content}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <Page pageNumber={currentPage} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        </ScrollArea>
      </div>
    )
  }

  // Word Document Viewer
  if (material.type.includes("word")) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="prose max-w-none dark:prose-invert p-4" dangerouslySetInnerHTML={{ __html: content }} />
        </ScrollArea>
      </div>
    )
  }

  // Text Note Viewer
  if (material.type === "note") {
    return (
      <ScrollArea className="h-full">
        <div className="prose max-w-none dark:prose-invert p-4 whitespace-pre-wrap">{content}</div>
      </ScrollArea>
    )
  }

  // Code Viewer
  if (material.title.match(/\.(js|ts|py|java|cpp|cs|html|css|json)$/)) {
    return (
      <ScrollArea className="h-full">
        <SyntaxHighlighter
          language={getLanguageFromFileName(material.title)}
          style={tomorrow}
          customStyle={{ margin: 0, borderRadius: 0, minHeight: "100%" }}
        >
          {content}
        </SyntaxHighlighter>
      </ScrollArea>
    )
  }

  // Link Viewer
  if (material.type === "link") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground truncate flex-1">{content}</p>
          <Button variant="outline" size="sm" asChild className="ml-2">
            <a href={content} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </a>
          </Button>
        </div>
        <div className="flex-1 border rounded-lg overflow-hidden">
          <iframe
            src={content}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
            title={material.title}
          />
        </div>
      </div>
    )
  }

  // Fallback Text Viewer
  return (
    <ScrollArea className="h-full">
      <pre className="p-4 whitespace-pre-wrap font-mono text-sm">{content}</pre>
    </ScrollArea>
  )
}

