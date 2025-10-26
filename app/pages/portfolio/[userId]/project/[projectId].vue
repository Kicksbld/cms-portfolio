<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <Button
            variant="ghost"
            @click="navigateTo(`/portfolio/${userId}`)"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <Loader
      v-if="loading"
      title="Loading project"
      description="Please wait while we fetch the project details."
    />

    <!-- Error State -->
    <Empty v-else-if="error">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle class="text-red-500" />
        </EmptyMedia>
        <EmptyTitle>Project Not Found</EmptyTitle>
        <EmptyDescription>
          {{ error }}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button @click="navigateTo(`/portfolio/${userId}`)">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
      </EmptyContent>
    </Empty>

    <!-- Project Content -->
    <main v-else-if="project" class="container mx-auto px-4 py-12">
      <!-- Project Header -->
      <div class="mb-12">
        <!-- Thumbnail -->
        <div
          v-if="project.thumbnail"
          class="relative h-[400px] rounded-2xl overflow-hidden mb-8 shadow-2xl"
        >
          <img
            :src="project.thumbnail"
            :alt="project.title"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <!-- Title and Meta -->
        <div class="space-y-4">
          <h1 class="text-4xl md:text-5xl font-bold">{{ project.title }}</h1>

          <!-- Categories -->
          <div
            v-if="project.categories && project.categories.length > 0"
            class="flex flex-wrap gap-2"
          >
            <span
              v-for="category in project.categories"
              :key="category.id"
              class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {{ category.name }}
            </span>
          </div>

          <!-- Description -->
          <p
            v-if="project.description"
            class="text-lg text-muted-foreground max-w-3xl"
          >
            {{ project.description }}
          </p>

          <!-- Date -->
          <div
            v-if="project.created_at"
            class="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Calendar class="h-4 w-4" />
            {{ formatDate(project.created_at) }}
          </div>
        </div>
      </div>

      <!-- Project Blocks -->
      <div v-if="project.blocks && project.blocks.length > 0" class="space-y-8">
        <div class="flex items-center gap-2 mb-6">
          <Layers class="h-6 w-6 text-primary" />
          <h2 class="text-3xl font-bold">Project Components</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            v-for="block in project.blocks"
            :key="block.id"
            class="overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
          >
            <!-- Block Image -->
            <div
              v-if="block.url"
              class="relative h-64 overflow-hidden bg-muted"
            >
              <img
                :src="block.url"
                :alt="block.title"
                class="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <!-- Block Content -->
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Box class="h-5 w-5 text-primary" />
                {{ block.title }}
              </CardTitle>
            </CardHeader>

            <CardContent v-if="block.description">
              <p class="text-muted-foreground">{{ block.description }}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Empty State for No Blocks -->
      <Empty v-else class="my-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Layers />
          </EmptyMedia>
          <EmptyTitle>No Components Yet</EmptyTitle>
          <EmptyDescription>
            This project doesn't have any components added yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <!-- Back Button -->
      <div class="mt-12 flex justify-center">
        <Button
          size="lg"
          variant="outline"
          @click="navigateTo(`/portfolio/${userId}`)"
        >
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Layers,
  Box,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Loader from "@/components/ui/Loader.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

const route = useRoute();
const userId = route.params.userId as string;
const projectId = route.params.projectId as string;

// State
const project = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Fetch project
const fetchProject = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { data } = await $fetch(`/api/public/portfolio/${userId}/project/${projectId}`);
    project.value = data;
  } catch (err: any) {
    console.error('Failed to fetch project:', err);
    error.value = err.data?.message || 'Failed to load project. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Fetch on mount
onMounted(() => {
  fetchProject();
});

// SEO Meta
useHead({
  title: () => project.value ? `${project.value.title} - Portfolio` : 'Project - Portfolio',
  meta: [
    {
      name: 'description',
      content: () => project.value?.description || 'View this portfolio project',
    },
  ],
});
</script>
