import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@moments/ui';
import { DoorScene } from '@moments/ui';

export interface SplashScreenProps {
  onEnter: () => void;
}

/**
 * Splash (Main.dc.html): navy night scene with the door, "tap to enter".
 */
export function SplashScreen({ onEnter }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const tapOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(tapOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  }, [tapOpacity]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Enter Moments"
      onPress={onEnter}
      style={styles.container}
    >
      <DoorScene width={393} height={852} />
      <Animated.View style={[styles.tap, { bottom: insets.bottom + 62, opacity: tapOpacity }]}>
        <Text style={styles.tapText}>tap to enter</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  tap: {
    position: 'absolute',
    alignSelf: 'center',
  },
  tapText: {
    fontFamily: fonts.handwriting,
    fontSize: 30,
    color: colors.splashTap,
  },
});
