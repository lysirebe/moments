import React, { createContext, useContext, useMemo } from 'react';
import { colors, spacing, typography, radii } from '@moments/ui';

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  radii: typeof radii;
}

const ThemeContext = createContext<Theme>({
  colors,
  spacing,
  typography,
  radii,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<Theme>(() => ({ colors, spacing, typography, radii }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
