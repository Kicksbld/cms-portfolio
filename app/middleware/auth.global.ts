/**
 * Global authentication middleware for dashboard routes
 * Redirects unauthenticated users to sign-in page
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect dashboard routes
  if (!to.path.startsWith('/dashboard')) {
    return;
  }

  const authStore = useAuthStore();

  // Try to fetch user if not already loaded
  if (!authStore.userProfile) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      console.warn('Failed to fetch user:', error);
      // Redirect to sign-in if user fetch fails
      return navigateTo('/account/sign-in');
    }
  }

  // Check if user is authenticated
  if (!authStore.userProfile) {
    return navigateTo('/account/sign-in');
  }
});
