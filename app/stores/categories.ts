import { defineStore } from 'pinia'
import type { Category } from '~/types/projects'

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

interface CategoriesResponse {
  data: Category[]
}

interface CreateCategoryResponse {
  data: Category
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    allCategories: (state): Category[] => state.categories,
    categoryById: (state) => (id: number): Category | undefined => {
      return state.categories.find(category => category.id === id)
    },
    categoryByName: (state) => (name: string): Category | undefined => {
      return state.categories.find(
        category => category.name.toLowerCase() === name.toLowerCase()
      )
    },
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<CategoriesResponse>('/api/categories', {
          method: 'GET',
        })

        this.categories = response.data

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching categories'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCategory(name: string) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<CreateCategoryResponse>('/api/categories', {
          method: 'POST',
          body: { name },
        })

        // Check if category already exists in store
        const existingIndex = this.categories.findIndex(
          cat => cat.id === response.data.id
        )

        if (existingIndex === -1) {
          // Add new category to the list, keeping it sorted
          this.categories.push(response.data)
          this.categories.sort((a, b) => a.name.localeCompare(b.name))
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while creating the category'
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
