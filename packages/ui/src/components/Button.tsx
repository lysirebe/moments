import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.cobalt,
  },
  secondary: {
    backgroundColor: colors.paleBlue,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.cobalt,
  },
};

const labelColors: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.cobalt,
  ghost: colors.cobalt,
  danger: colors.white,
};

export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: labelColors[variant] }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.screenPadding,
    paddingHorizontal: spacing.screenPadding,
    borderRadius: radii.button,
    minHeight: 48,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
  },
});
