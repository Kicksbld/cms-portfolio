import { defineStore } from 'pinia'
import type { Block, BlocksResponse, CreateBlockData, UpdateBlockData, DeleteBlockResponse } from '~/types/projects'

interface BlocksState {
  blocks: Block[]
  loading: boolean
  error: string | null
}

export const useBlocksStore = defineStore('blocks', {
  state: (): BlocksState => ({
    blocks: [],
    loading: false,
    error: null,
  }),

  getters: {
    allBlocks: (state): Block[] => state.blocks,
    blockById: (state) => (id: number): Block | undefined => {
      return state.blocks.find(block => block.id === id)
    },
    blocksByProjectId: (state) => (projectId: number): Block[] => {
      return state.blocks.filter(block => block.project_id === projectId)
    },
    hasBlocks: (state): boolean => state.blocks.length > 0,
  },

  actions: {
    async fetchBlocks(projectId: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<BlocksResponse>(`/api/projects/${projectId}/blocks`, {
          method: 'GET',
        })

        this.blocks = response.data

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching blocks'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createBlock(projectId: number, blockData: CreateBlockData) {
      this.loading = true
      this.error = null

      try {
        // Create FormData to handle file upload
        const formData = new FormData()
        formData.append('title', blockData.title)

        if (blockData.description) {
          formData.append('description', blockData.description)
        }

        if (blockData.image) {
          formData.append('image', blockData.image)
        }

        const response = await $fetch<{ data: Block }>(`/api/projects/${projectId}/blocks`, {
          method: 'POST',
          body: formData,
        })

        // Add the new block to the list
        this.blocks.push(response.data)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while creating the block'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateBlock(blockId: number, blockData: UpdateBlockData) {
      this.loading = true
      this.error = null

      try {
        // Create FormData to handle file upload
        const formData = new FormData()

        if (blockData.title !== undefined) {
          formData.append('title', blockData.title)
        }

        if (blockData.description !== undefined) {
          formData.append('description', blockData.description || '')
        }

        if (blockData.image) {
          formData.append('image', blockData.image)
        }

        const response = await $fetch<{ data: Block }>(`/api/blocks/${blockId}`, {
          method: 'PATCH',
          body: formData,
        })

        // Update the block in the list
        const index = this.blocks.findIndex(block => block.id === blockId)
        if (index !== -1) {
          this.blocks[index] = response.data
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while updating the block'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteBlock(blockId: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<DeleteBlockResponse>(`/api/blocks/${blockId}`, {
          method: 'DELETE',
        })

        // Remove the block from the list
        this.blocks = this.blocks.filter(block => block.id !== blockId)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while deleting the block'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    clearBlocks() {
      this.blocks = []
    },
  },
})
