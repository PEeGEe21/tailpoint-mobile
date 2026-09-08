import { PropsWithChildren, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OverlayProps = PropsWithChildren<{
  onClose: () => void;
  title: string;
  visible: boolean;
}>;

export function BottomSheet({
  children,
  onClose,
  title,
  visible,
}: OverlayProps) {
  const theme = useTheme();
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel="Close sheet"
        onPress={onClose}
        style={styles.backdrop}
      />
      <ThemedView
        accessibilityViewIsModal
        style={[styles.sheet, { borderColor: theme.border }]}
      >
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        <ThemedText type="subtitle">{title}</ThemedText>
        {children}
      </ThemedView>
    </Modal>
  );
}

export function AppModal({ children, onClose, title, visible }: OverlayProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <ThemedView style={styles.modal}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {children}
        <Button onPress={onClose}>Done</Button>
      </ThemedView>
    </Modal>
  );
}

export function AlertDialog({
  body,
  confirmLabel,
  onClose,
  onConfirm,
  title,
  visible,
}: {
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
}) {
  const theme = useTheme();
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.centered}>
        <ThemedView
          accessibilityRole="alert"
          accessibilityViewIsModal
          style={[styles.alert, { borderColor: theme.border }]}
        >
          <ThemedText type="subtitle">{title}</ThemedText>
          <ThemedText themeColor="textSecondary">{body}</ThemedText>
          <Button onPress={onConfirm}>{confirmLabel}</Button>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.cancel}
          >
            <ThemedText type="smallBold">Cancel</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

export function Toast({
  message,
  variant = 'error',
}: {
  message: string;
  variant?: 'error' | 'success' | 'neutral';
}) {
  const theme = useTheme();
  const backgroundColor =
    variant === 'error'
      ? theme.danger
      : variant === 'success'
        ? theme.success
        : theme.text;
  const color =
    variant === 'error'
      ? theme.onDanger
      : variant === 'success'
        ? '#FFFFFF'
        : theme.background;

  return (
    <View
      accessible
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.toast, { backgroundColor }]}
    >
      <Text style={[styles.toastMessage, { color }]}>{message}</Text>
    </View>
  );
}

export type SelectOption = { label: string; value: string };

export function SearchableSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const theme = useTheme();
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [options, query],
  );
  return (
    <>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[styles.select, { borderColor: theme.border }]}
      >
        <ThemedText>{selected?.label ?? label}</ThemedText>
      </Pressable>
      <BottomSheet onClose={() => setOpen(false)} title={label} visible={open}>
        <TextInput
          accessibilityLabel={`Search ${label}`}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.search,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={query}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          {filtered.map((option) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: option.value === value }}
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
                setQuery('');
              }}
              style={styles.menuItem}
            >
              <ThemedText>{option.label}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
    </>
  );
}

export function AnchoredMenu({
  children,
  onClose,
  visible,
}: PropsWithChildren<{ onClose: () => void; visible: boolean }>) {
  const theme = useTheme();
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel="Close menu"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />
      <ThemedView
        accessibilityViewIsModal
        style={[styles.anchoredMenu, { borderColor: theme.border }]}
      >
        {children}
      </ThemedView>
    </Modal>
  );
}

export function MenuItem({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      style={styles.menuItem}
    >
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  handle: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    borderRadius: Radius.pill,
  },
  modal: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  alert: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 40,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  toastMessage: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  select: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
  },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  anchoredMenu: {
    position: 'absolute',
    right: Spacing.three,
    top: 72,
    minWidth: 200,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingVertical: Spacing.one,
    elevation: 8,
  },
  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
});
