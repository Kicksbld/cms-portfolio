<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Profile Details"
        description="Manage your biography, profile picture, and personal info"
        add-button-text="Edit Profile"
        add-link="/dashboard/profile/edit"
      />

      <div class="p-8 space-y-8 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- === Profil Section === -->
          <Card class="p-6 flex flex-col items-center text-center shadow-sm">
            <Avatar class="h-24 w-24 mb-4">
              <AvatarImage
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${userInfo?.display_name}`"
              />
              <AvatarFallback>{{
                getInitials(userInfo?.display_name)
              }}</AvatarFallback>
            </Avatar>

            <h2 class="text-lg font-semibold">
              {{ userInfo?.display_name || 'Nom non renseigné' }}
            </h2>
            <p class="text-muted-foreground mb-4">{{ userInfo?.email }}</p>

            <Separator class="my-4" />

            <Button as-child variant="outline" class="mt-2">
              <NuxtLink to="/dashboard/profile/edit">
                ✏️ Modifier le profil
              </NuxtLink>
            </Button>
          </Card>

          <!-- === Links Section === -->
          <Card class="p-6 shadow-sm">
            <h3 class="text-lg font-semibold flex gap-2"><Link /> Mes liens</h3>

            <ul v-if="linksInfo.length" class="space-y-3">
              <li
                v-for="link in linksInfo"
                :key="link.id"
                class="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition"
              >
                <img
                  :src="link.icon"
                  :alt="link.title"
                  class="w-6 h-6 rounded"
                />
                <div class="flex-1">
                  <a
                    :href="link.url"
                    target="_blank"
                    class="font-medium text-primary hover:underline"
                  >
                    {{ link.title }}
                  </a>
                  <p class="text-sm text-muted-foreground truncate">
                    {{ link.url }}
                  </p>
                </div>
              </li>
            </ul>

            <div v-else class="text-muted-foreground text-center py-4">
              Aucun lien trouvé... 💤
            </div>
          </Card>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import DashboardPageHeader from '@/components/DashboardPageHeader.vue';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useLinksStore } from '~/stores/links';
import type { Link as LinkType } from '~/types/links';
import { Link } from 'lucide-vue-next';

// shadcn components
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const authStore = useAuthStore();
const linksStore = useLinksStore();

const userInfo = ref<{
  id: string;
  email: string;
  display_name: string | null;
} | null>(null);

const linksInfo = ref<LinkType[]>([]);

const loadUserInfo = async () => {
  try {
    const response = await authStore.fetchUser();
    userInfo.value = response.data.user;
  } catch (error) {
    console.error('❌ Failed to load user info:', error);
  }
};

const loadLinksUser = async () => {
  try {
    const response = await linksStore.fetchLinks();
    if (userInfo.value) {
      linksInfo.value = response;
    }
  } catch (error) {
    console.error('❌ Failed to load links:', error);
  }
};

onMounted(async () => {
  await loadUserInfo();
  await loadLinksUser();
});
</script>
