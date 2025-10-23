<template>
  <Card>
    <CardContent class="p-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-muted-foreground">
            {{ title }}
          </p>
          <div class="flex items-baseline gap-2 mt-2">
            <h3 class="text-3xl font-bold tracking-tight">
              {{ value }}
            </h3>
            <span
              v-if="change"
              :class="[
                'text-xs font-medium',
                changeType === 'positive'
                  ? 'text-green-600'
                  : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-muted-foreground',
              ]"
            >
              {{ change }}
            </span>
          </div>
          <p v-if="description" class="text-xs text-muted-foreground mt-1">
            {{ description }}
          </p>
        </div>
        <div
          :class="[
            'flex h-12 w-12 items-center justify-center rounded-lg',
            iconBgClass || 'bg-primary/10',
          ]"
        >
          <component
            :is="icon"
            :class="['h-6 w-6', iconClass || 'text-primary']"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import type { Component } from "vue";

defineProps<{
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: Component;
  iconClass?: string;
  iconBgClass?: string;
}>();
</script>
