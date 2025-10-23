<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Edit Link"
        description="Update your social media or external link"
      />
    </template>

    <div v-if="initialLoading" class="flex items-center justify-center py-12">
      <Spinner class="h-8 w-8" />
    </div>

    <div v-else-if="!link" class="text-center py-12">
      <p class="text-muted-foreground">Link not found</p>
    </div>

    <div v-else class="space-y-6 max-w-2xl">
      <!-- Link Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Link Details</CardTitle>
          <CardDescription>
            Update the details for your link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
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
                placeholder="e.g., GitHub, LinkedIn, Twitter"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="space-y-2">
              <label
                for="url"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                URL <span class="text-red-500">*</span>
              </label>
              <Input
                id="url"
                v-model="formData.url"
                type="url"
                placeholder="https://example.com/yourprofile"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="space-y-2">
              <label
                for="icon"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Icon
              </label>
              <Input
                id="icon"
                type="file"
                accept="image/*"
                :disabled="isLoading"
                @change="handleFileChange"
              />
              <p class="text-sm text-muted-foreground">
                Upload a new icon to replace the current one
              </p>
            </div>

            <div
              v-if="previewUrl || link.icon"
              class="relative rounded-lg border overflow-hidden bg-muted w-20 h-20 flex items-center justify-center"
            >
              <img
                :src="previewUrl || link.icon"
                alt="Icon preview"
                class="w-full h-full object-cover"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <Button
          type="button"
          :disabled="isLoading || !formData.title || !formData.url"
          @click="handleSubmit"
          class="gap-2"
        >
          <Spinner v-if="isLoading" />
          <Save v-else class="h-4 w-4" />
          {{ isLoading ? 'Saving...' : 'Save Changes' }}
        </Button>
        <Button
          type="button"
          variant="outline"
          :disabled="isLoading"
          @click="handleCancel"
        >
          Cancel
        </Button>
      </div>

      <!-- Error Display -->
      <div v-if="linksStore.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div class="flex items-center gap-2 text-destructive">
          <AlertCircle class="h-4 w-4" />
          <p class="text-sm font-medium">
            {{ linksStore.error }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Save, AlertCircle } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DashboardPageHeader from '@/components/DashboardPageHeader.vue';
import Spinner from '~/components/ui/spinner/Spinner.vue';
import { useLinksStore } from '~/stores/links';

const router = useRouter();
const route = useRoute();
const linksStore = useLinksStore();

const linkId = computed(() => parseInt(route.params.id as string));
const initialLoading = ref(true);
const isLoading = computed(() => linksStore.loading);
const previewUrl = ref<string | null>(null);

const link = ref<any>(null);

const formData = reactive<{
  title: string;
  url: string;
  icon: File | null;
}>({
  title: '',
  url: '',
  icon: null,
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    formData.icon = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    formData.icon = null;
    previewUrl.value = null;
  }
};

const handleSubmit = async () => {
  linksStore.clearError();

  if (!formData.title || !formData.url) {
    linksStore.error = 'Please fill in all required fields';
    return;
  }

  try {
    await linksStore.updateLink(linkId.value, {
      title: formData.title,
      url: formData.url,
      icon: formData.icon || undefined,
    });

    router.push('/dashboard/links');
  } catch (error: any) {
    console.error('Failed to update link:', error);
  }
};

const handleCancel = () => {
  router.push('/dashboard/links');
};

onMounted(async () => {
  linksStore.clearError();

  try {
    // Fetch all links if not already loaded
    if (linksStore.links.length === 0) {
      await linksStore.fetchLinks();
    }

    // Find the specific link
    link.value = linksStore.getLinkById(linkId.value);

    if (link.value) {
      formData.title = link.value.title;
      formData.url = link.value.url;
    }
  } catch (error) {
    console.error('Failed to fetch link:', error);
  } finally {
    initialLoading.value = false;
  }
});
</script>
