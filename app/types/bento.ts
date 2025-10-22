// Bento Item (content inside a block)
export interface BentoItem {
  id: number
  bento_id: number
  contentText: string
}

// Bento Block (container with items)
export interface BentoBlock {
  id: number
  user_id: number
  title: string
  items?: BentoItem[]  // Included when fetching blocks with items
}

// Response types
export interface BentoBlocksResponse {
  data: BentoBlock[]
}

export interface BentoBlockResponse {
  data: BentoBlock
}

export interface BentoItemResponse {
  data: BentoItem
}

// Create types
export interface CreateBentoBlockData {
  title: string
  items?: string[]  // Optional array of initial item texts
}

export interface CreateBentoItemData {
  bento_id: number
  contentText: string
}

// Update types
export interface UpdateBentoBlockData {
  title: string
}

export interface UpdateBentoItemData {
  contentText: string
}

// Delete response
export interface DeleteResponse {
  success: boolean
  message: string
}
