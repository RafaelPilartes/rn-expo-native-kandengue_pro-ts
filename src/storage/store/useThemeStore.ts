import { create } from 'zustand';
import { Appearance } from 'react-native';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from './zustandMMKVStorage';
import { THEME_STORAGE_ID } from '../constants';

type AppTheme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: AppTheme; // Preferência do usuário
  resolvedTheme: 'light' | 'dark'; // O que está ativo agora
  setTheme: (theme: AppTheme) => void;
  updateResolvedTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: Appearance.getColorScheme() || 'light',

      setTheme: theme => {
        set({ theme });

        // Atualiza resolvedTheme com base na escolha
        const sysTheme = Appearance.getColorScheme();
        set({
          resolvedTheme: theme === 'system' ? sysTheme || 'light' : theme,
        });
      },

      updateResolvedTheme: () => {
        const { theme } = get();

        const sysTheme = Appearance.getColorScheme();

        theme === 'system' ? sysTheme || 'light' : theme;
      },
    }),
    {
      name: THEME_STORAGE_ID,
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
