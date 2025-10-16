import { defineStore } from 'pinia'
import type { User, SignUpCredentials, SignInCredentials, AuthResponse, AuthError } from '~/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    currentUser: (state): User | null => state.user,
  },

  actions: {
    async signUp(credentials: SignUpCredentials) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<AuthResponse>('/api/auth/signup', {
          method: 'POST',
          body: credentials,
        })

        this.user = response.user
        this.token = response.token

        // Store token in localStorage for persistence
        if (import.meta.client) {
          localStorage.setItem('auth_token', response.token)
        }

        // Redirect to dashboard
        await navigateTo('/dashboard')

        return response
      } catch (error: any) {
        const authError = error.data as AuthError
        this.error = authError?.message || 'An error occurred during sign up'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signIn(credentials: SignInCredentials) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<AuthResponse>('/api/auth/signin', {
          method: 'POST',
          body: credentials,
        })

        this.user = response.user
        this.token = response.token

        // Store token in localStorage for persistence
        if (import.meta.client) {
          localStorage.setItem('auth_token', response.token)
        }

        // Redirect to dashboard
        await navigateTo('/dashboard')

        return response
      } catch (error: any) {
        const authError = error.data as AuthError
        this.error = authError?.message || 'An error occurred during sign in'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      try {
        // Call sign out endpoint if you have one
        // await $fetch('/api/auth/signout', { method: 'POST' })

        // Clear state
        this.user = null
        this.token = null
        this.error = null

        // Clear localStorage
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
        }

        // Redirect to sign in
        await navigateTo('/account/sign-in')
      } catch (error: any) {
        this.error = error.message || 'An error occurred during sign out'
        throw error
      }
    },

    async loadUserFromToken() {
      if (!import.meta.client) return

      const token = localStorage.getItem('auth_token')
      if (!token) return

      this.loading = true

      try {
        // Fetch user data with token
        const response = await $fetch<{ user: User }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        this.user = response.user
        this.token = token
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token')
        this.token = null
        this.user = null
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
