export interface Category {
  id: number
  name: string
}

export interface Project {
  id: number
  title: string
  thumbnail: string | null
  description: string | null
  categories?: Category[]
}

export interface ProjectsResponse {
  data: Project[]
}

export interface CreateProjectData {
  title: string
  thumbnail?: File | null
  description?: string | null
}

export interface DeleteProjectResponse {
  success: boolean
  message: string
}

// Block types
export interface Block {
  id: number
  project_id: number
  title: string
  description: string | null
  url: string | null  // Stores the image URL from storage
}

export interface BlocksResponse {
  data: Block[]
}

export interface CreateBlockData {
  title: string
  description?: string | null
  image?: File | null  // Changed from url to image file upload
}

export interface UpdateBlockData {
  title?: string
  description?: string | null
  image?: File | null  // Changed from url to image file upload
}

export interface DeleteBlockResponse {
  success: boolean
  message: string
}
