// middleware/auth.ts
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();
  try {
    await authStore.fetchUser(); // fetchUser met this.user à jour
  } catch (err) {
    console.warn('Utilisateur non connecté' + err);
  }

  if (!authStore.user) {
    return navigateTo('/account/sign-in');
  }

  console.log('Utilisateur connecté :', authStore.user.email);
});
