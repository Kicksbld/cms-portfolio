<template>
    <div class="w-full min-h-screen grid place-content-center">
      <p class="text-3xl mb-3 text-red-500">Dashboard</p>
      <Button @click="handleLogout">Log Out</Button>
    </div>
  </template>

  <script setup lang="ts">
  const authStore = useAuthStore()

  const handleLogout = async () => {
    try {
      await authStore.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  </script>
