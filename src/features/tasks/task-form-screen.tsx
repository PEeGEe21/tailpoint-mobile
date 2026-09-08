import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import {
  PROJECT_MEMBERS,
  PROJECT_WORKFLOW_STATUSES,
  TASK_PROJECTS,
} from './mock-data';
import { taskFormSchema, type TaskFormValues } from './schema';
import { useTaskStore } from './task-store';

const defaultProjectId = TASK_PROJECTS[0].id;
const defaults: TaskFormValues = {
  title: '',
  description: '',
  projectId: defaultProjectId,
  priority: 2,
  severity: 'medium',
  statusId: PROJECT_WORKFLOW_STATUSES[defaultProjectId][0].id,
  dueDate: null,
  assigneeIds: [],
};

export function TaskFormScreen({ taskId }: { taskId?: string }) {
  const theme = useTheme();
  const numericTaskId = taskId ? Number(taskId) : undefined;
  const task = useTaskStore((state) =>
    state.tasks.find((item) => item.id === numericTaskId),
  );
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const [memberQuery, setMemberQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? '',
          projectId: task.project.id,
          priority: task.priority,
          severity: task.severity,
          statusId: task.status.id,
          dueDate: task.due_date,
          assigneeIds: task.assignees.map((item) => item.id),
        }
      : defaults,
  });
  const projectId = useWatch({ control, name: 'projectId' });
  const dueDate = useWatch({ control, name: 'dueDate' });
  const assigneeIds = useWatch({ control, name: 'assigneeIds' });
  const members = useMemo(
    () =>
      PROJECT_MEMBERS.filter((member) =>
        `${member.name} ${member.email}`
          .toLowerCase()
          .includes(memberQuery.trim().toLowerCase()),
      ),
    [memberQuery],
  );
  const submit = (values: TaskFormValues) => {
    if (numericTaskId) {
      updateTask(numericTaskId, values);
      router.replace(`/tasks/${numericTaskId}` as never);
      return;
    }
    router.replace(`/tasks/${addTask(values)}` as never);
  };
  const chooseDate = (_event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (value)
      setValue('dueDate', value.toISOString(), { shouldValidate: true });
  };
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Close task form"
          onPress={() => router.back()}
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
          options={TASK_PROJECTS.map((item) => ({
            label: item.title,
            value: item.id,
          }))}
          onSelect={(value) =>
            setValue('statusId', PROJECT_WORKFLOW_STATUSES[value][0].id)
          }
        />
        <ChoiceField
          control={control}
          label="Workflow status"
          name="statusId"
          options={PROJECT_WORKFLOW_STATUSES[projectId].map((item) => ({
            label: item.title,
            value: item.id,
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
        <Button
          disabled={isSubmitting || assigneeIds.length === 0}
          onPress={() => void handleSubmit(submit)()}
        >
          {task ? 'Save changes' : 'Create task'}
        </Button>
      </ScrollView>
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
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View style={styles.field}>
          <ThemedText type="smallBold">{label}</ThemedText>
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
  textArea: { minHeight: 112, paddingTop: 13 },
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
