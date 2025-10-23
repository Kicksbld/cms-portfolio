<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Add New Link"
        description="Add a social media or external link to your profile"
      />
    </template>

    <div class="space-y-6 max-w-2xl">
      <!-- Link Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Link Details</CardTitle>
          <CardDescription>
            Fill in the details for your new link
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
              <p class="text-sm text-muted-foreground">
                The name of the platform or link
              </p>
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
              <p class="text-sm text-muted-foreground">
                The full URL to your profile or page
              </p>
            </div>

            <div class="space-y-2">
              <label
                for="icon"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Icon <span class="text-red-500">*</span>
              </label>
              <Input
                id="icon"
                type="file"
                accept="image/*"
                required
                :disabled="isLoading"
                @change="handleFileChange"
              />
              <p class="text-sm text-muted-foreground">
                Upload an icon or logo for this link
              </p>
            </div>

            <div
              v-if="previewUrl"
              class="relative rounded-lg border overflow-hidden bg-muted w-20 h-20 flex items-center justify-center"
            >
              <img
                :src="previewUrl"
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
          :disabled="isLoading || !formData.title || !formData.url || !formData.icon"
          @click="handleSubmit"
          class="gap-2"
        >
          <Spinner v-if="isLoading" />
          <Save v-else class="h-4 w-4" />
          {{ isLoading ? 'Creating...' : 'Create Link' }}
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
const linksStore = useLinksStore();

const isLoading = computed(() => linksStore.loading);
const previewUrl = ref<string | null>(null);

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

  if (!formData.title || !formData.url || !formData.icon) {
    linksStore.error = 'Please fill in all required fields';
    return;
  }

  try {
    await linksStore.createLink({
      title: formData.title,
      url: formData.url,
      icon: formData.icon,
    });

    router.push('/dashboard/links');
  } catch (error: any) {
    console.error('Failed to create link:', error);
  }
};

const handleCancel = () => {
  router.push('/dashboard/links');
};

onMounted(() => {
  linksStore.clearError();
});
</script>
