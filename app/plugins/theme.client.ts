export default defineNuxtPlugin(() => {
  // Initialize theme as early as possible to prevent flash
  if (import.meta.client) {
    const stored = localStorage.getItem('theme')

    // Only apply dark theme if explicitly stored, otherwise use light (default)
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      // If no stored theme or stored is 'light', ensure localStorage is set to 'light'
      if (!stored || stored !== 'light') {
        localStorage.setItem('theme', 'light')
      }
    }
  }
})
