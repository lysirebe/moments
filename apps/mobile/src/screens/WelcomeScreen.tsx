import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '@moments/ui';
import { PillButton } from '@moments/ui';

export interface WelcomeScreenProps {
  onStart: () => void;
}

function ArrowIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12 L19 12 M13 6 L19 12 L13 18"
        stroke={colors.white}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Welcome (S1c.dc.html): pale-blue paper with a handwritten welcome message and
 * a cobalt Start button.
 */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.message}>
        <Text style={[styles.hand, styles.handLeft]}>Welcome to Moments.</Text>
        <Text style={[styles.hand, styles.handRight]}>
          A quiet place to keep what God is doing.
        </Text>
      </View>

      <View style={[styles.footer, { bottom: insets.bottom + 92 }]}>
        <PillButton label="Start" icon={<ArrowIcon />} onPress={onStart} minWidth={140} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.welcomeBgMid,
    paddingHorizontal: 28,
  },
  message: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  hand: {
    fontFamily: fonts.handwriting,
    fontSize: 34,
    lineHeight: 38,
    color: colors.welcomeHand,
  },
  handLeft: {
    transform: [{ rotate: '-4deg' }],
  },
  handRight: {
    transform: [{ rotate: '-4deg' }],
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute',
    left: 28,
    right: 28,
    alignItems: 'center',
  },
});
