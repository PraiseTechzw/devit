"use client"

import { useState, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import mammoth from "mammoth"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { storage } from "@/lib/appwrite"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface FileViewerProps {
  fileId: string
  fileName: string
  fileType: string
}

export function FileViewer({ fileId, fileName, fileType }: FileViewerProps) {
  const [content, setContent] = useState<string>("")
  const [numPages, setNumPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  const loadFile = useCallback(async () => {
    try {
      setLoading(true)
      const result = await storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!, fileId)
      const blob = new Blob([result])

      if (fileType === "application/pdf") {
        // PDF files are handled directly by react-pdf
        setContent(URL.createObjectURL(blob))
      } else if (fileType.includes("word")) {
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
      setContent("Error loading file content")
    } finally {
      setLoading(false)
    }
  }, [fileId, fileType])

  useEffect(() => {
    loadFile()
  }, [loadFile])

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

  // PDF Viewer
  if (fileType === "application/pdf") {
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
            <Page pageNumber={currentPage} />
          </Document>
        </ScrollArea>
      </div>
    )
  }

  // DOCX Viewer
  if (fileType.includes("word")) {
    return (
      <ScrollArea className="h-full">
        <div className="prose max-w-none p-4" dangerouslySetInnerHTML={{ __html: content }} />
      </ScrollArea>
    )
  }

  // Code Viewer
  if (fileName.match(/\.(js|ts|py|java|cpp|cs|html|css|json)$/)) {
    return (
      <ScrollArea className="h-full">
        <SyntaxHighlighter
          language={getLanguageFromFileName(fileName)}
          style={tomorrow}
          customStyle={{ margin: 0, borderRadius: 0, minHeight: "100%" }}
        >
          {content}
        </SyntaxHighlighter>
      </ScrollArea>
    )
  }

  // Text Viewer (fallback)
  return (
    <ScrollArea className="h-full">
      <pre className="p-4 whitespace-pre-wrap font-mono text-sm">{content}</pre>
    </ScrollArea>
  )
}

