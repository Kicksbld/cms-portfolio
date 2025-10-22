<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Create New Project"
        description="Add a new project to your portfolio"
      />
    </template>

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
              :disabled="projectsStore.loading"
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
              :disabled="projectsStore.loading"
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
              :disabled="projectsStore.loading"
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

          <div class="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              :disabled="projectsStore.loading || !formData.title"
              class="gap-2"
            >
              <Spinner v-if="projectsStore.loading" />
              <Save v-else class="h-4 w-4" />
              {{ projectsStore.loading ? "Creating..." : "Create Project" }}
            </Button>
            <Button
              type="button"
              variant="outline"
              :disabled="projectsStore.loading"
              @click="handleCancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Save } from "lucide-vue-next";
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
import type { CreateProjectData } from "~/types/projects";
import Spinner from "~/components/ui/spinner/Spinner.vue";

const router = useRouter();
const projectsStore = useProjectsStore();

const formData = reactive<CreateProjectData>({
  title: "",
  description: "",
  thumbnail: null,
});

const previewUrl = ref<string | null>(null);

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

const handleSubmit = async () => {
  try {
    await projectsStore.createProject({
      title: formData.title,
      description: formData.description || null,
      thumbnail: formData.thumbnail || null,
    });

    router.push("/dashboard/projects");
  } catch (error: any) {
    console.error("Failed to create project:", error);
  }
};

const handleCancel = () => {
  router.push("/dashboard/projects");
};
</script>
