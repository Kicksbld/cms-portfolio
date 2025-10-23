<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="My Portfolio Projects"
        description="Manage and showcase your creative work"
        add-button-text="Add Project"
        add-link="/dashboard/projects/new"
      />
    </template>

    <Loader
      v-if="projectsStore.loading"
      title="Loading projects"
      description="Please wait while we fetch your projects. This will only take a moment."
    />

    <Empty v-else-if="!projectsStore.hasProjects">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCode />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven't created any projects yet. Get started by creating your
          first project to showcase your work.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div class="flex gap-2">
          <NuxtLink to="/dashboard/projects/new">
            <Button class="gap-2">
              <Plus class="h-4 w-4" />
              Create Project
            </Button>
          </NuxtLink>
        </div>
      </EmptyContent>
    </Empty>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50"
      >
        <div class="relative h-48 overflow-hidden bg-muted cursor-pointer">
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

          <div class="absolute top-3 right-3" @click.stop>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background"
                >
                  <MoreVertical class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="router.push(`/dashboard/projects/${project.id}/edit`)">
                  <Pencil class="h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <DropdownMenuItem
                      class="text-red-600 focus:text-red-600"
                      @select.prevent
                    >
                      <Trash2 class="h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        project "{{ project.title }}" and remove all associated data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        class="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        @click="handleDeleteProject(project.id)"
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

        <div class="p-4 cursor-pointer space-y-2">
          <h3
            class="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors"
          >
            {{ project.title }}
          </h3>
          <p class="text-sm text-muted-foreground line-clamp-2">
            {{ project.description }}
          </p>

          <!-- Categories badges -->
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
  FolderCode,
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
import { useProjectsStore } from "~/stores/projects";

const router = useRouter();
const projectsStore = useProjectsStore();

onMounted(async () => {
  try {
    await projectsStore.fetchProjects();
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }
});

const projects = computed(() => projectsStore.allProjects);

const handleDeleteProject = async (projectId: number) => {
  try {
    await projectsStore.deleteProject(projectId);
  } catch (error) {
    console.error("Failed to delete project:", error);
  }
};
</script>
