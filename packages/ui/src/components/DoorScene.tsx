import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export interface DoorSceneProps {
  /** Width of the scene in px. */
  width?: number;
  /** Height of the scene in px. */
  height?: number;
  /** Whether the door light / rings pulse. */
  animate?: boolean;
  style?: ViewStyle;
}

/**
 * The navy night scene on the splash screen: an arched door on a horizon over
 * still water, thin concentric rings, light streaks on the water. The door
 * light and rings pulse gently.
 */
export function DoorScene({ width = 393, height = 852, animate = true, style }: DoorSceneProps) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (!animate) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 2250,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 2250,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0.35, 0.9],
    outputRange: [0.35, 0.9],
  });

  return (
    <Svg width={width} height={height} viewBox="0 0 393 852" fill="none" style={style}>
      <Defs>
        <LinearGradient id="doorG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0A2A5E" />
          <Stop offset="1" stopColor="#071F49" />
        </LinearGradient>
        <LinearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0B2C63" />
          <Stop offset="1" stopColor="#071F49" />
        </LinearGradient>
      </Defs>

      {/* Sky */}
      <Rect x="0" y="0" width="393" height="852" fill="url(#doorG)" />

      {/* Horizon water */}
      <Rect x="0" y="470" width="393" height="382" fill="url(#waterG)" />

      {/* Concentric rings around the door */}
      <AnimatedCircle
        cx="196"
        cy="470"
        r="150"
        stroke="#CFE0FF"
        strokeWidth="0.8"
        opacity={opacity}
      />
      <AnimatedCircle
        cx="196"
        cy="470"
        r="190"
        stroke="#CFE0FF"
        strokeWidth="0.7"
        opacity={opacity}
      />
      <AnimatedCircle
        cx="196"
        cy="470"
        r="230"
        stroke="#CFE0FF"
        strokeWidth="0.6"
        opacity={opacity}
      />

      {/* Door arch */}
      <Path
        d="M136 470 L136 300 C136 240 160 200 196 200 C232 200 256 240 256 300 L256 470 Z"
        fill="#0A2A5E"
        stroke="#CFE0FF"
        strokeWidth="1.4"
      />
      {/* Door light */}
      <AnimatedPath
        d="M150 470 L150 308 C150 258 168 226 196 226 C224 226 242 258 242 308 L242 470 Z"
        fill="#CFE0FF"
        opacity={opacity}
      />

      {/* Water streaks */}
      <G stroke="#CFE0FF" strokeWidth="1" opacity="0.5">
        <Path d="M60 520 L120 520" />
        <Path d="M150 560 L230 560" />
        <Path d="M90 610 L170 610" />
        <Path d="M210 650 L300 650" />
        <Path d="M120 700 L200 700" />
        <Path d="M250 740 L330 740" />
      </G>
    </Svg>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
