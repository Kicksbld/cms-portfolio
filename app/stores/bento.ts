import { defineStore } from 'pinia'
import type {
  BentoBlock,
  BentoItem,
  BentoBlocksResponse,
  BentoBlockResponse,
  BentoItemResponse,
  CreateBentoBlockData,
  CreateBentoItemData,
  UpdateBentoBlockData,
  UpdateBentoItemData,
  DeleteResponse
} from '~/types/bento'

interface BentoState {
  blocks: BentoBlock[]
  loading: boolean
  error: string | null
}

export const useBentoStore = defineStore('bento', {
  state: (): BentoState => ({
    blocks: [],
    loading: false,
    error: null,
  }),

  getters: {
    allBlocks: (state): BentoBlock[] => state.blocks,
    blockById: (state) => (id: number): BentoBlock | undefined => {
      return state.blocks.find(block => block.id === id)
    },
    hasBlocks: (state): boolean => state.blocks.length > 0,
    totalItems: (state): number => {
      return state.blocks.reduce((total, block) => total + (block.items?.length || 0), 0)
    },
  },

  actions: {
    // Fetch all bento blocks with their items
    async fetchBlocks() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<BentoBlocksResponse>('/api/bento-blocks', {
          method: 'GET',
        })

        this.blocks = response.data

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching bento blocks'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create a new bento block with optional initial items
    async createBlock(blockData: CreateBentoBlockData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<BentoBlockResponse>('/api/bento-blocks', {
          method: 'POST',
          body: blockData,
        })

        // Add the new block to the list
        this.blocks.push(response.data)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while creating the bento block'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update a bento block title
    async updateBlock(id: number, blockData: UpdateBentoBlockData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<BentoBlockResponse>(`/api/bento-blocks/${id}`, {
          method: 'PATCH',
          body: blockData,
        })

        // Update the block in the list
        const index = this.blocks.findIndex(block => block.id === id)
        if (index !== -1) {
          // Keep the items but update the title
          this.blocks[index] = {
            ...response.data,
            items: this.blocks[index].items
          }
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while updating the bento block'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete a bento block
    async deleteBlock(id: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<DeleteResponse>(`/api/bento-blocks/${id}`, {
          method: 'DELETE',
        })

        // Remove the block from the list
        this.blocks = this.blocks.filter(block => block.id !== id)

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while deleting the bento block'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Add an item to a bento block
    async createItem(itemData: CreateBentoItemData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<BentoItemResponse>('/api/bento-items', {
          method: 'POST',
          body: itemData,
        })

        // Add the item to the corresponding block
        const blockIndex = this.blocks.findIndex(block => block.id === itemData.bento_id)
        if (blockIndex !== -1) {
          if (!this.blocks[blockIndex].items) {
            this.blocks[blockIndex].items = []
          }
          this.blocks[blockIndex].items!.push(response.data)
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while creating the bento item'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update a bento item
    async updateItem(id: number, itemData: UpdateBentoItemData) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<BentoItemResponse>(`/api/bento-items/${id}`, {
          method: 'PATCH',
          body: itemData,
        })

        // Update the item in the corresponding block
        for (const block of this.blocks) {
          if (block.items) {
            const itemIndex = block.items.findIndex(item => item.id === id)
            if (itemIndex !== -1) {
              block.items[itemIndex] = response.data
              break
            }
          }
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while updating the bento item'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete a bento item
    async deleteItem(id: number, bentoId: number) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<DeleteResponse>(`/api/bento-items/${id}`, {
          method: 'DELETE',
        })

        // Remove the item from the corresponding block
        const blockIndex = this.blocks.findIndex(block => block.id === bentoId)
        if (blockIndex !== -1 && this.blocks[blockIndex].items) {
          this.blocks[blockIndex].items = this.blocks[blockIndex].items!.filter(
            item => item.id !== id
          )
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while deleting the bento item'
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
