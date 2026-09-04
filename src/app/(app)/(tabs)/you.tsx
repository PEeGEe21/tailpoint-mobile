import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppearanceSelector } from '@/components/appearance-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function YouScreen() {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.section}>
          <ThemedText type="subtitle">Appearance</ThemedText>
          <ThemedText themeColor="textSecondary">
            Choose how Tailpoint looks on this device.
          </ThemedText>
          <AppearanceSelector />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four },
  section: { gap: Spacing.three },
});
