<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
  >
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-3xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription class="text-base">
          Sign up to get started with Canvasly
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="name" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Full name
              </label>
              <div class="relative">
                <Input
                  id="name"
                  v-model="form.name"
                  name="name"
                  type="text"
                  required
                  class="pl-10"
                  placeholder="John Doe"
                />
                <span
                  class="absolute left-0 inset-y-0 flex items-center justify-center px-3 pointer-events-none"
                >
                  <User class="size-4 text-muted-foreground" />
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div class="relative">
                <Input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="pl-10"
                  placeholder="name@example.com"
                />
                <span
                  class="absolute left-0 inset-y-0 flex items-center justify-center px-3 pointer-events-none"
                >
                  <Mail class="size-4 text-muted-foreground" />
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="form.password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="pl-10"
                  placeholder="Create a password"
                />
                <span
                  class="absolute left-0 inset-y-0 flex items-center justify-center px-3 pointer-events-none"
                >
                  <KeySquare class="size-4 text-muted-foreground" />
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <label for="confirm-password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirm password
              </label>
              <div class="relative">
                <Input
                  id="confirm-password"
                  v-model="form.confirmPassword"
                  name="confirm-password"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="pl-10"
                  placeholder="Confirm your password"
                />
                <span
                  class="absolute left-0 inset-y-0 flex items-center justify-center px-3 pointer-events-none"
                >
                  <KeySquare class="size-4 text-muted-foreground" />
                </span>
              </div>
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {{ error }}
          </div>

          <Button type="submit" :disabled="loading" class="w-full">
            <User v-if="!loading" class="w-4 h-4 mr-2" />
            {{ loading ? "Creating account..." : "Create account" }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-4">
        <div class="text-sm text-center text-muted-foreground">
          Already have an account?
          <NuxtLink class="font-medium underline underline-offset-4 hover:text-primary transition-colors" to="/account/sign-in">
            Sign in
          </NuxtLink>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { User } from "lucide-vue-next";
import { Mail } from "lucide-vue-next";
import { KeySquare } from "lucide-vue-next";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

const handleSubmit = async () => {
  authStore.clearError();

  if (form.value.password !== form.value.confirmPassword) {
    authStore.error = "Passwords do not match";
    return;
  }

  if (form.value.password.length < 8) {
    authStore.error = "Password must be at least 8 characters long";
    return;
  }

  try {
    await authStore.signUp({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });
  } catch (e) {
    console.error("Sign up failed:", e);
  }
};
</script>
