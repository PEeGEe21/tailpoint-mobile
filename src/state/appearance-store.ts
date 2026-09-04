import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppearancePreference = 'system' | 'light' | 'dark';

type AppearanceState = {
  hasHydrated: boolean;
  preference: AppearancePreference;
  setHasHydrated: (hasHydrated: boolean) => void;
  setPreference: (preference: AppearancePreference) => void;
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      preference: 'system',
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'tailpoint.appearance.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ preference }) => ({ preference }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
