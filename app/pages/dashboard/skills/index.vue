<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="My Skills"
        description="Add and manage the skills that define your expertise"
        add-button-text="Add Skill"
        add-link="/dashboard/skills/new"
      />
    </template>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
</script>
