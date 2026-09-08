import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArchivedBanner } from '@/features/projects/archived-banner';
import {
  FilterPills,
  type FilterPillOption,
} from '@/features/projects/filter-pills';
import {
  PinnedProjectCard,
  type PinnedProject,
} from '@/features/projects/pinned-project-card';
import {
  ProjectListRow,
  type ProjectListItem,
} from '@/features/projects/project-list-row';
import { ProjectSearchBar } from '@/features/projects/project-search-bar';
import { LIST_PROJECTS, PINNED_PROJECTS } from '@/features/projects/mock-data';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useSessionStore } from '@/auth/session-store';

const ARCHIVED_COUNT = 14;

export default function ProjectsScreen() {
  const theme = useTheme();
  const organizationName = useSessionStore((state) => state.organization?.name);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');

  const totalCount = PINNED_PROJECTS.length + LIST_PROJECTS.length;
  const inProgressCount = useMemo(
    () =>
      PINNED_PROJECTS.filter((p) => p.status === 'in_progress').length +
      LIST_PROJECTS.filter((p) => p.status === 'in_progress').length,
    [],
  );
  const reviewCount = useMemo(
    () =>
      PINNED_PROJECTS.filter((p) => p.status === 'on_review').length +
      LIST_PROJECTS.filter((p) => p.status === 'on_review').length,
    [],
  );

  const filterOptions: FilterPillOption[] = [
    { key: 'active', label: 'Active', count: totalCount },
    {
      key: 'in_progress',
      label: 'In progress',
      count: inProgressCount,
      dotColor: '#14804A',
    },
    {
      key: 'on_review',
      label: 'In review',
      count: reviewCount,
      dotColor: '#D97706',
    },
    {
      key: 'pinned',
      label: 'Pinned',
      count: PINNED_PROJECTS.length,
      icon: 'push-pin',
    },
  ];

  const query = search.trim().toLowerCase();

  const visiblePinned = useMemo(
    () =>
      PINNED_PROJECTS.filter((project) => {
        if (
          query &&
          !project.title.toLowerCase().includes(query) &&
          !project.tag.toLowerCase().includes(query)
        )
          return false;
        if (activeFilter === 'in_progress')
          return project.status === 'in_progress';
        if (activeFilter === 'on_review') return project.status === 'on_review';
        return true;
      }),
    [query, activeFilter],
  );

  const visibleList = useMemo(() => {
    if (activeFilter === 'pinned') return [];
    return LIST_PROJECTS.filter((project) => {
      if (
        query &&
        !project.title.toLowerCase().includes(query) &&
        !project.tag.toLowerCase().includes(query)
      )
        return false;
      if (activeFilter === 'in_progress')
        return project.status === 'in_progress';
      if (activeFilter === 'on_review') return project.status === 'on_review';
      return true;
    });
  }, [query, activeFilter]);

  const openProject = (project: ProjectListItem) =>
    router.push(`/projects/${project.id}` as never);

  const openPinnedProject = (project: PinnedProject) =>
    router.push(`/projects/${project.id}` as never);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={{ backgroundColor: theme.background }}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>Projects</ThemedText>
          <View
            style={[
              styles.liveHubBadge,
              { backgroundColor: `${theme.primary}1A` },
            ]}
          >
            <MaterialIcons
              color={theme.primary}
              name="auto-awesome"
              size={13}
            />
            <ThemedText style={[styles.liveHubLabel, { color: theme.primary }]}>
              Live Hub
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.subtitle} themeColor="textSecondary">
          All initiatives in {organizationName ?? 'your workspace'}
        </ThemedText>

        <View style={styles.searchBlock}>
          <ProjectSearchBar onChangeText={setSearch} value={search} />
        </View>

        <View style={styles.filterBlock}>
          <FilterPills
            activeKey={activeFilter}
            onChange={setActiveFilter}
            options={filterOptions}
          />
        </View>
      </View>

      {visiblePinned.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons color={theme.primary} name="push-pin" size={16} />
              <ThemedText style={styles.sectionTitle}>
                Pinned Initiatives
              </ThemedText>
            </View>
            <ThemedText
              style={styles.sectionEyebrow}
              themeColor="textSecondary"
            >
              Priority
            </ThemedText>
          </View>
          <View style={styles.pinnedList}>
            {visiblePinned.map((project) => (
              <PinnedProjectCard
                key={project.id}
                project={project}
                onPress={() => openPinnedProject(project)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {activeFilter !== 'pinned' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              All Projects ({totalCount})
            </ThemedText>
            <View style={styles.sortRow}>
              <ThemedText style={styles.sortLabel} themeColor="textSecondary">
                Sort: Recent
              </ThemedText>
              <MaterialIcons
                color={theme.textSecondary}
                name="arrow-drop-down"
                size={16}
              />
            </View>
          </View>
          <View style={styles.listRows}>
            {visibleList.map((project) => (
              <ProjectListRow
                item={project}
                key={project.id}
                onPress={() => openProject(project)}
              />
            ))}
            {visibleList.length === 0 ? (
              <ThemedText style={styles.emptyLabel} themeColor="textSecondary">
                No projects match this search.
              </ThemedText>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <ArchivedBanner count={ARCHIVED_COUNT} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  liveHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveHubLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 13,
  },
  searchBlock: {
    marginTop: 16,
  },
  filterBlock: {
    marginTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  pinnedList: {
    gap: 12,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sortLabel: {
    fontSize: 12,
  },
  listRows: {
    gap: 8,
  },
  emptyLabel: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
