<template>
  <NuxtLink :to="to" class="block group">
    <Card class="transition-all hover:shadow-md hover:border-primary/50">
      <CardContent class="p-6">
        <div class="flex items-center gap-4">
          <div
            :class="[
              'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
              iconBgClass || 'bg-primary/10 group-hover:bg-primary/20',
            ]"
          >
            <component
              :is="icon"
              :class="['h-6 w-6', iconClass || 'text-primary']"
            />
          </div>
          <div class="flex-1">
            <h3
              class="font-semibold text-base group-hover:text-primary transition-colors"
            >
              {{ title }}
            </h3>
            <p class="text-sm text-muted-foreground mt-0.5">
              {{ description }}
            </p>
          </div>
          <ChevronRight
            class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
          />
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import type { Component } from "vue";

defineProps<{
  title: string;
  description: string;
  to: string;
  icon: Component;
  iconClass?: string;
  iconBgClass?: string;
}>();
</script>
