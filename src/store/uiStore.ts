// store/uiStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  isSideMenuOpen: boolean
  openSideMenu: () => void
  closeSideMenu: () => void
  toggleSideMenu: () => void
  
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  toggleSettings: () => void
  
  customColor: string
  setCustomColor: (color: string) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSideMenuOpen: false,
      openSideMenu: () => set({ isSideMenuOpen: true }),
      closeSideMenu: () => set({ isSideMenuOpen: false }),
      toggleSideMenu: () => set((state) => ({ isSideMenuOpen: !state.isSideMenuOpen })),
      
      isSettingsOpen: false,
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      
      customColor: '#4f46e5', 
      setCustomColor: (color) => set({ customColor: color }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ customColor: state.customColor }),
    }
  )
)