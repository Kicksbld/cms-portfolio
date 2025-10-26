<template>
  <div class="min-h-screen bg-background">
    <!-- Header with User Info and Edit Button -->
    <header class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User class="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">{{ profile?.display_name || 'Portfolio' }}</h1>
              <p class="text-sm text-muted-foreground">{{ profile?.email }}</p>
            </div>
          </div>

          <!-- Edit Portfolio Button (visible only for own portfolio) -->
          <div class="flex gap-2">
            <Button
              v-if="isOwnPortfolio"
              variant="outline"
              @click="navigateTo('/dashboard')"
            >
              <Settings class="h-4 w-4 mr-2" />
              Edit Portfolio
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-12 space-y-16">
      <!-- Projects Section -->
      <section id="projects">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold flex items-center gap-2">
              <FolderCode class="h-8 w-8 text-primary" />
              Projects
            </h2>
            <p class="text-muted-foreground mt-1">Showcasing my creative work</p>
          </div>
        </div>

        <Loader
          v-if="projectsLoading"
          title="Loading projects"
          description="Please wait while we fetch the projects."
        />

        <Empty v-else-if="!projects || projects.length === 0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderCode />
            </EmptyMedia>
            <EmptyTitle>No Projects Yet</EmptyTitle>
            <EmptyDescription>
              No projects have been added to this portfolio yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="project in projects"
              :key="project.id"
              :to="`/portfolio/${userId}/project/${project.id}`"
              class="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div class="relative h-48 overflow-hidden bg-muted">
                <img
                  v-if="project.thumbnail"
                  :src="project.thumbnail"
                  :alt="project.title"
                  class="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div
                  v-else
                  class="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5"
                />
                <div
                  class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"
                />
              </div>

              <div class="p-4 space-y-2">
                <h3
                  class="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors"
                >
                  {{ project.title }}
                </h3>
                <p class="text-sm text-muted-foreground line-clamp-2">
                  {{ project.description }}
                </p>

                <!-- Categories -->
                <div
                  v-if="project.categories && project.categories.length > 0"
                  class="flex flex-wrap gap-1.5 pt-1"
                >
                  <span
                    v-for="category in project.categories"
                    :key="category.id"
                    class="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                  >
                    {{ category.name }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Pagination -->
          <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center mt-8">
            <Pagination
              :total="pagination.total"
              :sibling-count="1"
              :default-page="pagination.page"
              :items-per-page="pagination.perPage"
              @update:page="handlePageChange"
            >
              <PaginationContent>
                <PaginationFirst />
                <PaginationPrevious />
                <PaginationItem
                  v-for="page in pagination.totalPages"
                  :key="page"
                  :value="page"
                />
                <PaginationNext />
                <PaginationLast />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section id="skills">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold flex items-center gap-2">
              <Grid3x3 class="h-8 w-8 text-primary" />
              Skills & Interests
            </h2>
            <p class="text-muted-foreground mt-1">My areas of expertise</p>
          </div>
        </div>

        <Loader
          v-if="skillsLoading"
          title="Loading skills"
          description="Please wait while we fetch the skills."
        />

        <Empty v-else-if="!skills || skills.length === 0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Grid3x3 />
            </EmptyMedia>
            <EmptyTitle>No Skills Yet</EmptyTitle>
            <EmptyDescription>
              No skills have been added to this portfolio yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="skill in skills"
            :key="skill.id"
            class="overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
          >
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Sparkles class="h-5 w-5 text-primary" />
                {{ skill.title }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in skill.items"
                  :key="item.id"
                  class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {{ item.contentText }}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Experiences Section -->
      <section id="experiences">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold flex items-center gap-2">
              <Briefcase class="h-8 w-8 text-primary" />
              Experience
            </h2>
            <p class="text-muted-foreground mt-1">My professional journey</p>
          </div>
        </div>

        <Loader
          v-if="experiencesLoading"
          title="Loading experiences"
          description="Please wait while we fetch the experiences."
        />

        <Empty v-else-if="!experiences || experiences.length === 0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase />
            </EmptyMedia>
            <EmptyTitle>No Experiences Yet</EmptyTitle>
            <EmptyDescription>
              No experiences have been added to this portfolio yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>

        <div v-else class="space-y-6">
          <!-- Professional Experiences -->
          <div v-if="professionalExperiences.length > 0">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <Briefcase class="h-5 w-5 text-primary" />
              Professional Experience
            </h3>
            <div class="space-y-4">
              <div
                v-for="experience in professionalExperiences"
                :key="experience.id"
                class="border rounded-lg p-6 bg-card transition-all hover:shadow-md hover:border-primary/50"
              >
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase class="h-6 w-6 text-primary" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-lg">{{ experience.title }}</h4>
                    <p v-if="experience.location" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin class="h-3 w-3" />
                      {{ experience.location }}
                    </p>
                    <div v-if="experience.start_date || experience.end_date" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDateRange(experience.start_date, experience.end_date) }}
                    </div>
                    <p v-if="experience.description" class="text-sm text-muted-foreground mt-3">
                      {{ experience.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Educational Experiences -->
          <div v-if="educationalExperiences.length > 0">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <GraduationCap class="h-5 w-5 text-primary" />
              Education
            </h3>
            <div class="space-y-4">
              <div
                v-for="experience in educationalExperiences"
                :key="experience.id"
                class="border rounded-lg p-6 bg-card transition-all hover:shadow-md hover:border-primary/50"
              >
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap class="h-6 w-6 text-primary" />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-lg">{{ experience.title }}</h4>
                    <p v-if="experience.location" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin class="h-3 w-3" />
                      {{ experience.location }}
                    </p>
                    <div v-if="experience.start_date || experience.end_date" class="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar class="h-3 w-3" />
                      {{ formatDateRange(experience.start_date, experience.end_date) }}
                    </div>
                    <p v-if="experience.description" class="text-sm text-muted-foreground mt-3">
                      {{ experience.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Links Section -->
      <section id="links">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold flex items-center gap-2">
              <Link2 class="h-8 w-8 text-primary" />
              Connect
            </h2>
            <p class="text-muted-foreground mt-1">Find me on these platforms</p>
          </div>
        </div>

        <Loader
          v-if="linksLoading"
          title="Loading links"
          description="Please wait while we fetch the links."
        />

        <Empty v-else-if="!links || links.length === 0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Link2 />
            </EmptyMedia>
            <EmptyTitle>No Links Yet</EmptyTitle>
            <EmptyDescription>
              No social links have been added to this portfolio yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <a
            v-for="link in links"
            :key="link.id"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group border rounded-lg p-4 bg-card transition-all hover:shadow-lg hover:border-primary/50 hover:bg-primary/5"
          >
            <div class="flex flex-col items-center gap-3 text-center">
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img
                  v-if="link.icon"
                  :src="link.icon"
                  :alt="link.title"
                  class="w-full h-full object-cover"
                />
                <ExternalLink v-else class="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 class="font-semibold text-sm group-hover:text-primary transition-colors">
                  {{ link.title }}
                </h4>
              </div>
            </div>
          </a>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t bg-card/50 mt-16">
      <div class="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Built with Canvasly Portfolio CMS</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  User,
  Settings,
  FolderCode,
  Grid3x3,
  Briefcase,
  GraduationCap,
  Link2,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Loader from "@/components/ui/Loader.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const authStore = useAuthStore();
const userId = route.params.userId as string;

// State
const profile = ref<any>(null);
const projects = ref<any[]>([]);
const pagination = ref<any>(null);
const skills = ref<any[]>([]);
const experiences = ref<any[]>([]);
const links = ref<any[]>([]);

const projectsLoading = ref(true);
const skillsLoading = ref(true);
const experiencesLoading = ref(true);
const linksLoading = ref(true);

const currentPage = ref(1);

// Check if viewing own portfolio
const isOwnPortfolio = computed(() => {
  return authStore.userProfile?.id === userId;
});

// Filter experiences by type
const professionalExperiences = computed(() => {
  return experiences.value.filter(exp => exp.type === 'professionnel');
});

const educationalExperiences = computed(() => {
  return experiences.value.filter(exp => exp.type === 'scholaire');
});

// Format date range
const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate && !endDate) return '';

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (startDate && !endDate) {
    return `${formatDate(startDate)} - Present`;
  }
  if (!startDate && endDate) {
    return formatDate(endDate);
  }
  return `${formatDate(startDate!)} - ${formatDate(endDate!)}`;
};

// Fetch data
const fetchProfile = async () => {
  try {
    const { data } = await $fetch(`/api/public/portfolio/${userId}`);
    profile.value = data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};

const fetchProjects = async (page: number = 1) => {
  projectsLoading.value = true;
  try {
    const response = await $fetch(`/api/public/portfolio/${userId}/projects?page=${page}`);
    projects.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  } finally {
    projectsLoading.value = false;
  }
};

const fetchSkills = async () => {
  skillsLoading.value = true;
  try {
    const { data } = await $fetch(`/api/public/portfolio/${userId}/skills`);
    skills.value = data;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
  } finally {
    skillsLoading.value = false;
  }
};

const fetchExperiences = async () => {
  experiencesLoading.value = true;
  try {
    const { data } = await $fetch(`/api/public/portfolio/${userId}/experiences`);
    experiences.value = data;
  } catch (error) {
    console.error('Failed to fetch experiences:', error);
  } finally {
    experiencesLoading.value = false;
  }
};

const fetchLinks = async () => {
  linksLoading.value = true;
  try {
    const { data } = await $fetch(`/api/public/portfolio/${userId}/links`);
    links.value = data;
  } catch (error) {
    console.error('Failed to fetch links:', error);
  } finally {
    linksLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchProjects(page);
  // Scroll to projects section
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
};

// Fetch all data on mount
onMounted(async () => {
  await Promise.all([
    fetchProfile(),
    fetchProjects(1),
    fetchSkills(),
    fetchExperiences(),
    fetchLinks(),
  ]);
});
</script>
