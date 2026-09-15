import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { FormField } from '@/features/auth/form-field';
import { useTheme } from '@/hooks/use-theme';
import { taskFormSchema, type TaskFormValues } from './schema';
import {
  createTask,
  getTask,
  updateTask,
  uploadTaskAttachment,
} from './task-api';
import { mapTask } from './task-mappers';
import {
  getProject,
  getProjectMembers,
  listProjects,
} from '@/features/projects/project-api';
import { useSessionStore } from '@/auth/session-store';
import { queryKeys } from '@/api/query-keys';
import type { ProjectMember } from './types';
import { BottomSheet, Toast } from '@/components/ui/overlays';

const defaults: TaskFormValues = {
  title: '',
  description: '',
  projectId: 0,
  priority: 2,
  severity: 'medium',
  statusId: 0,
  dueDate: null,
  assigneeIds: [],
};

export function TaskFormScreen({ taskId }: { taskId?: string }) {
  const theme = useTheme();
  const { projectId: routeProjectId } = useLocalSearchParams<{
    projectId?: string;
    returnTo?: string;
  }>();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const numericTaskId = taskId ? Number(taskId) : undefined;
  const organizationId = useSessionStore((state) => state.organizationId);
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.all(organizationId ?? 'none'),
    queryFn: () => listProjects(),
    enabled: Boolean(organizationId),
  });
  const taskQuery = useQuery({
    queryKey: queryKeys.tasks.detail(
      organizationId ?? 'none',
      numericTaskId ?? 0,
    ),
    queryFn: () => getTask(numericTaskId!),
    enabled: Boolean(organizationId && numericTaskId),
  });
  const task = useMemo(
    () => (taskQuery.data ? mapTask(taskQuery.data) : null),
    [taskQuery.data],
  );
  const [memberQuery, setMemberQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<
    {
      uri: string;
      name: string;
      mimeType?: string | null;
    }[]
  >([]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaults,
  });
  const projectId = useWatch({ control, name: 'projectId' });
  const dueDate = useWatch({ control, name: 'dueDate' });
  const assigneeIds = useWatch({ control, name: 'assigneeIds' });
  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(
      organizationId ?? 'none',
      projectId || 0,
    ),
    queryFn: () => getProject(projectId),
    enabled: Boolean(organizationId && projectId),
  });
  const membersQuery = useQuery({
    queryKey: queryKeys.projects.members(
      organizationId ?? 'none',
      projectId || 0,
    ),
    queryFn: () => getProjectMembers(projectId),
    enabled: Boolean(organizationId && projectId),
  });
  const { projectMembers, workflowStatuses } = useMemo(() => {
    const overview =
      typeof projectQuery.data === 'object' && projectQuery.data !== null
        ? (projectQuery.data as Record<string, unknown>)
        : {};
    const statuses = Array.isArray(overview.statuses)
      ? (overview.statuses as Record<string, unknown>[])
      : [];
    const members: ProjectMember[] = (membersQuery.data ?? []).map((value) => {
      const membership = value as Record<string, unknown>;
      const member =
        typeof membership.user === 'object' && membership.user !== null
          ? (membership.user as Record<string, unknown>)
          : membership;
      const name =
        `${String(member.first_name ?? '')} ${String(member.last_name ?? '')}`.trim() ||
        String(member.email ?? 'Member');
      return {
        id: Number(member.id),
        name,
        email: String(member.email ?? ''),
        initials: name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        role: String(membership.role ?? member.role ?? ''),
        avatarColor: '#D7E4ED',
      };
    });
    return { projectMembers: members, workflowStatuses: statuses };
  }, [membersQuery.data, projectQuery.data]);
  const projects = useMemo(
    () => projectsQuery.data ?? [],
    [projectsQuery.data],
  );

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        projectId: task.project.id,
        priority: task.priority,
        severity: task.severity,
        statusId: task.status.id,
        dueDate: task.due_date,
        assigneeIds: task.assignees.map((item) => item.id),
      });
      return;
    }
    const requestedProject = Number(routeProjectId);
    const firstProject = projects[0];
    if (!numericTaskId && projectId === 0) {
      if (Number.isFinite(requestedProject) && requestedProject > 0)
        setValue('projectId', requestedProject);
      else if (firstProject) setValue('projectId', firstProject.id);
    }
  }, [
    numericTaskId,
    projectId,
    projects,
    reset,
    routeProjectId,
    setValue,
    task,
  ]);

  useEffect(() => {
    if (projectId && workflowStatuses.length && !task)
      setValue('statusId', Number(workflowStatuses[0].id));
  }, [projectId, setValue, task, workflowStatuses]);
  const members = useMemo(
    () =>
      projectMembers.filter((member) =>
        `${member.name} ${member.email}`
          .toLowerCase()
          .includes(memberQuery.trim().toLowerCase()),
      ),
    [memberQuery, projectMembers],
  );
  const submit = async (values: TaskFormValues) => {
    setSubmitError(null);
    const assignees = projectMembers
      .filter((member) => values.assigneeIds.includes(member.id))
      .map((member) => member.email)
      .join(',');
    const body = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      severity: values.severity,
      due_date: values.dueDate,
      status: values.statusId,
      assignees,
    };
    try {
      const saved = numericTaskId
        ? await updateTask(numericTaskId, body)
        : await createTask(values.projectId, body);
      const savedId = Number(
        (saved as { id?: number } | undefined)?.id ?? numericTaskId,
      );
      if (!Number.isFinite(savedId))
        throw new Error('The saved task did not include an ID.');
      for (const attachment of attachments) {
        await uploadTaskAttachment(savedId, values.projectId, attachment);
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
      });
      router.replace(`/tasks/${savedId}?saved=1` as never);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Task could not be saved.',
      );
    }
  };
  const chooseDate = (_event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (value)
      setValue('dueDate', value.toISOString(), { shouldValidate: true });
  };
  const pickAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
    });
    if (result.canceled) return;
    setAttachments((current) => [
      ...current,
      ...result.assets.map((file) => ({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
      })),
    ]);
  };
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Close task form"
          onPress={() =>
            returnTo ? router.replace(returnTo as never) : router.back()
          }
          style={styles.iconButton}
        >
          <MaterialIcons color={theme.text} name="close" size={24} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {task ? 'Edit task' : 'Create task'}
        </ThemedText>
        <View style={styles.iconButton} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.intro, { backgroundColor: theme.ink }]}>
          <ThemedText style={styles.introEyebrow}>
            WORKFLOW-READY TASK
          </ThemedText>
          <ThemedText style={styles.introTitle}>
            {task ? 'Update task details' : 'Define the next move'}
          </ThemedText>
          <ThemedText style={styles.introDescription}>
            The fields below map directly to the task contract.
          </ThemedText>
        </View>
        <FormField
          control={control}
          label="Task title"
          name="title"
          placeholder="e.g. Review release checklist"
        />
        <FormField
          control={control}
          label="Description"
          multiline
          name="description"
          numberOfLines={4}
          placeholder="Add context or acceptance criteria"
          style={styles.textArea}
          textAlignVertical="top"
        />
        <ChoiceField
          control={control}
          label="Project"
          name="projectId"
          options={projects.map((item) => ({
            label: item.title,
            value: item.id,
          }))}
          onSelect={(value) => setValue('statusId', 0)}
        />
        <ChoiceField
          control={control}
          label="Workflow status"
          name="statusId"
          options={workflowStatuses.map((item) => ({
            label: String(item.title),
            value: Number(item.id),
          }))}
        />
        <ChoiceField
          control={control}
          label="Priority"
          name="priority"
          options={[0, 1, 2, 3, 4].map((value) => ({
            label: value === 0 ? 'None (0)' : `${value}`,
            value,
          }))}
        />
        <ChoiceField
          control={control}
          label="Severity"
          name="severity"
          options={[
            { label: 'None', value: null },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ]}
        />
        <View style={styles.field}>
          <ThemedText type="smallBold">Due date</ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.selector,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <MaterialIcons color={theme.primary} name="event" size={20} />
            <ThemedText style={styles.selectorText}>
              {dueDate
                ? new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                  }).format(new Date(dueDate))
                : 'No due date'}
            </ThemedText>
            <MaterialIcons
              color={theme.textSecondary}
              name="expand-more"
              size={20}
            />
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              mode="date"
              onChange={chooseDate}
              value={dueDate ? new Date(dueDate) : new Date()}
            />
          ) : null}
        </View>
        <View style={styles.field}>
          <ThemedText type="smallBold">Assignees</ThemedText>
          <View
            style={[
              styles.search,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <MaterialIcons
              color={theme.textSecondary}
              name="search"
              size={19}
            />
            <TextInput
              accessibilityLabel="Search project members"
              onChangeText={setMemberQuery}
              placeholder="Search name or email"
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
              value={memberQuery}
            />
          </View>
          <Controller
            control={control}
            name="assigneeIds"
            render={({ field, fieldState }) => (
              <>
                <View style={styles.memberList}>
                  {members.map((member) => {
                    const selected = field.value.includes(member.id);
                    return (
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        key={member.id}
                        onPress={() =>
                          field.onChange(
                            selected
                              ? field.value.filter((id) => id !== member.id)
                              : [...field.value, member.id],
                          )
                        }
                        style={[
                          styles.member,
                          {
                            borderColor: selected
                              ? theme.primary
                              : theme.border,
                            backgroundColor: selected
                              ? theme.backgroundSelected
                              : theme.backgroundElement,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.avatar,
                            { backgroundColor: member.avatarColor },
                          ]}
                        >
                          <ThemedText style={styles.avatarText}>
                            {member.initials}
                          </ThemedText>
                        </View>
                        <View style={styles.grow}>
                          <ThemedText type="smallBold">
                            {member.name}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {member.email}
                          </ThemedText>
                        </View>
                        {selected ? (
                          <MaterialIcons
                            color={theme.primary}
                            name="check-circle"
                            size={21}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
                {fieldState.error ? (
                  <ThemedText type="small" style={{ color: theme.danger }}>
                    {fieldState.error.message}
                  </ThemedText>
                ) : null}
              </>
            )}
          />
        </View>
        <View style={styles.field}>
          <ThemedText type="smallBold">Attachments</ThemedText>
          <Pressable
            onPress={() => void pickAttachment()}
            style={[
              styles.selector,
              {
                borderColor: theme.border,
                backgroundColor: theme.backgroundElement,
              },
            ]}
          >
            <MaterialIcons color={theme.primary} name="attach-file" size={20} />
            <ThemedText numberOfLines={1} style={styles.grow}>
              Choose one or more files
            </ThemedText>
          </Pressable>
          {attachments.map((attachment, index) => (
            <View
              key={`${attachment.uri}-${index}`}
              style={[styles.attachmentRow, { borderColor: theme.border }]}
            >
              <MaterialIcons
                color={theme.primary}
                name="description"
                size={18}
              />
              <ThemedText numberOfLines={1} style={styles.grow}>
                {attachment.name}
              </ThemedText>
              <Pressable
                accessibilityLabel="Remove attachment"
                hitSlop={8}
                onPress={() =>
                  setAttachments((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <MaterialIcons
                  color={theme.textSecondary}
                  name="close"
                  size={20}
                />
              </Pressable>
            </View>
          ))}
        </View>
        <Button
          disabled={isSubmitting || assigneeIds.length === 0}
          loading={isSubmitting}
          onPress={() => void handleSubmit(submit)()}
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
          {isSubmitting
            ? task
              ? 'Saving…'
              : 'Creating…'
            : task
              ? 'Save changes'
              : 'Create task'}
        </Button>
      </ScrollView>
      {submitError ? <Toast message={submitError} /> : null}
    </SafeAreaView>
  );
}

type ChoiceName = 'projectId' | 'priority' | 'severity' | 'statusId';
function ChoiceField({
  control,
  label,
  name,
  options,
  onSelect,
}: {
  control: ReturnType<typeof useForm<TaskFormValues>>['control'];
  label: string;
  name: ChoiceName;
  options: { label: string; value: number | string | null }[];
  onSelect?: (value: number) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const useSheet = name === 'projectId' || name === 'statusId';
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={styles.field}>
          <ThemedText type="smallBold">{label}</ThemedText>
          {useSheet ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => setOpen(true)}
                style={[
                  styles.selector,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ThemedText style={styles.selectorText}>
                  {options.find((option) => option.value === field.value)
                    ?.label ?? `Choose ${label.toLowerCase()}`}
                </ThemedText>
                <MaterialIcons
                  color={theme.textSecondary}
                  name="expand-more"
                  size={20}
                />
              </Pressable>
              <BottomSheet
                onClose={() => setOpen(false)}
                title={label}
                visible={open}
              >
                <ScrollView>
                  {options.map((option) => (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked: field.value === option.value,
                      }}
                      key={String(option.value)}
                      onPress={() => {
                        field.onChange(option.value);
                        if (typeof option.value === 'number')
                          onSelect?.(option.value);
                        setOpen(false);
                      }}
                      style={[
                        styles.sheetChoice,
                        { borderBottomColor: theme.border },
                      ]}
                    >
                      <ThemedText style={styles.grow}>
                        {option.label}
                      </ThemedText>
                      {field.value === option.value ? (
                        <MaterialIcons
                          color={theme.primary}
                          name="check"
                          size={20}
                        />
                      ) : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </BottomSheet>
            </>
          ) : (
            <View style={styles.choices}>
              {options.map((option) => {
                const selected = field.value === option.value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={String(option.value)}
                    onPress={() => {
                      field.onChange(option.value);
                      if (typeof option.value === 'number')
                        onSelect?.(option.value);
                    }}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: selected
                          ? theme.backgroundSelected
                          : theme.backgroundElement,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.choiceLabel,
                        selected && { color: theme.primary },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    minHeight: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  content: { padding: Spacing.three, paddingBottom: 80, gap: Spacing.three },
  attachmentRow: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intro: {
    minHeight: 150,
    padding: 20,
    borderRadius: 28,
    justifyContent: 'flex-end',
    gap: 6,
  },
  introEyebrow: {
    color: '#9DE5DF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  introTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
  },
  introDescription: { color: '#D7E4ED', fontSize: 14 },
  textArea: { minHeight: 112, paddingTop: 13, width: '100%' },
  field: { gap: Spacing.two },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    minHeight: 42,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  choiceLabel: { fontSize: 13, fontWeight: '600' },
  sheetChoice: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  selector: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorText: { flex: 1, fontSize: 14, fontWeight: '600' },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
  memberList: { gap: 8 },
  member: {
    minHeight: 60,
    padding: 10,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#0E1C2F', fontSize: 11, fontWeight: '800' },
  grow: { flex: 1 },
});
