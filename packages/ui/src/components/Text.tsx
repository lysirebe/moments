import React from 'react';
import {
  Text as RNText,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { colors, fonts } from '../theme';

export type TextVariant =
  | 'display'
  | 'heading'
  | 'title'
  | 'body'
  | 'bodyLarge'
  | 'caption';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 38,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 30,
  },
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 18,
    lineHeight: 22,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 23,
  },
  bodyLarge: {
    fontFamily: fonts.ui,
    fontSize: 17,
    lineHeight: 25,
  },
  caption: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
  },
};

export function Text({
  variant = 'body',
  color = colors.textBody,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <RNText style={[variantStyles[variant], { color }, style]} {...rest}>
      {children}
    </RNText>
  );
}
