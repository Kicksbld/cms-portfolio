<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Social Links"
        description="Manage your social media and external links"
        add-button-text="Add Link"
        add-link="/dashboard/links/new"
      />
    </template>

    <Loader v-if="linksStore.loading && links.length === 0" />

    <Empty v-else-if="!linksStore.loading && links.length === 0">
      <EmptyContent>
        <EmptyMedia>
          <Link2 class="h-10 w-10" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No links yet</EmptyTitle>
          <EmptyDescription>
            Add your first social link to showcase your online presence
          </EmptyDescription>
        </EmptyHeader>
        <Button as-child>
          <NuxtLink to="/dashboard/links/new">
            <Plus class="h-4 w-4 mr-2" />
            Add Your First Link
          </NuxtLink>
        </Button>
      </EmptyContent>
    </Empty>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="link in links"
        :key="link.id"
        class="group relative border rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="p-4 space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
              <img
                v-if="link.icon"
                :src="link.icon"
                :alt="link.title"
                class="w-full h-full object-cover"
              />
              <ExternalLink v-else class="h-6 w-6 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-base line-clamp-1">
                {{ link.title }}
              </h3>
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-muted-foreground hover:text-primary line-clamp-1 inline-flex items-center gap-1"
              >
                {{ link.url }}
                <ExternalLink class="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="absolute top-3 right-3" @click.stop>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="router.push(`/dashboard/links/${link.id}/edit`)">
                <Pencil class="h-4 w-4" />
                Edit Link
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <DropdownMenuItem
                    class="text-red-600 focus:text-red-600"
                    @select.prevent
                  >
                    <Trash2 class="h-4 w-4" />
                    Delete Link
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the link
                      "{{ link.title }}" from your profile.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      class="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      @click="handleDeleteLink(link.id)"
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Link2,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import Loader from '@/components/ui/Loader.vue';
import DashboardPageHeader from '@/components/DashboardPageHeader.vue';
import { useLinksStore } from '~/stores/links';

const router = useRouter();
const linksStore = useLinksStore();

onMounted(async () => {
  try {
    await linksStore.fetchLinks();
  } catch (error) {
    console.error('Failed to fetch links:', error);
  }
});

const links = computed(() => linksStore.links);

const handleDeleteLink = async (linkId: number) => {
  try {
    await linksStore.deleteLink(linkId);
  } catch (error) {
    console.error('Failed to delete link:', error);
  }
};
</script>
