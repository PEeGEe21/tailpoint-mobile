import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface ArchivedBannerProps {
  count: number;
  onPress?: () => void;
}

export function ArchivedBanner({ count, onPress }: ArchivedBannerProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <MaterialIcons color={theme.primary} name="archive" size={22} />
        </View>
        <View>
          <ThemedText style={styles.title}>Archived Initiatives</ThemedText>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {count} completed or deprecated projects
          </ThemedText>
        </View>
      </View>
      <Pressable
        onPress={onPress}
        style={[styles.button, { backgroundColor: theme.backgroundElement }]}
      >
        <ThemedText style={styles.buttonLabel}>View</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
  },
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
