<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Create Bento Block"
        description="Create a new block to organize your skills or interests"
      />
    </template>

    <div class="space-y-6 max-w-3xl">
      <!-- Block Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Block Details</CardTitle>
          <CardDescription>
            Give your bento block a title and add items to it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Title -->
            <div class="space-y-2">
              <label
                for="title"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Block Title <span class="text-red-500">*</span>
              </label>
              <Input
                id="title"
                v-model="formData.title"
                placeholder="e.g., My Skills, What I Love, Hobbies"
                required
                :disabled="bentoStore.loading"
              />
              <p class="text-sm text-muted-foreground">
                Choose a descriptive title for this collection
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Items Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Block Items</CardTitle>
              <CardDescription>
                Add skills, interests, or items to your bento block
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              :disabled="bentoStore.loading"
              @click="addItem"
              class="gap-2"
            >
              <Plus class="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="items.length === 0" class="text-center py-8">
            <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Sparkles class="h-6 w-6 text-muted-foreground" />
            </div>
            <p class="text-sm text-muted-foreground mb-4">
              No items added yet. Add items to populate your bento block.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              :disabled="bentoStore.loading"
              @click="addItem"
              class="gap-2"
            >
              <Plus class="h-4 w-4" />
              Add Your First Item
            </Button>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in items"
              :key="item.tempId"
              class="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0">
                <span class="text-sm font-medium text-primary">{{ index + 1 }}</span>
              </div>
              <Input
                v-model="item.text"
                placeholder="e.g., Vue.js, Skiing, Photography"
                :disabled="bentoStore.loading"
                class="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                :disabled="bentoStore.loading"
                @click="removeItem(index)"
                class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <Button
          type="button"
          :disabled="bentoStore.loading || !formData.title"
          @click="handleSubmit"
          class="gap-2"
        >
          <Spinner v-if="bentoStore.loading" />
          <Save v-else class="h-4 w-4" />
          {{ bentoStore.loading ? "Creating..." : "Create Bento Block" }}
        </Button>
        <Button
          type="button"
          variant="outline"
          :disabled="bentoStore.loading"
          @click="handleCancel"
        >
          Cancel
        </Button>
      </div>

      <!-- Error Display -->
      <div v-if="bentoStore.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div class="flex items-center gap-2 text-destructive">
          <AlertCircle class="h-4 w-4" />
          <p class="text-sm font-medium">
            {{ bentoStore.error }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Save, Plus, Trash2, Sparkles, AlertCircle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
import { useBentoStore } from "~/stores/bento";
import type { CreateBentoBlockData } from "~/types/bento";
import Spinner from "~/components/ui/spinner/Spinner.vue";

const router = useRouter();
const bentoStore = useBentoStore();

// Form data
const formData = reactive<CreateBentoBlockData>({
  title: "",
  items: [],
});

// Items management
interface ItemForm {
  tempId: string;
  text: string;
}

const items = ref<ItemForm[]>([]);

// Add a new item
const addItem = () => {
  items.value.push({
    tempId: `temp-${Date.now()}-${Math.random()}`,
    text: "",
  });
};

// Remove an item
const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

// Handle form submission
const handleSubmit = async () => {
  bentoStore.clearError();

  // Filter out empty items
  const validItems = items.value
    .filter((item) => item.text && item.text.trim() !== "")
    .map((item) => item.text.trim());

  try {
    await bentoStore.createBlock({
      title: formData.title,
      items: validItems,
    });

    router.push("/dashboard/skills");
  } catch (error: any) {
    console.error("Failed to create bento block:", error);
  }
};

// Handle cancel
const handleCancel = () => {
  router.push("/dashboard/skills");
};

// Clear errors on mount
onMounted(() => {
  bentoStore.clearError();
});
</script>
