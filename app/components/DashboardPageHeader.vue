<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        {{ title }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ description }}
      </p>
    </div>
    <slot name="actions">
      <NuxtLink v-if="addLink" :to="addLink">
        <Button class="gap-2">
          <Plus class="h-4 w-4" />
          {{ addButtonText }}
        </Button>
      </NuxtLink>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

defineProps<{
  title: string;
  description: string;
  addButtonText?: string;
  addLink?: string;
}>();
</script>
