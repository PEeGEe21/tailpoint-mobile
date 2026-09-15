import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface ProjectSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
}

export function ProjectSearchBar({
  value,
  onChangeText,
  onFilterPress,
}: ProjectSearchBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.searchField, { backgroundColor: theme.background }]}>
        <MaterialIcons color={theme.textSecondary} name="search" size={20} />
        <TextInput
          onChangeText={onChangeText}
          placeholder="Search projects, leads, tags..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          value={value}
        />
      </View>
      <Pressable
        accessibilityLabel="Filter projects"
        onPress={onFilterPress}
        style={[styles.filterButton, { backgroundColor: theme.background }]}
      >
        <MaterialIcons color={theme.textSecondary} name="tune" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
