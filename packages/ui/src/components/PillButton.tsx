import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radii } from '../theme';

export type PillButtonVariant = 'primary' | 'outline' | 'ghost';

export interface PillButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: PillButtonVariant;
  icon?: React.ReactNode;
  minWidth?: number;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<PillButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.cobalt,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.2,
    borderColor: colors.cobalt,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
};

const labelColors: Record<PillButtonVariant, string> = {
  primary: colors.white,
  outline: colors.cobalt,
  ghost: colors.cobalt,
};

/**
 * A pill-shaped action button used for Start, Next, Finish, Import Moment,
 * Continue with selected and similar primary/secondary actions.
 */
export function PillButton({
  label,
  variant = 'primary',
  icon,
  minWidth,
  style,
  ...rest
}: PillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        minWidth ? { minWidth } : null,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: labelColors[variant] }]}>
        {label}
      </Text>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 32,
    borderRadius: radii.button,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
  },
});
