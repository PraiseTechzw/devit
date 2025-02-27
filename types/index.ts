export interface Material {
  id: string
  title: string
  type: "note" | "pdf" | "link"
  content?: string
  url?: string
  fileId?: string
  tags: string[]
  priority: "high" | "medium" | "low"
  createdAt: Date
  updatedAt: Date
  userId: string
  date: string
}


export interface StudyGroup {
  id: string
  name: string
  description?: string
  ownerId: string
  members: string[]
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  count: number
  userId: string
}

