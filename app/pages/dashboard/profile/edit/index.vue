<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Profile Edit"
        description="Edit your links and personal info"
        add-button-text="Save Changes"
        add-link="/dashboard/profile/edit"
      />
    </template>

    <div class="p-8 space-y-8">
      <div>
        <h2 class="text-2xl font-semibold mb-4">Modifier mes liens</h2>

        <div
          v-if="linksStore.loading"
          class="text-center text-muted-foreground"
        >
          Chargement des liens...
        </div>

        <div v-else class="space-y-6">
          <form
            v-for="link in editableLinks"
            :key="link.id"
            @submit.prevent="updateLink(link)"
            class="border p-4 rounded-xl shadow-sm space-y-4 bg-background"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-1 block">Titre</label>
                <Input v-model="link.title" placeholder="Titre du lien" />
              </div>

              <div>
                <label class="text-sm font-medium mb-1 block">URL</label>
                <Input v-model="link.url" placeholder="https://..." />
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">Icône</label>
              <Input
                type="file"
                accept="image/*"
                @change="handleFileUpload($event, link)"
              />
              <div v-if="link.preview" class="mt-2">
                <img
                  :src="link.preview"
                  alt="Aperçu"
                  class="w-10 h-10 object-cover rounded"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <Button type="submit" :disabled="linksStore.loading">
                {{ linksStore.loading ? 'Sauvegarde...' : 'Sauvegarder' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLinksStore } from '~/stores/links';
import DashboardPageHeader from '@/components/DashboardPageHeader.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Link } from '~/types/links';

const linksStore = useLinksStore();

// liens éditables locaux (on clone ceux du store)
const editableLinks = ref<Link[]>([]);

const loadLinks = async () => {
  try {
    const links = await linksStore.fetchLinks();
    editableLinks.value = links.map((l) => ({
      ...l,
      preview: l.icon ? l.icon : null,
      newIcon: null,
    }));
  } catch (err) {
    console.log(err)
  }
};

const handleFileUpload = (event: Event, link: any) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    link.newIcon = file;
    link.preview = URL.createObjectURL(file);
  }
};

const updateLink = async (link: any) => {
  try {
    await linksStore.updateLink(link.id, {
      title: link.title,
      url: link.url,
      icon: link.newIcon || link.icon,
    });

    toast({
      title: 'Lien mis à jour',
      description: `Le lien "${link.title}" a été modifié avec succès.`,
    });
  } catch (err) {
    toast({
      title: 'Erreur',
      description: 'Impossible de mettre à jour ce lien.',
      variant: 'destructive',
    });
  }
};

onMounted(() => {
  loadLinks();
});
</script>

<style scoped>
/* optionnel : pour un rendu un peu plus "dashboard" */
form {
  transition: background-color 0.2s ease;
}
form:hover {
  background-color: hsl(var(--accent) / 0.05);
}
</style>
