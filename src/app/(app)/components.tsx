import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppearanceSelector } from '@/components/appearance-selector';
import { FeedbackState } from '@/components/feedback-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  AnchoredMenu,
  MenuItem,
  SearchableSelect,
} from '@/components/ui/overlays';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Choice,
  Divider,
  Field,
  ListItem,
  Progress,
  Skeleton,
  Spinner,
  Switch,
} from '@/components/ui/primitives';
import { Spacing } from '@/constants/theme';

export default function ComponentGallery() {
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selection, setSelection] = useState<string>();
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Components
          </ThemedText>
          <AppearanceSelector />
          <Button>Primary action</Button>
          <Field label="Text field" placeholder="Placeholder" />
          <Choice
            checked={checked}
            label="Checkbox"
            onPress={() => setChecked(!checked)}
          />
          <Switch label="Switch" onValueChange={setChecked} value={checked} />
          <SearchableSelect
            label="Choose a status"
            onChange={setSelection}
            options={[
              { label: 'Not started', value: 'not-started' },
              { label: 'In progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' },
            ]}
            value={selection}
          />
          <Button onPress={() => setMenuOpen(true)}>Open anchored menu</Button>
          <AnchoredMenu onClose={() => setMenuOpen(false)} visible={menuOpen}>
            <MenuItem label="Edit" onPress={() => setMenuOpen(false)} />
            <MenuItem label="Archive" onPress={() => setMenuOpen(false)} />
          </AnchoredMenu>
          <Card>
            <ListItem
              leading={<Avatar label="Praise George" />}
              subtitle="Supporting information"
              title="List item"
              trailing={<Badge tone="success">Active</Badge>}
            />
            <Divider />
            <Progress value={0.64} />
            <Skeleton width="70%" />
            <Spinner />
          </Card>
          <View style={styles.states}>
            <FeedbackState
              description="There is nothing here yet."
              title="Empty state"
              variant="empty"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 28, lineHeight: 34 },
  states: { minHeight: 220 },
});
