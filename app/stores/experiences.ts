import { defineStore } from 'pinia'
import type {
  Experience,
  ExperiencesResponse,
  CreateExperienceData,
  UpdateExperienceData,
  DeleteExperienceResponse
} from '~/types/experiences'

interface ExperiencesState {
  experiences: Experience[]
  loading: boolean
  error: string | null
}

export const useExperiencesStore = defineStore('experiences', {
  state: (): ExperiencesState => ({
    experiences: [],
    loading: false,
    error: null,
  }),

  getters: {
    allExperiences: (state): Experience[] => state.experiences,
    experienceById: (state) => (id: number): Experience | undefined => {
      return state.experiences.find(exp => exp.id === id)
    },
    scholaireExperiences: (state): Experience[] => {
      return state.experiences.filter(exp => exp.type === 'scholaire')
    },
    professionnelExperiences: (state): Experience[] => {
      return state.experiences.filter(exp => exp.type === 'professionnel')
    },
    hasExperiences: (state): boolean => state.experiences.length > 0,
  },

  actions: {
    async fetchExperiences() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<ExperiencesResponse>('/api/experiences', {
          method: 'GET',
        })

        this.experiences = response.data

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching experiences'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchExperience(id: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: Experience }>(`/api/experiences/${id}`, {
          method: 'GET',
        })

        return response.data
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching the experience'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createExperience(experienceData: CreateExperienceData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: Experience }>('/api/experiences', {
          method: 'POST',
          body: experienceData,
        })

        // Add the new experience to the beginning of the list
        this.experiences.unshift(response.data)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while creating the experience'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateExperience(id: number, experienceData: UpdateExperienceData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: Experience }>(`/api/experiences/${id}`, {
          method: 'PATCH',
          body: experienceData,
        })

        // Update the experience in the list
        const index = this.experiences.findIndex(exp => exp.id === id)
        if (index !== -1) {
          this.experiences[index] = response.data
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while updating the experience'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteExperience(id: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<DeleteExperienceResponse>(`/api/experiences/${id}`, {
          method: 'DELETE',
        })

        // Remove the experience from the list
        this.experiences = this.experiences.filter(exp => exp.id !== id)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while deleting the experience'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
