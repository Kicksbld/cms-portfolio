// middleware/auth.ts
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();
  try {
    const user = await authStore.fetchUser();
    console.log(user);
  } catch (err) {
    console.warn('Utilisateur non connecté' + err);
  }

  if (!authStore.user) {
    return navigateTo('/account/sign-in');
  }

  console.log('Utilisateur connecté');
});
