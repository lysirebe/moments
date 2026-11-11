import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@moments/ui';
import { MomentsLogo } from '@moments/ui';

export interface LogoRevealScreenProps {
  onDone: () => void;
}

/**
 * Logo-Reveal (S1b.dc.html): the door opens and the logo rises into the doorway
 * with the "moments" wordmark beneath. For the prototype this is a simple
 * fade/scale reveal that auto-advances.
 */
export function LogoRevealScreen({ onDone }: LogoRevealScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onDone, 2100);
    return () => clearTimeout(timer);
  }, [onDone, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <MomentsLogo color={colors.logoBlue} width={150} />
        <Text style={styles.wordmark}>moments</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.revealBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: fonts.ui,
    fontSize: 22,
    letterSpacing: 4.4,
    color: colors.revealWordmark,
    marginTop: 16,
  },
});
