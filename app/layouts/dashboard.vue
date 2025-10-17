<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="w-full">
      <SidebarTrigger />
      <div class="w-full p-6 space-y-8">
        <slot name="header" />
        <slot />
      </div>
    </main>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "~/components/AppSidebar.vue";
</script> 