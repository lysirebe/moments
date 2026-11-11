import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text, colors, spacing, radii } from '@moments/ui';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  placeholder: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function Select({ label, placeholder, value, options, onSelect, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => setOpen(true)}
      >
        <Text
          variant="body"
          numberOfLines={1}
          style={styles.triggerLabel}
          color={selected ? colors.scriptureSearchText : colors.scriptureSearchPlaceholder}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text variant="body" color={colors.scriptureSearchPlaceholder}>
          ▾
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <Text variant="title" color={colors.darkBlue} style={styles.sheetTitle}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    variant="body"
                    color={item.value === value ? colors.cobalt : colors.darkBlue}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.scriptureSearchBg,
    borderWidth: 1,
    borderColor: colors.scriptureResultBorder,
    borderRadius: radii.field,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  triggerLabel: {
    flex: 1,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,47,99,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  sheetTitle: {
    marginBottom: spacing.md,
  },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
});
