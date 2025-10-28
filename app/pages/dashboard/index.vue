<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Portfolio Overview"
        description="Get a global view of your profile, skills, and projects performance"
      />
    </template>

    <!-- Loading State -->
    <Loader
      v-if="isLoading"
      title="Loading dashboard"
      description="Please wait while we fetch your portfolio data."
    />

    <!-- Dashboard Content -->
    <div v-else class="space-y-8">
      <!-- Analytics Section -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Analytics Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Views"
            :value="analytics.totalViews"
            description="Portfolio page views"
            :icon="Eye"
            iconClass="text-blue-600"
            iconBgClass="bg-blue-100"
          />
          <StatsCard
            title="Projects"
            :value="analytics.projectsCount"
            description="Published projects"
            :icon="FolderCode"
            iconClass="text-purple-600"
            iconBgClass="bg-purple-100"
          />
          <StatsCard
            title="Experiences"
            :value="analytics.experiencesCount"
            description="Work experiences"
            :icon="Briefcase"
            iconClass="text-green-600"
            iconBgClass="bg-green-100"
          />
          <StatsCard
            title="Skills"
            :value="analytics.skillsCount"
            description="Technical skills"
            :icon="Lightbulb"
            iconClass="text-orange-600"
            iconBgClass="bg-orange-100"
          />
        </div>
      </section>

      <!-- Quick Actions -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLinkCard
            title="Manage Projects"
            description="Add, edit, or remove your portfolio projects"
            to="/dashboard/projects"
            :icon="FolderCode"
            iconClass="text-purple-600"
            iconBgClass="bg-purple-100"
          />
          <QuickLinkCard
            title="Work Experiences"
            description="Update your professional experience timeline"
            to="/dashboard/experiences"
            :icon="Briefcase"
            iconClass="text-green-600"
            iconBgClass="bg-green-100"
          />
          <QuickLinkCard
            title="Skills & Expertise"
            description="Showcase your technical and professional skills"
            to="/dashboard/skills"
            :icon="Lightbulb"
            iconClass="text-orange-600"
            iconBgClass="bg-orange-100"
          />
          <QuickLinkCard
            title="Social Links"
            description="Manage your social media and contact links"
            to="/dashboard/links"
            :icon="Link2"
            iconClass="text-blue-600"
            iconBgClass="bg-blue-100"
          />
        </div>
      </section>

      <!-- Profile & Settings -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Profile & Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLinkCard
            title="Edit Profile"
            description="Update your personal information and bio"
            to="/dashboard/profile/edit"
            :icon="User"
            iconClass="text-indigo-600"
            iconBgClass="bg-indigo-100"
          />
          <Card class="border-dashed">
            <CardContent class="p-6">
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"
                >
                  <Sparkles class="h-6 w-6 text-muted-foreground" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-base">Need Help?</h3>
                  <p class="text-sm text-muted-foreground mt-0.5">
                    Check out our documentation and guides
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Recent Activity -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent class="p-6">
            <div
              v-if="recentProjects.length === 0"
              class="text-center py-8 text-muted-foreground"
            >
              <FileQuestion class="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p class="text-sm">No recent activity yet</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="project in recentProjects"
                :key="project.id"
                class="flex items-center gap-4 pb-4 last:pb-0 border-b last:border-0"
              >
                <div class="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    v-if="project.thumbnail"
                    :src="project.thumbnail"
                    :alt="project.title"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-sm truncate">
                    {{ project.title }}
                  </h4>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ project.description || "No description" }}
                  </p>
                </div>
                <NuxtLink
                  :to="`/dashboard/projects/${project.id}/edit`"
                  class="flex-shrink-0"
                >
                  <Button variant="ghost" size="sm" class="gap-2">
                    <Pencil class="h-3 w-3" />
                    Edit
                  </Button>
                </NuxtLink>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import {
  Eye,
  FolderCode,
  Briefcase,
  Lightbulb,
  Link2,
  User,
  Sparkles,
  FileQuestion,
  Pencil,
} from "lucide-vue-next";
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
import StatsCard from "@/components/dashboard/StatsCard.vue";
import QuickLinkCard from "@/components/dashboard/QuickLinkCard.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader.vue";
import { useProjectsStore } from "~/stores/projects";
import { useExperiencesStore } from "~/stores/experiences";
import { useAnalyticsStore } from "~/stores/analytics";

const projectsStore = useProjectsStore();
const experiencesStore = useExperiencesStore();
const analyticsStore = useAnalyticsStore();

const isLoading = ref(true);

// Analytics data (now dynamic from the analytics store)
const analytics = computed(() => ({
  totalViews: analyticsStore.formattedTotalViews || "0",
  projectsCount: projectsStore.projects.length,
  experiencesCount: experiencesStore.experiences.length,
  skillsCount: 0, // Will be updated when skills store is loaded
}));

// Recent projects (last 3)
const recentProjects = computed(() => {
  return projectsStore.projects.slice(0, 3);
});

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      projectsStore.fetchProjects(),
      experiencesStore.fetchExperiences(),
      analyticsStore.fetchAnalytics(),
    ]);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>
