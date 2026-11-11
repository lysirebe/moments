import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { colors, fonts, radii } from '../theme';

export interface PlayerSheetSection {
  type: 'notes' | 'scripture' | 'prayer' | 'revelation' | 'favourite' | 'reflection';
  title: string;
  preview: string;
  time?: string;
}

export interface PlayerSheetAddOption {
  type: PlayerSheetSection['type'];
  label: string;
}

export interface PlayerSheetProps {
  expanded: boolean;
  onToggle: () => void;
  sections: PlayerSheetSection[];
  /** Used when no `addOptions` are given: "Add more" calls this directly. */
  onAddMore?: () => void;
  /** When given, "Add more" opens a dropdown of these options. */
  addOptions?: PlayerSheetAddOption[];
  onAddOption?: (type: PlayerSheetSection['type']) => void;
  /** Makes each row tappable, e.g. to open it in full. */
  onPressSection?: (index: number) => void;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MENU_WIDTH = 200;
const MENU_ITEM_HEIGHT = 48;
const MENU_GAP = 6;
const SCREEN_MARGIN = 16;

const SHEET_HEIGHT = 420;
/** How much of the sheet stays visible when collapsed (grabber + header). */
const PEEK_HEIGHT = 96;
const COLLAPSED_OFFSET = SHEET_HEIGHT - PEEK_HEIGHT;
/** Movement under this many points counts as a tap rather than a drag. */
const TAP_SLOP = 6;
/** Flick speed (points/ms) that decides direction regardless of distance. */
const FLICK_VELOCITY = 0.3;

function SectionIcon({ type, small }: { type: PlayerSheetSection['type']; small?: boolean }) {
  return (
    <View style={[styles.iconCircle, small && styles.iconCircleSmall]}>
      <Text style={[styles.iconGlyph, small && styles.iconGlyphSmall]}>
        {type === 'notes' ? '✎' : type === 'scripture' ? '❝' : '✦'}
      </Text>
    </View>
  );
}

/**
 * The swipe-up "Reflect on your moment" sheet on the Player screen. For the
 * prototype it animates between collapsed and expanded states.
 */
export function PlayerSheet({
  expanded,
  onToggle,
  sections,
  onAddMore,
  addOptions,
  onAddOption,
  onPressSection,
}: PlayerSheetProps) {
  // 0 = expanded, 1 = collapsed. Start where the prop says so the sheet
  // doesn't spring from open to closed on mount.
  const progress = useRef(new Animated.Value(expanded ? 0 : 1)).current;
  const expandedRef = useRef(expanded);
  const onToggleRef = useRef(onToggle);
  expandedRef.current = expanded;
  onToggleRef.current = onToggle;
  const addMoreRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const screen = useWindowDimensions();

  const handleAddMore = () => {
    if (!addOptions?.length) {
      onAddMore?.();
      return;
    }
    // Measure in window coordinates so the menu renders in a Modal above the
    // sheet instead of being clipped by it.
    addMoreRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  const handleSelectOption = (type: PlayerSheetSection['type']) => {
    setAnchor(null);
    onAddOption?.(type);
  };

  const menuHeight = (addOptions?.length ?? 0) * MENU_ITEM_HEIGHT + 12;
  const menuPosition = anchor
    ? {
        right: Math.max(SCREEN_MARGIN, screen.width - (anchor.x + anchor.width)),
        // Open upwards when there isn't room below the button.
        ...(anchor.y + anchor.height + MENU_GAP + menuHeight > screen.height - SCREEN_MARGIN
          ? { bottom: screen.height - anchor.y + MENU_GAP }
          : { top: anchor.y + anchor.height + MENU_GAP }),
      }
    : null;

  const settle = (toExpanded: boolean) => {
    Animated.spring(progress, {
      toValue: toExpanded ? 0 : 1,
      useNativeDriver: true,
      friction: 9,
      tension: 70,
    }).start();
  };

  useEffect(() => {
    settle(expanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Drag (or tap) anywhere on the grabber/header to move the sheet. Child
  // Pressables such as "Add more" still claim their own touches first.
  const startProgress = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > TAP_SLOP,
      onPanResponderGrant: () => {
        progress.stopAnimation((value) => {
          startProgress.current = value;
        });
      },
      onPanResponderMove: (_, g) => {
        const next = startProgress.current + g.dy / COLLAPSED_OFFSET;
        progress.setValue(Math.min(1, Math.max(0, next)));
      },
      onPanResponderRelease: (_, g) => {
        const isTap = Math.abs(g.dy) < TAP_SLOP && Math.abs(g.dx) < TAP_SLOP;
        let toExpanded: boolean;
        if (isTap) {
          toExpanded = !expandedRef.current;
        } else if (Math.abs(g.vy) > FLICK_VELOCITY) {
          toExpanded = g.vy < 0;
        } else {
          const next = startProgress.current + g.dy / COLLAPSED_OFFSET;
          toExpanded = next < 0.5;
        }
        if (toExpanded !== expandedRef.current) {
          onToggleRef.current();
        } else {
          settle(toExpanded);
        }
      },
      onPanResponderTerminate: () => settle(expandedRef.current),
    }),
  ).current;

  const translate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, COLLAPSED_OFFSET],
  });

  return (
    <Animated.View
      style={[styles.sheet, { height: SHEET_HEIGHT, transform: [{ translateY: translate }] }]}
    >
      <View {...panResponder.panHandlers}>
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse sheet' : 'Expand sheet'}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={onToggle}
          style={styles.grabberWrap}
        >
          <View style={styles.grabber} />
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reflect on your moment</Text>
          <Pressable
            ref={addMoreRef}
            accessibilityRole="button"
            accessibilityState={{ expanded: Boolean(anchor) }}
            onPress={handleAddMore}
            style={styles.addMore}
          >
            <Text style={styles.addMoreText}>Add more</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={Boolean(anchor)}
        transparent
        animationType="fade"
        onRequestClose={() => setAnchor(null)}
      >
        <Pressable
          accessibilityLabel="Close menu"
          style={StyleSheet.absoluteFill}
          onPress={() => setAnchor(null)}
        />
        {menuPosition && (
          <View
            accessibilityRole="menu"
            style={[styles.menu, menuPosition, { maxHeight: screen.height - SCREEN_MARGIN * 2 }]}
          >
            <ScrollView bounces={false}>
              {addOptions?.map((option) => (
                <Pressable
                  key={option.type}
                  accessibilityRole="menuitem"
                  onPress={() => handleSelectOption(option.type)}
                  style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                >
                  <SectionIcon type={option.type} small />
                  <Text style={styles.menuItemText} numberOfLines={1}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sections.length === 0 ? (
          <Text style={styles.empty}>Nothing added yet. Tap Add more to enrich this Moment.</Text>
        ) : null}
        {sections.map((section, index) => (
          <Pressable
            key={`${section.type}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${section.title}`}
            disabled={!onPressSection}
            onPress={() => onPressSection?.(index)}
            style={({ pressed }) => [styles.section, pressed && styles.sectionPressed]}
          >
            <SectionIcon type={section.type} />
            <View style={styles.sectionBody}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionPreview} numberOfLines={2}>
                {section.preview}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  grabberWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(49,86,184,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.darkBlue,
  },
  addMore: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.button,
    borderWidth: 1.2,
    borderColor: colors.cobalt,
  },
  addMoreText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.cobalt,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  empty: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textSecondary,
    paddingVertical: 12,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  iconGlyph: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: colors.cobalt,
  },
  iconGlyphSmall: {
    fontSize: 13,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    paddingVertical: 6,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
  },
  menuItem: {
    height: MENU_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
  },
  menuItemPressed: {
    backgroundColor: colors.paleBlue,
  },
  menuItemText: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.darkBlue,
  },
  sectionPressed: {
    opacity: 0.6,
  },
  sectionBody: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.darkBlue,
  },
  sectionPreview: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontFamily: fonts.ui,
    fontSize: 22,
    color: colors.textSecondary,
  },
});
