import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { AttentionCard } from '@/features/home/attention-card';
import { ProjectCard, type ProjectItem } from '@/features/home/project-card';
import { SegmentedTabs } from '@/features/home/segmented-tabs';
import { TaskCard, type TaskBucket } from '@/features/home/task-card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import {
  ATTENTION_ITEMS,
  PROJECT_ITEMS,
  TASK_ITEMS,
  TASK_TABS,
} from '@/features/home/mock-data';

export default function HomeScreen() {
  const theme = useTheme();
  const [activeBucket, setActiveBucket] = useState<TaskBucket>('today');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const tasksByBucket = useMemo(
    () =>
      TASK_TABS.map((tab) => ({
        ...tab,
        count: TASK_ITEMS.filter((task) => task.bucket === tab.key).length,
      })),
    [],
  );

  const visibleTasks = useMemo(
    () =>
      TASK_ITEMS.filter((task) => task.bucket === activeBucket).map((task) => ({
        ...task,
        completed: completedIds.has(task.id),
      })),
    [activeBucket, completedIds],
  );

  const toggleComplete = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const openProject = (project: ProjectItem) =>
    router.push(`/projects/${project.id}` as never);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={{ backgroundColor: theme.background }}
    >
      <View style={styles.greetingBlock}>
        <ThemedText style={styles.greeting}>Good morning, Praise</ThemedText>
        <ThemedText style={styles.greetingSubtitle} themeColor="textSecondary">
          Here&apos;s what needs your attention today.
        </ThemedText>
      </View>

      <Section title="Needs Attention">
        <FlatList
          contentContainerStyle={styles.attentionListContent}
          data={ATTENTION_ITEMS}
          horizontal
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AttentionCard item={item} />}
          showsHorizontalScrollIndicator={false}
        />
      </Section>

      <Section title="My Tasks">
        <SegmentedTabs
          activeKey={activeBucket}
          onChange={(key) => setActiveBucket(key as TaskBucket)}
          tabs={tasksByBucket}
        />
        <View style={styles.taskList}>
          {visibleTasks.map((task) => (
            <TaskCard
              item={task}
              key={task.id}
              onToggleComplete={toggleComplete}
            />
          ))}
        </View>
      </Section>

      <Section title="Active Projects">
        <View style={styles.projectList}>
          {PROJECT_ITEMS.map((project) => (
            <ProjectCard
              item={project}
              key={project.id}
              onPress={() => openProject(project)}
            />
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  greetingBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
  },
  greetingSubtitle: {
    fontSize: 14,
  },
  section: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  attentionListContent: {
    paddingHorizontal: 16,
  },
  taskList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  projectList: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
