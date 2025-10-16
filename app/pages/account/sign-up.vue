<template>
  <div
    class="min-h-screen flex items-center justify-center bg-primary py-12 px-4 sm:px-6 lg:px-8"
  >
    <Card class="max-w-md w-full rounded-3xl">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">Welcome in Canvasly</CardTitle>
        <CardDescription>Please sign up to access the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <Input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              class="w-full h-10"
              placeholder="Full name"
            />

            <div class="relative w-full items-center">
              <Input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="w-full pl-10 h-10"
                placeholder="Email address"
              />
              <span
                class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
              >
                <Mail class="size-5 text-muted-foreground" />
              </span>
            </div>

            <div class="relative w-full items-center">
              <Input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="w-full pl-10 h-10"
                placeholder="Password"
              />
              <span
                class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
              >
                <KeySquare class="size-5 text-muted-foreground" />
              </span>
            </div>

            <Input
              id="confirm-password"
              v-model="form.confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full h-10"
              placeholder="Confirm password"
            />
          </div>

          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>

          <div>
            <Button type="submit" :disabled="loading" class="w-full h-10">
              <User class="w-4 h-4 mr-2" />
              {{ loading ? "Creating account..." : "Create my account" }}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <NuxtLink class="underline mx-auto" to="/account/sign-in">
          Already a member? Log in
        </NuxtLink>
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
