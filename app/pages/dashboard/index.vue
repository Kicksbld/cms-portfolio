<template>
    <div class="w-full min-h-screen grid place-content-center">
      <div class="text-center space-y-4">
        <p class="text-3xl mb-3 text-red-500">Dashboard</p>

        <div v-if="authStore.loading" class="text-gray-500">
          Loading user info...
        </div>

        <div v-else-if="userInfo" class="bg-gray-100 p-6 rounded-lg space-y-2">
          <h2 class="text-xl font-semibold mb-4">User Information</h2>
          <p><strong>ID:</strong> {{ userInfo.id }}</p>
          <p><strong>Email:</strong> {{ userInfo.email }}</p>
          <p><strong>Display Name:</strong> {{ userInfo.display_name || 'Not set' }}</p>
        </div>

        <div v-if="authStore.error" class="text-red-500">
          {{ authStore.error }}
        </div>

        <Button @click="handleLogout">Log Out</Button>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  const authStore = useAuthStore()
  const userInfo = ref<{ id: string; email: string; display_name: string | null } | null>(null)

  const loadUserInfo = async () => {
    try {
      const response = await authStore.fetchUser()
      userInfo.value = response.data.user
    } catch (error) {
      console.error('Failed to load user info:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await authStore.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Load user info when component is mounted
  onMounted(() => {
    loadUserInfo()
  })
  </script>
