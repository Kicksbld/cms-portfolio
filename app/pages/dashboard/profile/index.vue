<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <div class="flex items-center justify-between">
        <DashboardPageHeader
          title="Profile"
          description="Manage your personal information and social links"
        />
        <Button
          v-if="authStore.userProfile"
          as-child
          variant="outline"
        >
          <NuxtLink :to="`/portfolio/${authStore.userProfile.id}`" target="_blank">
            <ExternalLink class="h-4 w-4 mr-2" />
            View Public Portfolio
          </NuxtLink>
        </Button>
      </div>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Spinner class="h-8 w-8" />
    </div>

    <div v-else class="space-y-6">
      <!-- Profile Information Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your personal details and account information
              </CardDescription>
            </div>
            <Button as-child variant="outline" size="sm">
              <NuxtLink to="/dashboard/profile/edit">
                <Pencil class="h-4 w-4 mr-2" />
                Edit Profile
              </NuxtLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-6">
            <Avatar class="h-20 w-20">
              <AvatarImage
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${authStore.userProfile?.display_name || authStore.userProfile?.email}`"
              />
              <AvatarFallback>
                {{ getInitials(authStore.userProfile?.display_name || authStore.userProfile?.email) }}
              </AvatarFallback>
            </Avatar>

            <div class="flex-1 space-y-3">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Display Name</p>
                <p class="text-lg font-semibold">
                  {{ authStore.userProfile?.display_name || 'Not set' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Email</p>
                <p class="text-base">{{ authStore.userProfile?.email }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Social Links Card -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Manage your social media and external links
              </CardDescription>
            </div>
            <Button as-child size="sm">
              <NuxtLink to="/dashboard/links">
                <Plus class="h-4 w-4 mr-2" />
                Manage Links
              </NuxtLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="links.length === 0" class="text-center py-8">
            <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Link2 class="h-6 w-6 text-muted-foreground" />
            </div>
            <p class="text-sm text-muted-foreground mb-4">
              No links added yet. Add links to showcase your online presence.
            </p>
            <Button as-child variant="outline" size="sm">
              <NuxtLink to="/dashboard/links">
                <Plus class="h-4 w-4 mr-2" />
                Add Your First Link
              </NuxtLink>
            </Button>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              v-for="link in links"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                <img
                  v-if="link.icon"
                  :src="link.icon"
                  :alt="link.title"
                  class="w-full h-full object-cover"
                />
                <ExternalLink v-else class="h-5 w-5 text-muted-foreground" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm group-hover:text-primary transition-colors">
                  {{ link.title }}
                </p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ link.url }}
                </p>
              </div>
              <ExternalLink class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Pencil, Plus, ExternalLink, Link2 } from 'lucide-vue-next';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DashboardPageHeader from '@/components/DashboardPageHeader.vue';
import Spinner from '~/components/ui/spinner/Spinner.vue';
import { useAuthStore } from '~/stores/auth';
import { useLinksStore } from '~/stores/links';

const authStore = useAuthStore();
const linksStore = useLinksStore();

const loading = ref(true);
const links = computed(() => linksStore.links);

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

onMounted(async () => {
  try {
    // Fetch user info (uses cache if available)
    await authStore.fetchUser();

    // Fetch links
    await linksStore.fetchLinks();
  } catch (error) {
    console.error('Failed to load profile data:', error);
  } finally {
    loading.value = false;
  }
});
</script>
