import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, RadialGradient, Stop, Defs } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface OrbProps {
  /** Size of the orb in px. */
  size?: number;
  /** Whether the idle pulse animation is enabled. */
  animate?: boolean;
  style?: ViewStyle;
}

/**
 * The home recording orb: three concentric rings around a radial-gradient
 * sphere with a microphone glyph. The sphere pulses gently when `animate`.
 */
export function Orb({ size = 300, animate = true, style }: OrbProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.045,
          duration: 2100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2100,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, scale]);

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 340 340" fill="none" strokeLinecap="round">
        <Defs>
          <RadialGradient id="orbG" cx="0.42" cy="0.38" r="0.7">
            <Stop offset="0" stopColor="#F4F8FE" />
            <Stop offset="0.55" stopColor="#CFE0F8" />
            <Stop offset="1" stopColor="#A9C6F2" />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx="170"
          cy="170"
          rx="158"
          ry="154"
          transform="rotate(-9 170 170)"
          stroke="#3156B8"
          strokeWidth="0.9"
          opacity="0.3"
        />
        <Ellipse
          cx="170"
          cy="170"
          rx="126"
          ry="123"
          transform="rotate(14 170 170)"
          stroke="#3156B8"
          strokeWidth="0.9"
          opacity="0.38"
        />
        <Ellipse
          cx="170"
          cy="170"
          rx="96"
          ry="98"
          transform="rotate(-20 170 170)"
          stroke="#3156B8"
          strokeWidth="0.9"
          opacity="0.5"
        />
        <AnimatedCircle cx="170" cy="170" r="70" fill="url(#orbG)" transform={[{ scale }]} />
        <G stroke="#3156B8" strokeWidth="1.8" strokeLinejoin="round">
          <Path d="M165 144.5 C165 138 169 135 171 135 C174 135 178 138.5 178 145 L177.5 168 C177 175 173.5 178 171 178 C167.5 178 164.5 174 164.7 168 Z" />
          <Path d="M155 163 C155 177 162 186 171.5 186 C181 186 188 177 188 163" />
          <Path d="M171.5 186 L171 197 M162 198 C167 196.5 175 197.5 181 198" />
        </G>
      </Svg>
    </Animated.View>
  );
}
