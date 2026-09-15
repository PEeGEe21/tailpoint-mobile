import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
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
import { FeedbackState } from '@/components/feedback-state';
import { queryKeys } from '@/api/query-keys';
import {
  createProject,
  listPinnedProjectIds,
  listProjects,
} from '@/features/projects/project-api';
import {
  mapPinnedProject,
  mapProjectListItem,
} from '@/features/projects/project-mappers';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useSessionStore } from '@/auth/session-store';
import { Button, Field } from '@/components/ui/primitives';
import { BottomSheet, Toast } from '@/components/ui/overlays';

export default function ProjectsScreen() {
  const theme = useTheme();
  const organizationName = useSessionStore((state) => state.organization?.name);
  const organizationId = useSessionStore((state) => state.organizationId);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (value) => {
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(organizationId ?? 'none'),
      });
      const created = value as { id?: number };
      if (created?.id)
        router.push(`/projects/${created.id}?saved=created` as never);
    },
  });

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.all(organizationId ?? 'none'),
    queryFn: () => listProjects(),
    enabled: Boolean(organizationId),
  });
  const pinsQuery = useQuery({
    queryKey: queryKeys.projects.pinned(organizationId ?? 'none'),
    queryFn: listPinnedProjectIds,
    enabled: Boolean(organizationId),
  });
  const projects = useMemo(
    () =>
      (projectsQuery.data ?? []).map((project) => mapProjectListItem(project)),
    [projectsQuery.data],
  );
  const pinnedProjects = useMemo(() => {
    const ids = new Set(pinsQuery.data ?? []);
    return (projectsQuery.data ?? [])
      .filter((project) => ids.has(project.id))
      .map(mapPinnedProject);
  }, [pinsQuery.data, projectsQuery.data]);
  const totalCount = projects.length;
  const inProgressCount = useMemo(
    () => projects.filter((p) => p.status === 'in_progress').length,
    [projects],
  );
  const reviewCount = useMemo(
    () => projects.filter((p) => p.status === 'on_review').length,
    [projects],
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
      count: pinnedProjects.length,
      icon: 'push-pin',
    },
  ];

  const query = search.trim().toLowerCase();

  const visiblePinned = useMemo(
    () =>
      pinnedProjects.filter((project) => {
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
    [query, activeFilter, pinnedProjects],
  );

  const visibleList = useMemo(() => {
    if (activeFilter === 'pinned') return [];
    return projects.filter((project) => {
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
  }, [query, activeFilter, projects]);

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
          <View style={styles.titleWithAction}>
            <ThemedText style={styles.title}>Projects</ThemedText>
            <TouchableOpacity
              accessibilityLabel="Create project"
              accessibilityRole="button"
              activeOpacity={0.7}
              hitSlop={12}
              onPress={() => setCreateOpen(true)}
              style={[styles.addButton, { backgroundColor: theme.primary }]}
            >
              <MaterialIcons
                color="#FFFFFF"
                name="add"
                pointerEvents="none"
                size={20}
              />
            </TouchableOpacity>
          </View>
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

      {projectsQuery.isPending ? (
        <FeedbackState
          description="Syncing projects from your workspace."
          title="Loading projects"
          variant="loading"
        />
      ) : projectsQuery.isError ? (
        <FeedbackState
          actionLabel="Try again"
          description="Projects could not be loaded from the workspace."
          onAction={() => void projectsQuery.refetch()}
          title="Unable to load projects"
          variant="error"
        />
      ) : null}

      {!projectsQuery.isPending &&
      !projectsQuery.isError &&
      visiblePinned.length > 0 ? (
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

      {!projectsQuery.isPending &&
      !projectsQuery.isError &&
      activeFilter !== 'pinned' ? (
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
      <BottomSheet
        onClose={() => setCreateOpen(false)}
        title="Create project"
        visible={createOpen}
      >
        <Field
          label="Project title"
          onChangeText={setTitle}
          placeholder="e.g. Mobile launch"
          value={title}
        />
        <Field
          label="Description"
          multiline
          onChangeText={setDescription}
          placeholder="What is this project for?"
          value={description}
        />

        <Button
          disabled={!title.trim() || createMutation.isPending}
          loading={createMutation.isPending}
          onPress={() =>
            createMutation.mutate({
              title: title.trim(),
              description: description.trim(),
            })
          }
          style={{
            width: '100%',
            height: 52,
            marginTop: 22,
            borderRadius: 13,
            backgroundColor: '#008080',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {createMutation.isPending ? 'Creating…' : 'Create project'}
        </Button>
      </BottomSheet>
      {createMutation.isError ? (
        <Toast message="Project could not be created." />
      ) : null}
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
  titleWithAction: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
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
