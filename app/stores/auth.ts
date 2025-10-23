import { defineStore } from 'pinia'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { SignUpCredentials, SignInCredentials } from '~/types/auth'

interface AuthState {
  user: SupabaseUser | null
  session: Session | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.session && !!state.user,
    currentUser: (state): SupabaseUser | null => state.user,
  },

  actions: {
    async signUp(credentials: SignUpCredentials) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: { user: SupabaseUser; session: Session } }>('/api/auth/register', {
          method: 'POST',
          body: {
            email: credentials.email,
            name: credentials.name,
            password: credentials.password,
          },
        })

        this.user = response.data.user
        this.session = response.data.session

        await navigateTo('/dashboard')

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred during sign up'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signIn(credentials: SignInCredentials) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: { user: SupabaseUser; session: Session } }>('/api/auth/login', {
          method: 'POST',
          body: {
            email: credentials.email,
            password: credentials.password,
          },
        })

        this.user = response.data.user
        this.session = response.data.session

        await navigateTo('/dashboard')

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred during sign in'
        throw error
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST',
        })

        this.user = null
        this.session = null
        this.error = null

        await navigateTo('/account/sign-in')
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred during sign out'
        throw error
      }
    },

    async fetchUser() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: { user: { id: string; email: string; display_name: string | null } } }>('/api/auth/user', {
          method: 'GET',
        })

        // Update only the user data we have
        if (this.user) {
          this.user.email = response.data.user.email
          if (response.data.user.display_name) {
            this.user.user_metadata = {
              ...this.user.user_metadata,
              display_name: response.data.user.display_name,
            }
          }
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while fetching user'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(displayName: string) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: { user: { id: string; email: string; display_name: string | null } } }>('/api/auth/profile', {
          method: 'PATCH',
          body: {
            display_name: displayName,
          },
        })

        // Update user in store
        if (this.user) {
          this.user.user_metadata = {
            ...this.user.user_metadata,
            display_name: response.data.user.display_name,
          }
        }

        return response
      } catch (error: any) {
        this.error = error?.data?.message || 'An error occurred while updating profile'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
})
