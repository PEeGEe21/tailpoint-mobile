import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { FeedbackState } from '@/components/feedback-state';
import { Button, Card, Field, Progress } from '@/components/ui/primitives';
import { AlertDialog, BottomSheet, Toast } from '@/components/ui/overlays';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteProject,
  getProject,
  getProjectMembers,
  inviteProjectMembers,
  listProjectInviteCandidates,
  listProjectActivity,
  listPinnedProjectIds,
  setProjectPinned,
  updateProject,
} from '@/features/projects/project-api';
import { mapProjectDetail } from '@/features/projects/project-mappers';
import type { ProjectDetail } from '@/features/projects/types';
import { useSessionStore } from '@/auth/session-store';
import { queryKeys } from '@/api/query-keys';
import { updateTaskStatus } from '@/features/tasks/task-api';

type DetailTab = 'overview' | 'tasks' | 'activity';
type TaskFilter = 'all' | 'open' | 'completed';
const statusLabels = {
  active: 'Active',
  upcoming: 'Upcoming',
  in_progress: 'In progress',
  inactive: 'Inactive',
  completed: 'Completed',
  cancelled: 'Cancelled',
  on_hold: 'On hold',
  paused: 'Paused',
  on_review: 'In review',
  overdue: 'Overdue',
  draft: 'Draft',
} as const;

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const { id, saved } = useLocalSearchParams<{
    id?: string | string[];
    saved?: string;
  }>();
  const projectId = Array.isArray(id) ? id[0] : id;
  const numericProjectId = Number(projectId);
  const organizationId = useSessionStore((state) => state.organizationId);
  const queryClient = useQueryClient();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<
    'viewer' | 'contributor' | 'editor'
  >('contributor');
  const [selectedMemberEmails, setSelectedMemberEmails] = useState<string[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] =
    useState<ProjectDetail['status']>('active');
  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(
      organizationId ?? 'none',
      numericProjectId,
    ),
    queryFn: () => getProject(numericProjectId),
    enabled: Boolean(organizationId && Number.isFinite(numericProjectId)),
  });
  const pinsQuery = useQuery({
    queryKey: queryKeys.projects.pinned(organizationId ?? 'none'),
    queryFn: listPinnedProjectIds,
    enabled: Boolean(organizationId),
  });
  const membersQuery = useQuery({
    queryKey: queryKeys.projects.members(
      organizationId ?? 'none',
      numericProjectId,
    ),
    queryFn: () => getProjectMembers(numericProjectId),
    enabled: Boolean(organizationId && Number.isFinite(numericProjectId)),
  });
  const activityQuery = useQuery({
    queryKey: queryKeys.projects.activity(
      organizationId ?? 'none',
      numericProjectId,
    ),
    queryFn: () => listProjectActivity(numericProjectId),
    enabled: Boolean(organizationId && Number.isFinite(numericProjectId)),
  });
  const candidatesQuery = useQuery({
    queryKey: queryKeys.projects.inviteCandidates(
      organizationId ?? 'none',
      numericProjectId,
      memberEmail,
    ),
    queryFn: () => listProjectInviteCandidates(numericProjectId, memberEmail),
    enabled: Boolean(memberOpen && organizationId),
    staleTime: 0,
  });
  const [tab, setTab] = useState<DetailTab>('overview');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const baseProject = mapProjectDetail(
    numericProjectId,
    projectQuery.data ?? {},
  );
  const canonicalMembers = (membersQuery.data ?? []).map((value) => {
    const membership = value as Record<string, unknown>;
    const user =
      typeof membership.user === 'object' && membership.user !== null
        ? (membership.user as Record<string, unknown>)
        : membership;
    const name =
      String(user.fullName ?? '').trim() ||
      `${String(user.first_name ?? '')} ${String(user.last_name ?? '')}`.trim() ||
      String(user.email ?? 'Member');
    return {
      id: String(user.id ?? membership.id),
      name,
      role: String(membership.role ?? 'Member'),
      initials: name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      color: '#667085',
    };
  });
  const project = {
    ...baseProject,
    members: canonicalMembers.length ? canonicalMembers : baseProject.members,
  };
  const isPinned = (pinsQuery.data ?? []).includes(numericProjectId);
  const refreshProjects = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(organizationId ?? 'none'),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(
          organizationId ?? 'none',
          numericProjectId,
        ),
      }),
    ]);
  }, [numericProjectId, organizationId, queryClient]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProjects();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProjects]);
  const pinMutation = useMutation({
    mutationFn: () => setProjectPinned(numericProjectId, !isPinned),
    onMutate: async () => {
      const key = queryKeys.projects.pinned(organizationId ?? 'none');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<number[]>(key) ?? [];
      queryClient.setQueryData<number[]>(
        key,
        isPinned
          ? previous.filter((id) => id !== numericProjectId)
          : [...new Set([...previous, numericProjectId])],
      );
      setOptionsOpen(false);
      return { key, previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: async () => {
      setOptionsOpen(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.pinned(organizationId ?? 'none'),
      });
    },
  });
  const editMutation = useMutation({
    mutationFn: () =>
      updateProject(numericProjectId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
      }),
    onSuccess: async () => {
      setEditOpen(false);
      setSuccessMessage('Project saved successfully.');
      await refreshProjects();
    },
  });
  const inviteMutation = useMutation({
    mutationFn: () => {
      const typedEmail = memberEmail.trim();
      const emails = [
        ...selectedMemberEmails,
        ...(typedEmail.includes('@') ? [typedEmail] : []),
      ];

      return inviteProjectMembers(
        numericProjectId,
        [...new Set(emails)],
        memberRole,
      );
    },
    onSuccess: async () => {
      setMemberOpen(false);
      setMemberEmail('');
      setSelectedMemberEmails([]);
      setSuccessMessage('Project invitation sent.');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.members(
            organizationId ?? 'none',
            numericProjectId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(
            organizationId ?? 'none',
            numericProjectId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects
            .inviteCandidates(organizationId ?? 'none', numericProjectId, '')
            .slice(0, -1),
        }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(numericProjectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(organizationId ?? 'none'),
      });
      router.replace('/projects' as never);
    },
  });
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, statusId }: { taskId: number; statusId: number }) =>
      updateTaskStatus(taskId, statusId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(
            organizationId ?? 'none',
            numericProjectId,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
        }),
      ]);
    },
  });
  if (projectQuery.isPending)
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <FeedbackState
          description="Syncing project details and tasks."
          title="Loading project"
          variant="loading"
        />
      </SafeAreaView>
    );
  if (!projectQuery.data)
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <FeedbackState
          actionLabel="Try again"
          description="This project could not be loaded from the workspace."
          onAction={() => void projectQuery.refetch()}
          title="Unable to load project"
          variant="error"
        />
      </SafeAreaView>
    );
  const statusColor = ['active', 'completed'].includes(project.status)
    ? theme.success
    : ['overdue', 'cancelled'].includes(project.status)
      ? theme.danger
      : ['on_hold', 'paused'].includes(project.status)
        ? theme.warning
        : theme.info;
  const completed = project.tasks.filter((task) => task.isTerminal).length;
  const filteredTasks = project.tasks.filter(
    (task) =>
      (taskFilter === 'all'
        ? true
        : taskFilter === 'completed'
          ? task.isTerminal
          : !task.isTerminal) &&
      task.title.toLowerCase().includes(taskSearch.trim().toLowerCase()),
  );
  const rawProject = projectQuery.data as Record<string, unknown>;
  const terminalStatus = Array.isArray(rawProject.statuses)
    ? (rawProject.statuses as Record<string, unknown>[]).find((status) =>
        Boolean(status.isTerminal ?? status.is_terminal),
      )
    : undefined;

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={[styles.navigation, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Back to projects"
          onPress={() => router.push('/projects')}
          style={styles.navButton}
        >
          <MaterialIcons color={theme.text} name="arrow-back" size={24} />
        </Pressable>
        <ThemedText style={styles.navigationTitle}>Project details</ThemedText>
        <Pressable
          accessibilityLabel="Project options"
          onPress={() => setOptionsOpen(true)}
          style={styles.navButton}
        >
          <MaterialIcons color={theme.text} name="more-horiz" size={24} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0EA5E9"
            colors={['#0EA5E9']}
            progressBackgroundColor="#F8FAFC"
            progressViewOffset={20}
          />
        }
      >
        <View style={[styles.hero, { backgroundColor: theme.ink }]}>
          <View
            pointerEvents="none"
            style={[styles.heroOrb, { backgroundColor: `${theme.info}30` }]}
          />
          <View style={styles.eyebrowRow}>
            <Pill label={project.tag} color={theme.info} />
            <Pill
              label={statusLabels[project.status]}
              color={statusColor}
              dot
            />
            {project.health ? (
              <Pill
                label={`${project.health === 'healthy' ? 'Healthy' : project.health === 'at_risk' ? 'At risk' : 'Blocked'} health`}
                color={
                  project.health === 'healthy' ? theme.success : theme.warning
                }
              />
            ) : null}
          </View>
          <ThemedText style={[styles.title, styles.heroTitle]}>
            {project.title}
          </ThemedText>
          <ThemedText style={[styles.description, styles.heroDescription]}>
            {project.description}
          </ThemedText>
        </View>
        <Card style={[styles.progressCard, styles.liftedCard]}>
          <View style={styles.rowBetween}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Overall progress
              </ThemedText>
              <ThemedText style={styles.progressValue}>
                {project.progressPercent}%
              </ThemedText>
            </View>
            <View
              style={[
                styles.dueBox,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <MaterialIcons color={theme.primary} name="event" size={18} />
              <View>
                <ThemedText style={styles.micro} themeColor="textSecondary">
                  Due date
                </ThemedText>
                <ThemedText style={styles.dueValue}>
                  {project.dueLabel}
                </ThemedText>
              </View>
            </View>
          </View>
          <Progress value={project.progressPercent / 100} />
          <View style={styles.stats}>
            <Stat
              value={`${project.completedTaskCount}/${project.tasks.length}`}
              label="Tasks"
            />
            <Stat
              value={String(project.milestones.length)}
              label="Milestones"
            />
            <Stat value={String(project.members.length)} label="Members" />
          </View>
        </Card>
        <View
          accessibilityRole="tablist"
          style={[
            styles.tabs,
            {
              borderColor: theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        >
          {(['overview', 'tasks', 'activity'] as DetailTab[]).map((item) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === item }}
              key={item}
              onPress={() => setTab(item)}
              style={[
                styles.tab,
                tab === item && { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: tab === item ? theme.primary : theme.textSecondary },
                ]}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {tab === 'overview' ? (
          <Overview onAddMember={() => setMemberOpen(true)} project={project} />
        ) : null}
        {tab === 'tasks' ? (
          <>
            <SectionTitle
              title="Project tasks"
              action={`${completed} completed`}
            />
            <View style={[styles.taskSearch, { borderColor: theme.border }]}>
              <MaterialIcons
                color={theme.textSecondary}
                name="search"
                size={19}
              />
              <TextInput
                onChangeText={setTaskSearch}
                placeholder="Search project tasks"
                placeholderTextColor={theme.textSecondary}
                style={[styles.taskSearchInput, { color: theme.text }]}
                value={taskSearch}
              />
            </View>
            <View style={styles.taskFilters}>
              {(['all', 'open', 'completed'] as TaskFilter[]).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setTaskFilter(filter)}
                  style={[
                    styles.taskFilter,
                    {
                      borderColor:
                        taskFilter === filter ? theme.primary : theme.border,
                      backgroundColor:
                        taskFilter === filter
                          ? theme.backgroundSelected
                          : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={
                      taskFilter === filter
                        ? { color: theme.primary }
                        : undefined
                    }
                  >
                    {filter[0].toUpperCase() + filter.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <Card style={styles.listCard}>
              {filteredTasks.map((task, index) => {
                const done = task.isTerminal;
                return (
                  <View
                    key={task.id}
                    style={[
                      styles.itemRow,
                      index > 0 && {
                        borderTopColor: theme.border,
                        borderTopWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityLabel={
                        done ? 'Mark task incomplete' : 'Mark task complete'
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done }}
                      hitSlop={8}
                      disabled={
                        done ||
                        !terminalStatus ||
                        completeTaskMutation.isPending
                      }
                      onPress={() =>
                        terminalStatus &&
                        completeTaskMutation.mutate({
                          taskId: Number(task.id),
                          statusId: Number(terminalStatus.id),
                        })
                      }
                      style={[
                        styles.checkbox,
                        {
                          borderColor: done ? theme.primary : theme.border,
                          backgroundColor: done ? theme.primary : 'transparent',
                        },
                      ]}
                    >
                      {done ? (
                        <MaterialIcons color="#FFFFFF" name="check" size={16} />
                      ) : null}
                    </Pressable>
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => router.push(`/tasks/${task.id}` as never)}
                      style={styles.grow}
                    >
                      <ThemedText
                        style={[styles.itemTitle, done && styles.completed]}
                      >
                        {task.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {task.status} · {task.assignee.name} · {task.dueLabel}
                      </ThemedText>
                      {(task.attachmentCount ?? 0) > 0 ? (
                        <View style={styles.taskAttachmentMeta}>
                          <MaterialIcons
                            color={theme.textSecondary}
                            name="attach-file"
                            size={14}
                          />
                          <ThemedText type="small" themeColor="textSecondary">
                            {task.attachmentCount ?? 0}
                          </ThemedText>
                        </View>
                      ) : null}
                    </Pressable>
                    <View
                      style={[
                        styles.priority,
                        {
                          backgroundColor:
                            task.priority === 'high'
                              ? theme.danger
                              : task.priority === 'medium'
                                ? theme.warning
                                : theme.success,
                        },
                      ]}
                    />
                  </View>
                );
              })}
              {filteredTasks.length === 0 ? (
                <ThemedText
                  style={styles.emptyTasks}
                  themeColor="textSecondary"
                >
                  No tasks match this filter.
                </ThemedText>
              ) : null}
            </Card>
          </>
        ) : null}
        {tab === 'activity' ? (
          <>
            <SectionTitle title="Recent activity" />
            <Card style={styles.listCard}>
              {(activityQuery.data ?? []).map((value, index) => {
                const item = value as Record<string, unknown>;
                const user =
                  typeof item.user === 'object' && item.user !== null
                    ? (item.user as Record<string, unknown>)
                    : {};
                const actor =
                  String(user.fullName ?? '').trim() ||
                  `${String(user.first_name ?? '')} ${String(user.last_name ?? '')}`.trim() ||
                  'A team member';
                return (
                  <View
                    key={String(item.id ?? index)}
                    style={[
                      styles.activityRow,
                      index > 0 && {
                        borderTopColor: theme.border,
                        borderTopWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.activityDot,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                    <View style={styles.grow}>
                      <ThemedText style={styles.body}>
                        <ThemedText style={styles.itemTitle}>
                          {actor}
                        </ThemedText>{' '}
                        {String(item.description ?? 'updated the project')}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {typeof item.created_at === 'string'
                          ? new Date(item.created_at).toLocaleString()
                          : 'Recently'}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
              {!activityQuery.isPending &&
              (activityQuery.data ?? []).length === 0 ? (
                <EmptyProjectSection
                  icon="history"
                  message="No project activity has been recorded yet."
                />
              ) : null}
            </Card>
          </>
        ) : null}
      </ScrollView>
      <BottomSheet
        onClose={() => setOptionsOpen(false)}
        title="Project options"
        visible={optionsOpen}
      >
        <OptionRow
          icon={isPinned ? 'push-pin' : 'push-pin'}
          label={isPinned ? 'Unpin project' : 'Pin project'}
          onPress={() => pinMutation.mutate()}
        />
        <OptionRow
          icon="add-task"
          label="Create task"
          onPress={() => {
            setOptionsOpen(false);
            router.push(
              `/tasks/new?projectId=${numericProjectId}&returnTo=/projects/${numericProjectId}` as never,
            );
          }}
        />
        <OptionRow
          icon="edit"
          label="Edit project"
          onPress={() => {
            setEditTitle(project.title);
            setEditDescription(project.description);
            setEditStatus(project.status);
            setOptionsOpen(false);
            setEditOpen(true);
          }}
        />
        <OptionRow
          danger
          icon="delete-outline"
          label="Delete project"
          onPress={() => {
            setOptionsOpen(false);
            setDeleteOpen(true);
          }}
        />
      </BottomSheet>
      <BottomSheet
        onClose={() => setMemberOpen(false)}
        title="Share this project"
        visible={memberOpen}
      >
        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          label="Search peers or enter an email"
          onChangeText={setMemberEmail}
          placeholder="member@example.com"
          value={memberEmail}
        />
        <ThemedText type="smallBold">Project role</ThemedText>
        <View style={styles.statusOptions}>
          {(['viewer', 'contributor', 'editor'] as const).map((role) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: memberRole === role }}
              key={role}
              onPress={() => setMemberRole(role)}
              style={[
                styles.statusOption,
                {
                  borderColor:
                    memberRole === role ? theme.primary : theme.border,
                  backgroundColor:
                    memberRole === role
                      ? theme.backgroundSelected
                      : theme.backgroundElement,
                },
              ]}
            >
              <ThemedText type="smallBold">
                {role[0].toUpperCase() + role.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {(candidatesQuery.data ?? []).map((value) => {
          const candidate = value as Record<string, unknown>;
          const email = String(candidate.email ?? '');
          const selected = selectedMemberEmails.includes(email);
          return (
            <Pressable
              key={String(candidate.id ?? email)}
              onPress={() =>
                setSelectedMemberEmails((current) =>
                  selected
                    ? current.filter((item) => item !== email)
                    : [...current, email],
                )
              }
              style={[styles.optionRow, { borderColor: theme.border }]}
            >
              <MaterialIcons
                color={selected ? theme.primary : theme.textSecondary}
                name={selected ? 'check-circle' : 'person-outline'}
                size={21}
              />
              <View style={styles.grow}>
                <ThemedText type="smallBold">
                  {String(candidate.full_name ?? email)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {email}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
        <Button
          disabled={
            (!memberEmail.trim().includes('@') &&
              selectedMemberEmails.length === 0) ||
            inviteMutation.isPending
          }
          loading={inviteMutation.isPending}
          onPress={() => inviteMutation.mutate()}
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
          {inviteMutation.isPending ? 'Sending…' : 'Send invitation'}
        </Button>
      </BottomSheet>
      <BottomSheet
        onClose={() => setEditOpen(false)}
        title="Edit project"
        visible={editOpen}
      >
        <Field
          label="Project title"
          onChangeText={setEditTitle}
          value={editTitle}
        />
        <Field
          label="Description"
          multiline
          onChangeText={setEditDescription}
          value={editDescription}
        />
        <View style={styles.statusField}>
          <ThemedText type="smallBold">Project status</ThemedText>
          <View style={styles.statusOptions}>
            {Object.entries(statusLabels).map(([value, label]) => {
              const selected = editStatus === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={value}
                  onPress={() =>
                    setEditStatus(value as ProjectDetail['status'])
                  }
                  style={[
                    styles.statusOption,
                    {
                      borderColor: selected ? theme.primary : theme.border,
                      backgroundColor: selected
                        ? theme.backgroundSelected
                        : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={selected ? { color: theme.primary } : undefined}
                  >
                    {label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Button
          disabled={!editTitle.trim() || editMutation.isPending}
          loading={editMutation.isPending}
          onPress={() => editMutation.mutate()}
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
          {editMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </BottomSheet>
      <AlertDialog
        body={`Delete “${project.title}”? This cannot be undone.`}
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete project'}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete project"
        visible={deleteOpen}
      />
      {pinMutation.isError ||
      editMutation.isError ||
      deleteMutation.isError ||
      inviteMutation.isError ? (
        <Toast message="The project change could not be saved." />
      ) : null}
      {completeTaskMutation.isError ? (
        <Toast message="The task could not be marked complete." />
      ) : null}
      {saved === 'created' || successMessage ? (
        <Toast
          message={successMessage ?? 'Project created successfully.'}
          onDismiss={() => setSuccessMessage(null)}
          variant="success"
        />
      ) : null}
    </SafeAreaView>
  );
}

function OptionRow({
  danger,
  icon,
  label,
  onPress,
}: {
  danger?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;
  return (
    <Pressable onPress={onPress} style={styles.optionRow}>
      <MaterialIcons color={color} name={icon} size={21} />
      <ThemedText style={[styles.grow, { color }]}>{label}</ThemedText>
      <MaterialIcons
        color={theme.textSecondary}
        name="chevron-right"
        size={20}
      />
    </Pressable>
  );
}

function Overview({
  onAddMember,
  project,
}: {
  onAddMember: () => void;
  project: ProjectDetail;
}) {
  const theme = useTheme();
  return (
    <>
      <SectionTitle title="Milestones" action="View all" />
      <Card style={styles.listCard}>
        {project.milestones.length === 0 ? (
          <EmptyProjectSection
            icon="flag"
            message="No milestones have been added yet."
          />
        ) : null}
        {project.milestones.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              index > 0 && {
                borderTopColor: theme.border,
                borderTopWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View
              style={[
                styles.roundIcon,
                {
                  backgroundColor: item.completed
                    ? `${theme.success}1A`
                    : theme.backgroundSelected,
                },
              ]}
            >
              <MaterialIcons
                color={item.completed ? theme.success : theme.primary}
                name={item.completed ? 'check' : 'flag'}
                size={18}
              />
            </View>
            <View style={styles.grow}>
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.completed ? 'Completed' : `Due ${item.dateLabel}`}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
      <View style={styles.sectionTitle}>
        <ThemedText style={styles.sectionHeading}>Team</ThemedText>
        <Pressable onPress={onAddMember} style={styles.inlineAction}>
          <MaterialIcons color={theme.primary} name="person-add" size={17} />
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            Add member
          </ThemedText>
        </Pressable>
      </View>
      <Card style={styles.listCard}>
        {project.members.length === 0 ? (
          <EmptyProjectSection
            icon="group"
            message="No team members have been added yet."
          />
        ) : null}
        {project.members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={[styles.avatar, { backgroundColor: member.color }]}>
              <ThemedText style={styles.avatarText}>
                {member.initials}
              </ThemedText>
            </View>
            <View style={styles.grow}>
              <ThemedText style={styles.itemTitle}>{member.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {member.role}
              </ThemedText>
            </View>
            <MaterialIcons
              color={theme.textSecondary}
              name="chevron-right"
              size={20}
            />
          </View>
        ))}
      </Card>
    </>
  );
}

function EmptyProjectSection({
  icon,
  message,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  message: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.emptySection}>
      <View
        style={[
          styles.emptySectionIcon,
          { backgroundColor: theme.backgroundSelected },
        ]}
      >
        <MaterialIcons color={theme.textSecondary} name={icon} size={22} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {message}
      </ThemedText>
    </View>
  );
}

function Pill({
  label,
  color,
  dot,
}: {
  label: string;
  color: string;
  dot?: boolean;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}1A` }]}>
      {dot ? (
        <View style={[styles.pillDot, { backgroundColor: color }]} />
      ) : null}
      <ThemedText style={[styles.pillText, { color }]}>{label}</ThemedText>
    </View>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.micro} themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}
function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText style={styles.sectionHeading}>{title}</ThemedText>
      {action ? (
        <ThemedText type="small" themeColor="textSecondary">
          {action}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  navigation: {
    minHeight: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navigationTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: Spacing.three, paddingBottom: 120, gap: Spacing.three },
  hero: {
    minHeight: 220,
    padding: 20,
    paddingBottom: 48,
    borderRadius: 28,
    gap: Spacing.two,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroOrb: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -68,
    top: -82,
  },
  eyebrowRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21 },
  heroTitle: { color: '#FFFFFF', maxWidth: 310 },
  heroDescription: { color: '#D7E4ED', maxWidth: 330 },
  progressCard: { gap: Spacing.three },
  liftedCard: { marginTop: -42, marginHorizontal: 12 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  progressValue: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dueValue: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  micro: { fontSize: 11, lineHeight: 15 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
  },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  statusField: { gap: Spacing.two },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  statusOption: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  sectionTitle: {
    marginTop: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: { fontSize: 17, fontWeight: '700' },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  listCard: { paddingVertical: 4, gap: 0 },
  emptySection: {
    minHeight: 120,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptySectionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskFilters: { flexDirection: 'row', gap: Spacing.two },
  taskSearch: {
    minHeight: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskSearchInput: { flex: 1, minHeight: 44 },
  taskAttachmentMeta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  taskFilter: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTasks: { textAlign: 'center', paddingVertical: Spacing.four },
  itemRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 10,
  },
  roundIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
  optionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemTitle: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  memberRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: { textDecorationLine: 'line-through', opacity: 0.6 },
  priority: { width: 8, height: 8, borderRadius: 4 },
  activityRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  activityDot: { width: 9, height: 9, borderRadius: 5, marginTop: 6 },
  body: { fontSize: 14, lineHeight: 20 },
});
