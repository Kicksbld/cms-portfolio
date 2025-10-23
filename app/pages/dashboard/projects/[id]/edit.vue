<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Edit Project"
        description="Update your project details, categories, and blocks"
      />
    </template>

    <div v-if="initialLoading" class="flex items-center justify-center py-12">
      <Spinner class="h-8 w-8" />
    </div>

    <div v-else-if="!project" class="text-center py-12">
      <p class="text-muted-foreground">Project not found</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Project Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Update the details for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="space-y-2">
              <label
                for="title"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title <span class="text-red-500">*</span>
              </label>
              <Input
                id="title"
                v-model="formData.title"
                placeholder="Enter project title"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="space-y-2">
              <label
                for="description"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description
              </label>
              <Textarea
                id="description"
                v-model="formData.description!"
                placeholder="Describe your project..."
                rows="5"
                :disabled="isLoading"
              />
            </div>

            <div class="space-y-2">
              <label
                for="thumbnail"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Thumbnail Image
              </label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                :disabled="isLoading"
                @change="handleFileChange"
              />
              <p class="text-sm text-muted-foreground">
                Upload a new image to replace the current thumbnail
              </p>
            </div>

            <div
              v-if="previewUrl || project.thumbnail"
              class="relative rounded-lg border overflow-hidden bg-muted"
            >
              <img
                :src="previewUrl || project.thumbnail"
                alt="Thumbnail preview"
                class="w-full h-48 object-cover"
              />
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Categories
              </label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <Input
                    v-model="categorySearch"
                    placeholder="Search or create category..."
                    :disabled="isLoading"
                    @keydown.enter.prevent="handleAddCategory"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  :disabled="isLoading || !categorySearch.trim()"
                  @click="handleAddCategory"
                  class="gap-2"
                >
                  <Plus class="h-4 w-4" />
                  Add
                </Button>
              </div>

              <!-- Category suggestions dropdown -->
              <div
                v-if="categorySearch && filteredCategories.length > 0"
                class="border rounded-md bg-popover text-popover-foreground shadow-md max-h-48 overflow-y-auto"
              >
                <div
                  v-for="category in filteredCategories"
                  :key="category.id"
                  class="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                  @click="selectCategory(category)"
                >
                  {{ category.name }}
                </div>
              </div>

              <!-- Selected categories -->
              <div v-if="selectedCategories.length > 0" class="flex flex-wrap gap-2 mt-2">
                <div
                  v-for="category in selectedCategories"
                  :key="category.id"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <span>{{ category.name }}</span>
                  <button
                    type="button"
                    :disabled="isLoading"
                    @click="removeCategory(category.id)"
                    class="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </div>
              </div>

              <p class="text-sm text-muted-foreground">
                Select existing categories or type to create new ones
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Project Blocks Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Project Blocks</CardTitle>
              <CardDescription>
                Manage sections or components that make up your project
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              :disabled="isLoading"
              @click="addBlock"
              class="gap-2"
            >
              <Plus class="h-4 w-4" />
              Add Block
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="blocks.length === 0" class="text-center py-8">
            <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Layers class="h-6 w-6 text-muted-foreground" />
            </div>
            <p class="text-sm text-muted-foreground mb-4">
              No blocks added yet. Add blocks to showcase different aspects of your project.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              :disabled="isLoading"
              @click="addBlock"
              class="gap-2"
            >
              <Plus class="h-4 w-4" />
              Add Your First Block
            </Button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(block, index) in blocks"
              :key="block.id || block.tempId"
              class="border rounded-lg p-4 space-y-4 bg-card relative"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary">{{ index + 1 }}</span>
                  </div>
                  <h4 class="text-sm font-medium">
                    {{ block.id ? `Block ${index + 1}` : `New Block ${index + 1}` }}
                  </h4>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  :disabled="isLoading"
                  @click="removeBlock(index)"
                  class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label
                    :for="`block-title-${index}`"
                    class="text-sm font-medium leading-none"
                  >
                    Title <span class="text-red-500">*</span>
                  </label>
                  <Input
                    :id="`block-title-${index}`"
                    v-model="block.title"
                    placeholder="Enter block title"
                    :disabled="isLoading"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    :for="`block-description-${index}`"
                    class="text-sm font-medium leading-none"
                  >
                    Description
                  </label>
                  <Textarea
                    :id="`block-description-${index}`"
                    v-model="block.description!"
                    placeholder="Describe this block..."
                    rows="3"
                    :disabled="isLoading"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    :for="`block-image-${index}`"
                    class="text-sm font-medium leading-none"
                  >
                    Block Image
                  </label>
                  <Input
                    :id="`block-image-${index}`"
                    type="file"
                    accept="image/*"
                    :disabled="isLoading"
                    @change="handleBlockImageChange(index, $event)"
                  />
                  <p class="text-xs text-muted-foreground">
                    Upload an image that represents this block
                  </p>
                </div>

                <div
                  v-if="block.previewUrl || block.url"
                  class="relative rounded-lg border overflow-hidden bg-muted"
                >
                  <img
                    :src="block.previewUrl || block.url"
                    alt="Block image preview"
                    class="w-full h-32 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <Button
          type="button"
          :disabled="isLoading || !formData.title"
          @click="handleSubmit"
          class="gap-2"
        >
          <Spinner v-if="isLoading" />
          <Save v-else class="h-4 w-4" />
          {{ isLoading ? "Saving..." : "Save Changes" }}
        </Button>
        <Button
          type="button"
          variant="outline"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancel
        </Button>
      </div>

      <!-- Error Display -->
      <div v-if="projectsStore.error || blocksStore.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div class="flex items-center gap-2 text-destructive">
          <AlertCircle class="h-4 w-4" />
          <p class="text-sm font-medium">
            {{ projectsStore.error || blocksStore.error }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Save, Plus, Trash2, Layers, AlertCircle, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea/Textarea.vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
import { useProjectsStore } from "~/stores/projects";
import { useBlocksStore } from "~/stores/blocks";
import { useCategoriesStore } from "~/stores/categories";
import type { CreateProjectData, Category, Block } from "~/types/projects";
import Spinner from "~/components/ui/spinner/Spinner.vue";

const router = useRouter();
const route = useRoute();
const projectsStore = useProjectsStore();
const blocksStore = useBlocksStore();
const categoriesStore = useCategoriesStore();

const projectId = computed(() => parseInt(route.params.id as string));

// Loading states
const initialLoading = ref(true);
const isLoading = computed(() => projectsStore.loading || blocksStore.loading);

// Project data
const project = ref<any>(null);

// Project form data
const formData = reactive<CreateProjectData>({
  title: "",
  description: "",
  thumbnail: null,
});

const previewUrl = ref<string | null>(null);

// Category management
const categorySearch = ref("");
const selectedCategories = ref<Category[]>([]);

// Filter categories based on search
const filteredCategories = computed(() => {
  if (!categorySearch.value.trim()) {
    return [];
  }

  const search = categorySearch.value.toLowerCase();
  return categoriesStore.allCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search) &&
      !selectedCategories.value.some((selected) => selected.id === cat.id)
  );
});

// Select an existing category
const selectCategory = (category: Category) => {
  if (!selectedCategories.value.some((cat) => cat.id === category.id)) {
    selectedCategories.value.push(category);
  }
  categorySearch.value = "";
};

// Add a new category or select existing one
const handleAddCategory = async () => {
  const name = categorySearch.value.trim();

  if (!name) return;

  // Check if category already exists
  const existing = categoriesStore.categoryByName(name);

  if (existing) {
    selectCategory(existing);
    return;
  }

  // Check if already selected
  if (selectedCategories.value.some((cat) => cat.name.toLowerCase() === name.toLowerCase())) {
    categorySearch.value = "";
    return;
  }

  // Create new category
  try {
    const response = await categoriesStore.createCategory(name);
    selectedCategories.value.push(response.data);
    categorySearch.value = "";
  } catch (error) {
    console.error("Failed to create category:", error);
  }
};

// Remove a selected category
const removeCategory = (categoryId: number) => {
  selectedCategories.value = selectedCategories.value.filter(
    (cat) => cat.id !== categoryId
  );
};

// Blocks management
interface BlockForm {
  id?: number;
  tempId?: string;
  title: string;
  description: string | null;
  url?: string | null;
  image?: File | null;
  previewUrl?: string;
  isNew?: boolean;
  isModified?: boolean;
  isDeleted?: boolean;
}

const blocks = ref<BlockForm[]>([]);
const blocksToDelete = ref<number[]>([]);

// Add a new block
const addBlock = () => {
  blocks.value.push({
    tempId: `temp-${Date.now()}-${Math.random()}`,
    title: "",
    description: "",
    image: null,
    previewUrl: undefined,
    isNew: true,
  });
};

// Remove a block
const removeBlock = (index: number) => {
  const block = blocks.value[index];

  if (block.id) {
    // Existing block - mark for deletion
    blocksToDelete.value.push(block.id);
  }

  blocks.value.splice(index, 1);
};

// Handle block image change
const handleBlockImageChange = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  const block = blocks.value[index];

  if (!block) return;

  if (file) {
    block.image = file;
    block.isModified = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      const currentBlock = blocks.value[index];
      if (currentBlock) {
        currentBlock.previewUrl = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);
  } else {
    block.image = null;
  }
};

// Handle thumbnail file change
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    formData.thumbnail = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    formData.thumbnail = null;
    previewUrl.value = null;
  }
};

// Validate blocks
const validateBlocks = (): boolean => {
  for (let i = 0; i < blocks.value.length; i++) {
    const block = blocks.value[i];
    if (!block || !block.title || block.title.trim() === "") {
      projectsStore.error = `Block ${i + 1} requires a title`;
      return false;
    }
  }

  return true;
};

// Handle form submission
const handleSubmit = async () => {
  projectsStore.clearError();
  blocksStore.clearError();

  if (!validateBlocks()) {
    return;
  }

  try {
    // Step 1: Update the project
    await projectsStore.updateProject(projectId.value, {
      title: formData.title,
      description: formData.description || null,
      thumbnail: formData.thumbnail || undefined,
      categoryIds: selectedCategories.value.map((cat) => cat.id),
    });

    // Step 2: Delete blocks marked for deletion
    if (blocksToDelete.value.length > 0) {
      await Promise.all(
        blocksToDelete.value.map((blockId) => blocksStore.deleteBlock(blockId))
      );
    }

    // Step 3: Create or update blocks
    for (const block of blocks.value) {
      if (block.isNew) {
        // Create new block
        await blocksStore.createBlock(projectId.value, {
          title: block.title,
          description: block.description || null,
          image: block.image || null,
        });
      } else if (block.isModified && block.id) {
        // Update existing block
        await blocksStore.updateBlock(block.id, {
          title: block.title,
          description: block.description || null,
          image: block.image || undefined,
        });
      }
    }

    // Step 4: Navigate back to projects list
    router.push("/dashboard/projects");
  } catch (error: any) {
    console.error("Failed to update project:", error);
  }
};

// Handle cancel
const handleCancel = () => {
  router.push("/dashboard/projects");
};

// Fetch project data on mount
onMounted(async () => {
  projectsStore.clearError();
  blocksStore.clearError();

  try {
    // Fetch categories
    await categoriesStore.fetchCategories();

    // Fetch project details
    const projectResponse = await projectsStore.fetchProjectById(projectId.value);
    project.value = projectResponse.data;

    // Pre-fill form data
    formData.title = project.value.title;
    formData.description = project.value.description || "";

    // Pre-select categories
    if (project.value.categories) {
      selectedCategories.value = [...project.value.categories];
    }

    // Fetch project blocks
    const blocksResponse = await blocksStore.fetchBlocks(projectId.value);
    blocks.value = blocksResponse.data.map((block: Block) => ({
      id: block.id,
      title: block.title,
      description: block.description,
      url: block.url,
      image: null,
      previewUrl: undefined,
      isNew: false,
      isModified: false,
    }));
  } catch (error) {
    console.error("Failed to fetch project data:", error);
  } finally {
    initialLoading.value = false;
  }
});

// Watch for changes in block title/description to mark as modified
watch(
  blocks,
  (newBlocks) => {
    newBlocks.forEach((block, index) => {
      if (!block.isNew && block.id) {
        // Check if title or description changed (would need original values to compare)
        // For simplicity, we'll mark as modified when they edit
        if (block.title || block.description !== null) {
          block.isModified = true;
        }
      }
    });
  },
  { deep: true }
);
</script>
