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
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// TODO: replace with real data from the API client. Shapes match
// PinnedProject / ProjectListItem.
const PINNED_PROJECTS: PinnedProject[] = [
  {
    id: 'proj-1',
    tag: 'Q3 Core Initiative',
    status: 'on-track',
    title: 'Mobile Companion',
    description:
      'Native companion app for quick approvals, daily tasks, and attention queue.',
    progressPercent: 68,
    progressLabel: '12 of 18 tasks',
    taskCount: 18,
    milestoneCount: 2,
    dueLabel: 'Oct 15',
    avatars: [
      { initials: 'JD', color: '#006565' },
      { initials: 'AL', color: '#006399' },
      { initials: 'RK', color: '#456300' },
    ],
    extraCount: 3,
  },
  {
    id: 'proj-2',
    tag: 'Architecture Migration',
    status: 'attention',
    title: 'Core Platform v2',
    description:
      'Upgrading foundational API gateway, multi-tenant caching layer, and edge routing.',
    progressPercent: 84,
    progressLabel: '27 of 32 tasks',
    blockerLabel: '1 Blocker',
    taskCount: 32,
    dueLabel: 'Sep 30',
    blocked: true,
    avatars: [
      { initials: 'MC', color: '#42B0FF' },
      { initials: 'SK', color: '#006565' },
      { initials: 'PL', color: '#76D6D5' },
    ],
    extraCount: 3,
  },
];

const LIST_PROJECTS: ProjectListItem[] = [
  {
    id: 'proj-3',
    tag: 'Security',
    updatedLabel: 'Updated 3h ago',
    title: 'Enterprise SSO & Passkey Support',
    status: 'on-track',
    statusLabel: 'On Track',
    progressPercent: 45,
    taskCount: 9,
  },
  {
    id: 'proj-4',
    tag: 'Design Ops',
    updatedLabel: 'Updated yesterday',
    title: 'Design System & Token Sync',
    status: 'review',
    statusLabel: 'Review',
    progressPercent: 92,
    taskCount: 14,
  },
  {
    id: 'proj-5',
    tag: 'Web-first Core',
    updatedLabel: 'Updated 4d ago',
    title: 'Billing & Entitlement Tiering',
    status: 'paused',
    statusLabel: 'Paused',
    progressPercent: 15,
    taskCount: 6,
  },
];

const ARCHIVED_COUNT = 14;

export default function ProjectsScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');

  const totalCount = PINNED_PROJECTS.length + LIST_PROJECTS.length;
  const onTrackCount = useMemo(
    () =>
      PINNED_PROJECTS.filter((p) => p.status === 'on-track').length +
      LIST_PROJECTS.filter((p) => p.status === 'on-track').length,
    [],
  );
  const attentionCount = useMemo(
    () =>
      PINNED_PROJECTS.filter((p) => p.status === 'attention').length +
      LIST_PROJECTS.filter((p) => p.status === 'review').length,
    [],
  );

  const filterOptions: FilterPillOption[] = [
    { key: 'active', label: 'Active', count: totalCount },
    {
      key: 'on-track',
      label: 'On Track',
      count: onTrackCount,
      dotColor: '#14804A',
    },
    {
      key: 'attention',
      label: 'Attention',
      count: attentionCount,
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
        if (activeFilter === 'on-track') return project.status === 'on-track';
        if (activeFilter === 'attention') return project.status === 'attention';
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
      if (activeFilter === 'on-track') return project.status === 'on-track';
      if (activeFilter === 'attention') return project.status === 'review';
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
          All initiatives in Acme Studio
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
