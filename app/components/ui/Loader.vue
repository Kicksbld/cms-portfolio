<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Spinner />
      </EmptyMedia>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription>
        {{ description }}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>

<script setup lang="ts">
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import Spinner from "@/components/ui/spinner/Spinner.vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "Processing your request",
    description:
      "Please wait while we process your request. Do not refresh the page.",
  }
);
</script>
