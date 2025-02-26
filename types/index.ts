export interface User {
  $id: string
  name: string
  email: string
  preferences?: {
    theme?: "light" | "dark"
  }
}

export interface Material {
  $id: string
  userId: string
  title: string
  type: "note" | "pdf" | "link"
  content?: string
  url?: string
  fileId?: string
  tags: string[]
  priority: "high" | "medium" | "low"
  createdAt: string
  updatedAt: string
}

export interface StudyGroup {
  $id: string
  name: string
  description: string
  ownerId: string
  members: string[]
  createdAt: string
}

