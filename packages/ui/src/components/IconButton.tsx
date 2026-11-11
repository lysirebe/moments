import React from 'react';
import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  /** Accessibility label (required for icon-only buttons). */
  accessibilityLabel: string;
  /** Icon node to render. */
  icon: React.ReactNode;
  /** Size of the touch target in px. */
  size?: number;
  style?: ViewStyle;
}

/**
 * A round icon-only button with a 44×44 minimum touch target.
 */
export function IconButton({
  accessibilityLabel,
  icon,
  size = 44,
  style,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(49,86,184,0.2)',
  },
  pressed: {
    opacity: 0.8,
  },
});
