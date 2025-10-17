<template>
  <NuxtLayout name="dashboard">
    <template #header>
      <DashboardPageHeader
        title="Profile Details"
        description="Manage your biography, profile picture, and personal info"
        add-button-text="Edit Profile"
        add-link="/dashboard/profile/edit"
      />
    </template>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import DashboardPageHeader from "@/components/DashboardPageHeader.vue";
</script>
