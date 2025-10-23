export type ExperienceType = 'scholaire' | 'professionnel'

export interface Experience {
  id: number
  user_id: string
  title: string
  type: ExperienceType
  location: string | null
  start_date: string | null  // ISO date string from database
  end_date: string | null    // ISO date string from database
  description: string | null
}

export interface ExperiencesResponse {
  data: Experience[]
}

export interface CreateExperienceData {
  title: string
  type: ExperienceType
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
}

export interface UpdateExperienceData {
  title?: string
  type?: ExperienceType
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
}

export interface DeleteExperienceResponse {
  success: boolean
  message: string
}
