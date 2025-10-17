<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Portfolio Overview"
        description="Get a global view of your profile, skills, and projects performance"
      />
    </template>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
</script>
