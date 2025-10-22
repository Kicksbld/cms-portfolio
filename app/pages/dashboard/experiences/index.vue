<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="My Experiences"
        description="Showcase your past work and professional background"
        add-button-text="Add Experience"
        add-link="/dashboard/experiences/new"
      />
    </template>

    <Loader
      v-if="experiencesStore.loading"
      title="Loading experiences"
      description="Please wait while we fetch your experiences. This will only take a moment."
    />

    <Empty v-else-if="!experiencesStore.hasExperiences">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase />
        </EmptyMedia>
        <EmptyTitle>No Experiences Yet</EmptyTitle>
        <EmptyDescription>
          You haven't added any experiences yet. Get started by adding your
          first professional or educational experience.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div class="flex gap-2">
          <NuxtLink to="/dashboard/experiences/new">
            <Button class="gap-2">
              <Plus class="h-4 w-4" />
              Add Experience
            </Button>
          </NuxtLink>
        </div>
      </EmptyContent>
    </Empty>

    <div v-else class="space-y-6">
      <!-- Professional Experiences Section -->
      <div v-if="professionalExperiences.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <Briefcase class="h-5 w-5 text-primary" />
          <h2 class="text-xl font-semibold">Professional Experience</h2>
          <span class="text-sm text-muted-foreground">({{ professionalExperiences.length }})</span>
        </div>
        <div class="space-y-4">
          <div
            v-for="experience in professionalExperiences"
            :key="experience.id"
            class="group relative border rounded-lg p-6 bg-card transition-all hover:shadow-md hover:border-primary/50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase class="h-6 w-6 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-lg group-hover:text-primary transition-colors">
                      {{ experience.title }}
                    </h3>
                    <p v-if="experience.location" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin class="h-3 w-3" />
                      {{ experience.location }}
                    </p>
                    <div v-if="experience.start_date || experience.end_date" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDateRange(experience.start_date, experience.end_date) }}
                    </div>
                  </div>
                </div>
                <p v-if="experience.description" class="text-sm text-muted-foreground mt-4 line-clamp-3">
                  {{ experience.description }}
                </p>
              </div>

              <div class="ml-4" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                    >
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil class="h-4 w-4" />
                      Edit Experience
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger as-child>
                        <DropdownMenuItem
                          class="text-red-600 focus:text-red-600"
                          @select.prevent
                        >
                          <Trash2 class="h-4 w-4" />
                          Delete Experience
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            experience "{{ experience.title }}" and remove all associated data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            class="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            @click="handleDeleteExperience(experience.id)"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Education Experiences Section -->
      <div v-if="scholaireExperiences.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <GraduationCap class="h-5 w-5 text-primary" />
          <h2 class="text-xl font-semibold">Education</h2>
          <span class="text-sm text-muted-foreground">({{ scholaireExperiences.length }})</span>
        </div>
        <div class="space-y-4">
          <div
            v-for="experience in scholaireExperiences"
            :key="experience.id"
            class="group relative border rounded-lg p-6 bg-card transition-all hover:shadow-md hover:border-primary/50"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap class="h-6 w-6 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-lg group-hover:text-primary transition-colors">
                      {{ experience.title }}
                    </h3>
                    <p v-if="experience.location" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin class="h-3 w-3" />
                      {{ experience.location }}
                    </p>
                    <div v-if="experience.start_date || experience.end_date" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDateRange(experience.start_date, experience.end_date) }}
                    </div>
                  </div>
                </div>
                <p v-if="experience.description" class="text-sm text-muted-foreground mt-4 line-clamp-3">
                  {{ experience.description }}
                </p>
              </div>

              <div class="ml-4" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                    >
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil class="h-4 w-4" />
                      Edit Experience
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger as-child>
                        <DropdownMenuItem
                          class="text-red-600 focus:text-red-600"
                          @select.prevent
                        >
                          <Trash2 class="h-4 w-4" />
                          Delete Experience
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            experience "{{ experience.title }}" and remove all associated data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            class="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            @click="handleDeleteExperience(experience.id)"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Loader from "@/components/ui/Loader.vue";
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
import { useExperiencesStore } from "~/stores/experiences";

const experiencesStore = useExperiencesStore();

onMounted(async () => {
  try {
    await experiencesStore.fetchExperiences();
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
  }
});

const professionalExperiences = computed(() => experiencesStore.professionnelExperiences);
const scholaireExperiences = computed(() => experiencesStore.scholaireExperiences);

const handleDeleteExperience = async (experienceId: number) => {
  try {
    await experiencesStore.deleteExperience(experienceId);
  } catch (error) {
    console.error("Failed to delete experience:", error);
  }
};

const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate && !endDate) return "";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Present";

  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end && end !== "Present") return end;

  return "";
};
</script>
