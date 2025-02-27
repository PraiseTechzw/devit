export interface User {
  $id: string
  name: string
  email: string
  major?: string
  academicYear?: string
  createdAt?: string
  preferences?: {
    theme?: string
    notifications?: boolean
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

