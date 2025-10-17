<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="My Experiences"
        description="Showcase your past work and professional background"
        add-button-text="Add Experience"
        add-link="/dashboard/experiences/new"
      />
    </template>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
</script>
