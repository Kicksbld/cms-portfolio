<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Edit Profile"
        description="Update your personal information"
      />
    </template>

    <div v-if="initialLoading" class="flex items-center justify-center py-12">
      <Spinner class="h-8 w-8" />
    </div>

    <div v-else class="space-y-6 max-w-2xl">
      <!-- Profile Details Card -->
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your display name and personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="flex items-center gap-6 mb-6">
              <Avatar class="h-20 w-20">
                <AvatarImage
                  :src="`https://api.dicebear.com/7.x/initials/svg?seed=${formData.display_name || authStore.userProfile?.email}`"
                />
                <AvatarFallback>
                  {{ getInitials(formData.display_name || authStore.userProfile?.email) }}
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-medium">Profile Picture</p>
                <p class="text-sm text-muted-foreground">
                  Avatar generated from your display name
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label
                for="display_name"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Display Name <span class="text-red-500">*</span>
              </label>
              <Input
                id="display_name"
                v-model="formData.display_name"
                placeholder="Enter your display name"
                required
                :disabled="isLoading"
              />
              <p class="text-sm text-muted-foreground">
                This is the name that will be displayed publicly
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">
                Email Address
              </label>
              <Input
                :value="authStore.userProfile?.email"
                disabled
                class="bg-muted"
              />
              <p class="text-sm text-muted-foreground">
                Email address cannot be changed
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <Button
          type="button"
          :disabled="isLoading || !formData.display_name.trim()"
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
      <div v-if="authStore.error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div class="flex items-center gap-2 text-destructive">
          <AlertCircle class="h-4 w-4" />
          <p class="text-sm font-medium">
            {{ authStore.error }}
          </p>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="showSuccess" class="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
        <div class="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle class="h-4 w-4" />
          <p class="text-sm font-medium">
            Profile updated successfully!
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Save, AlertCircle, CheckCircle } from 'lucide-vue-next';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const initialLoading = ref(true);
const isLoading = computed(() => authStore.loading);
const showSuccess = ref(false);

const formData = reactive({
  display_name: '',
});

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const handleSubmit = async () => {
  authStore.clearError();
  showSuccess.value = false;

  if (!formData.display_name.trim()) {
    authStore.error = 'Display name is required';
    return;
  }

  try {
    await authStore.updateProfile(formData.display_name);
    showSuccess.value = true;

    // Redirect after a short delay
    setTimeout(() => {
      router.push('/dashboard/profile');
    }, 1500);
  } catch (error: any) {
    console.error('Failed to update profile:', error);
  }
};

const handleCancel = () => {
  router.push('/dashboard/profile');
};

onMounted(async () => {
  authStore.clearError();

  try {
    // This will use cached data if available
    await authStore.fetchUser();
    formData.display_name = authStore.userProfile?.display_name || '';
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  } finally {
    initialLoading.value = false;
  }
});
</script>
