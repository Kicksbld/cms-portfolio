import { defineStore } from 'pinia'
import type { Project, ProjectsResponse, CreateProjectData, DeleteProjectResponse } from '~/types/projects'

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    projects: [],
    loading: false,
    error: null,
  }),

  getters: {
    allProjects: (state): Project[] => state.projects,
    projectById: (state) => (id: number): Project | undefined => {
      return state.projects.find(project => project.id === id)
    },
    hasProjects: (state): boolean => state.projects.length > 0,
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<ProjectsResponse>('/api/projects', {
          method: 'GET',
        })

        this.projects = response.data

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching projects'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProject(projectData: CreateProjectData) {
      this.loading = true
      this.error = null

      try {
        // Create FormData to handle file upload
        const formData = new FormData()
        formData.append('title', projectData.title)

        if (projectData.description) {
          formData.append('description', projectData.description)
        }

        if (projectData.thumbnail) {
          formData.append('thumbnail', projectData.thumbnail)
        }

        // Add category IDs as JSON string
        if (projectData.categoryIds && projectData.categoryIds.length > 0) {
          formData.append('categories', JSON.stringify(projectData.categoryIds))
        }

        const response = await $fetch<{ data: Project }>('/api/projects', {
          method: 'POST',
          body: formData,
        })

        // Add the new project to the beginning of the list
        this.projects.unshift(response.data)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while creating the project'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProjectById(projectId: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: Project }>(`/api/projects/${projectId}`, {
          method: 'GET',
        })

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching the project'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProject(projectId: number, projectData: CreateProjectData) {
      this.loading = true
      this.error = null

      try {
        // Create FormData to handle file upload
        const formData = new FormData()
        formData.append('title', projectData.title)

        if (projectData.description !== undefined) {
          formData.append('description', projectData.description || '')
        }

        if (projectData.thumbnail) {
          formData.append('thumbnail', projectData.thumbnail)
        }

        // Add category IDs as JSON string
        if (projectData.categoryIds !== undefined) {
          formData.append('categories', JSON.stringify(projectData.categoryIds))
        }

        const response = await $fetch<{ data: Project }>(`/api/projects/${projectId}`, {
          method: 'PATCH',
          body: formData,
        })

        // Update the project in the list
        const index = this.projects.findIndex(project => project.id === projectId)
        if (index !== -1) {
          this.projects[index] = response.data
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while updating the project'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteProject(projectId: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<DeleteProjectResponse>(`/api/projects/${projectId}`, {
          method: 'DELETE',
        })

        // Remove the project from the list
        this.projects = this.projects.filter(project => project.id !== projectId)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while deleting the project'
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
