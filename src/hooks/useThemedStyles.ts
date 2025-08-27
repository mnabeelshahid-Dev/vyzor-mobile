import { useMemo } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';

type StyleSheetFactory<T> = (theme: Theme) => T;

export const useThemedStyles = <T>(
  styleSheetFactory: StyleSheetFactory<T>
): T => {
  const { theme } = useTheme();

  return useMemo(() => {
    return styleSheetFactory(theme);
  }, [theme, styleSheetFactory]);
};

// Helper function for creating themed styles outside of components
export const createThemedStyles = <T>(
  styleSheetFactory: StyleSheetFactory<T>
) => {
  return styleSheetFactory;
};
