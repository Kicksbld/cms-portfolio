<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Add New Experience"
        description="Add a professional or educational experience to your profile"
      />
    </template>

    <div class="space-y-6 max-w-3xl">
      <!-- Experience Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Experience Details</CardTitle>
          <CardDescription>
            Fill in the details below to add your new experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Type Selection -->
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">
                Type <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-4">
                <div
                  @click="formData.type = 'professionnel'"
                  :class="[
                    'relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 cursor-pointer transition-all',
                    formData.type === 'professionnel'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  ]"
                >
                  <Briefcase :class="[
                    'h-8 w-8',
                    formData.type === 'professionnel' ? 'text-primary' : 'text-muted-foreground'
                  ]" />
                  <div class="text-center">
                    <p class="font-medium">Professional</p>
                    <p class="text-xs text-muted-foreground">Work experience</p>
                  </div>
                  <div
                    v-if="formData.type === 'professionnel'"
                    class="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check class="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>

                <div
                  @click="formData.type = 'scholaire'"
                  :class="[
                    'relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 cursor-pointer transition-all',
                    formData.type === 'scholaire'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  ]"
                >
                  <GraduationCap :class="[
                    'h-8 w-8',
                    formData.type === 'scholaire' ? 'text-primary' : 'text-muted-foreground'
                  ]" />
                  <div class="text-center">
                    <p class="font-medium">Education</p>
                    <p class="text-xs text-muted-foreground">Academic background</p>
                  </div>
                  <div
                    v-if="formData.type === 'scholaire'"
                    class="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check class="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                Choose the type of experience you want to add
              </p>
            </div>

            <!-- Title -->
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
                placeholder="e.g., Senior Software Engineer, Master's Degree in Computer Science"
                required
                :disabled="experiencesStore.loading"
              />
              <p class="text-sm text-muted-foreground">
                Enter the position title or degree name
              </p>
            </div>

            <!-- Location -->
            <div class="space-y-2">
              <label
                for="location"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Location
              </label>
              <div class="relative">
                <MapPin class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  v-model="formData.location!"
                  placeholder="e.g., Paris, France"
                  class="pl-10"
                  :disabled="experiencesStore.loading"
                />
              </div>
              <p class="text-sm text-muted-foreground">
                Where was this experience based?
              </p>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label
                  for="start_date"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Start Date
                </label>
                <Input
                  id="start_date"
                  v-model="formData.start_date!"
                  type="date"
                  :disabled="experiencesStore.loading"
                />
              </div>

              <div class="space-y-2">
                <label
                  for="end_date"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  End Date
                </label>
                <Input
                  id="end_date"
                  v-model="formData.end_date!"
                  type="date"
                  :disabled="experiencesStore.loading || isCurrentPosition"
                />
                <div class="flex items-center space-x-2">
                  <input
                    id="current"
                    v-model="isCurrentPosition"
                    type="checkbox"
                    class="h-4 w-4 rounded border-border"
                  />
                  <label
                    for="current"
                    class="text-sm text-muted-foreground cursor-pointer"
                  >
                    I currently work/study here
                  </label>
                </div>
              </div>
            </div>

            <!-- Description -->
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
                placeholder="Describe your responsibilities, achievements, and key learnings..."
                rows="6"
                :disabled="experiencesStore.loading"
              />
              <p class="text-sm text-muted-foreground">
                Provide details about what you did and what you learned
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <Button
          type="button"
          :disabled="experiencesStore.loading || !formData.title || !formData.type"
          @click="handleSubmit"
          class="gap-2"
        >
          <Spinner v-if="experiencesStore.loading" />
          <Save v-else class="h-4 w-4" />
          {{ experiencesStore.loading ? "Saving..." : "Save Experience" }}
        </Button>
        <Button
          type="button"
          variant="outline"
          :disabled="experiencesStore.loading"
          @click="handleCancel"
        >
          Cancel
        </Button>
      </div>

      <!-- Error Display -->
      <div v-if="experiencesStore.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div class="flex items-center gap-2 text-destructive">
          <AlertCircle class="h-4 w-4" />
          <p class="text-sm font-medium">
            {{ experiencesStore.error }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Save, Briefcase, GraduationCap, MapPin, AlertCircle, Check } from "lucide-vue-next";
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
import { useExperiencesStore } from "~/stores/experiences";
import type { CreateExperienceData } from "~/types/experiences";
import Spinner from "~/components/ui/spinner/Spinner.vue";

const router = useRouter();
const experiencesStore = useExperiencesStore();

// Form data
const formData = reactive<CreateExperienceData>({
  title: "",
  type: "professionnel",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
});

const isCurrentPosition = ref(false);

// Watch for current position checkbox
watch(isCurrentPosition, (value) => {
  if (value) {
    formData.end_date = null;
  }
});

// Handle form submission
const handleSubmit = async () => {
  experiencesStore.clearError();

  try {
    await experiencesStore.createExperience({
      title: formData.title,
      type: formData.type,
      location: formData.location || null,
      start_date: formData.start_date || null,
      end_date: isCurrentPosition.value ? null : (formData.end_date || null),
      description: formData.description || null,
    });

    router.push("/dashboard/experiences");
  } catch (error: any) {
    console.error("Failed to create experience:", error);
  }
};

// Handle cancel
const handleCancel = () => {
  router.push("/dashboard/experiences");
};

// Clear errors on mount
onMounted(() => {
  experiencesStore.clearError();
});
</script>
