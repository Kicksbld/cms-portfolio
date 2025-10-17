<template>
  <SidebarProvider>
    <AppSidebar />
    <main>
      <SidebarTrigger />
      <slot />
    </main>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "~/components/AppSidebar.vue";
</script> 