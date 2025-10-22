<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Create New Project"
        description="Add a new project to your portfolio"
      />
    </template>

    <div class="space-y-6">
      <!-- Project Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Fill in the details below to create your new project
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
              <p class="text-sm text-muted-foreground">
                Give your project a clear and descriptive title
              </p>
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
              <p class="text-sm text-muted-foreground">
                Provide a brief overview of your project and its key features
              </p>
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
                Upload an image that represents your project
              </p>
            </div>

            <div
              v-if="previewUrl"
              class="relative rounded-lg border overflow-hidden bg-muted"
            >
              <img
                :src="previewUrl"
                alt="Thumbnail preview"
                class="w-full h-48 object-cover"
              />
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
                Add sections or components that make up your project
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
              :key="block.tempId"
              class="border rounded-lg p-4 space-y-4 bg-card relative"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary">{{ index + 1 }}</span>
                  </div>
                  <h4 class="text-sm font-medium">Block {{ index + 1 }}</h4>
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
                  v-if="block.previewUrl"
                  class="relative rounded-lg border overflow-hidden bg-muted"
                >
                  <img
                    :src="block.previewUrl"
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
          {{ isLoading ? "Creating..." : "Create Project" }}
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
import { Save, Plus, Trash2, Layers, AlertCircle } from "lucide-vue-next";
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
import type { CreateProjectData, CreateBlockData } from "~/types/projects";
import Spinner from "~/components/ui/spinner/Spinner.vue";

const router = useRouter();
const projectsStore = useProjectsStore();
const blocksStore = useBlocksStore();

// Project form data
const formData = reactive<CreateProjectData>({
  title: "",
  description: "",
  thumbnail: null,
});

const previewUrl = ref<string | null>(null);

// Blocks management
interface BlockForm extends CreateBlockData {
  tempId: string;
  previewUrl?: string;
}

const blocks = ref<BlockForm[]>([]);

// Combined loading state
const isLoading = computed(() => projectsStore.loading || blocksStore.loading);

// Add a new block
const addBlock = () => {
  blocks.value.push({
    tempId: `temp-${Date.now()}-${Math.random()}`,
    title: "",
    description: "",
    image: null,
    previewUrl: undefined,
  });
};

// Remove a block
const removeBlock = (index: number) => {
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
    block.previewUrl = undefined;
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
  if (blocks.value.length === 0) {
    return true; // Blocks are optional
  }

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
  // Clear previous errors
  projectsStore.clearError();
  blocksStore.clearError();

  // Validate blocks
  if (!validateBlocks()) {
    return;
  }

  try {
    // Step 1: Create the project
    const response = await projectsStore.createProject({
      title: formData.title,
      description: formData.description || null,
      thumbnail: formData.thumbnail || null,
    });

    const projectId = response.data.id;

    // Step 2: Create all blocks for the project
    if (blocks.value.length > 0) {
      const blockPromises = blocks.value.map((block) =>
        blocksStore.createBlock(projectId, {
          title: block.title,
          description: block.description || null,
          image: block.image || null,
        })
      );

      await Promise.all(blockPromises);
    }

    // Step 3: Navigate to projects list
    router.push("/dashboard/projects");
  } catch (error: any) {
    console.error("Failed to create project:", error);
  }
};

// Handle cancel
const handleCancel = () => {
  router.push("/dashboard/projects");
};

// Clear errors on mount
onMounted(() => {
  projectsStore.clearError();
  blocksStore.clearError();
});
</script>
