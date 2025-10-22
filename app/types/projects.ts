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
