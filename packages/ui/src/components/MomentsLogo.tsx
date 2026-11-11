import React from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const LOGO_PATH =
  'M426.3 104.3 L425.2 102.7 L422.8 101.5 L413.8 100.0 L326.0 99.0 L309.3 101.3 L296.2 106.8 L287.5 113.8 L280.3 122.3 L262.2 149.2 L258.2 152.8 L255.0 153.0 L253.8 150.7 L253.8 142.0 L262.7 94.8 L267.8 61.8 L268.8 46.0 L269.8 41.8 L269.8 26.0 L267.7 14.8 L265.0 8.7 L259.8 4.5 L254.0 4.0 L249.2 5.8 L244.0 9.7 L235.3 20.3 L226.8 34.2 L203.2 80.7 L198.7 86.8 L197.2 86.0 L196.0 80.8 L193.8 53.0 L191.7 40.0 L189.5 32.3 L186.8 26.3 L183.2 21.8 L178.5 19.3 L173.5 18.3 L166.2 20.8 L161.7 23.8 L157.8 27.7 L148.3 41.3 L126.2 80.2 L118.3 89.2 L111.5 94.7 L103.0 97.8 L92.8 100.0 L86.0 100.0 L81.8 101.0 L68.0 101.0 L63.8 102.0 L48.0 102.0 L43.8 103.0 L26.0 103.0 L21.8 104.0 L13.0 104.0 L6.2 106.0 L5.0 108.7 L8.0 111.3 L16.0 112.8 L35.8 112.8 L40.0 113.8 L76.8 113.8 L81.0 112.8 L91.8 112.8 L98.8 111.8 L112.5 108.5 L119.5 105.5 L125.5 101.5 L132.0 95.2 L141.5 81.5 L157.7 53.7 L165.7 44.7 L170.5 43.0 L173.5 45.2 L175.8 51.0 L181.2 90.8 L185.0 103.5 L188.2 108.2 L191.0 110.3 L196.8 110.8 L199.3 110.2 L203.8 107.3 L210.0 98.7 L234.7 49.2 L242.7 35.2 L249.7 26.2 L251.0 26.3 L251.8 27.7 L250.0 45.8 L240.0 103.0 L235.0 140.0 L235.0 150.8 L237.3 161.5 L240.8 168.2 L246.3 172.5 L250.0 173.7 L252.8 173.7 L263.2 169.0 L273.0 159.2 L294.7 127.7 L301.3 121.2 L312.3 115.2 L323.0 112.0 L331.0 110.8 L345.8 110.8 L350.0 109.8 L386.0 109.8 L391.8 108.8 L415.8 108.8 L424.8 106.7Z';

export interface MomentsLogoProps {
  /** Stroke / fill colour. */
  color?: string;
  /** Rendered width in px; height follows the 430:177 aspect ratio. */
  width?: number;
  /** Fill progress from 0 to 1 for the left-to-right reveal. */
  progress?: number | Animated.Value;
  /** Stroke width in viewBox units. */
  strokeWidth?: number;
}

/**
 * The Moments wordmark, a single blue stroke. When `progress` is between 0 and
 * 1 the solid copy is revealed left to right through a clip that follows the
 * logo's real shape (used on the Saving screen).
 */
export function MomentsLogo({
  color = '#1A66FF',
  width = 150,
  progress = 1,
  strokeWidth = 2.4,
}: MomentsLogoProps) {
  const height = (width * 177) / 430;

  const clipWidth =
    typeof progress === 'number'
      ? 430 * Math.max(0, Math.min(1, progress))
      : progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 430],
        });

  return (
    <Svg width={width} height={height} viewBox="0 0 430 177" fill="none" strokeLinejoin="round">
      <Defs>
        <ClipPath id="momentsLogoFill">
          <AnimatedRect x="0" y="0" width={clipWidth} height="177" />
        </ClipPath>
      </Defs>
      <Path d={LOGO_PATH} fill="none" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d={LOGO_PATH}
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        clipPath="url(#momentsLogoFill)"
      />
    </Svg>
  );
}
