import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  role: string
}

interface UserAuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => Promise<void>
}

export const useUserAuth = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // The server sets the httpOnly cookie; the client store only tracks user info.
      login: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      logout: async () => {
        try {
          // Call the logout API endpoint to clear the httpOnly cookie
          const { apiClient } = await import('@/lib/api-client')
          await apiClient.post('/api/users/logout')
        } catch {
          // Even if API call fails, clear local state
        } finally {
          // Always clear local state
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'user-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
