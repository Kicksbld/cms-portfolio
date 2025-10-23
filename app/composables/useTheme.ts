export type Theme = 'light' | 'dark'

export const useTheme = () => {
  // Initialize from localStorage or default to 'light'
  const theme = useState<Theme>('theme', () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('theme') as Theme | null
      return stored || 'light'
    }
    return 'light'
  })

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme

    if (import.meta.client) {
      const root = document.documentElement

      if (newTheme === 'dark') {
        // Add dark class for dark theme
        root.classList.add('dark')
      } else {
        // Remove dark class for light theme (light is default)
        root.classList.remove('dark')
      }

      // Store in localStorage
      localStorage.setItem('theme', newTheme)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return {
    theme: computed(() => theme.value),
    setTheme,
    toggleTheme,
  }
}
