import { create } from 'zustand';
import {
  MOCK_TASKS,
  ORGANIZATION_ID,
  PROJECT_MEMBERS,
  PROJECT_WORKFLOW_STATUSES,
  TASK_PROJECTS,
} from './mock-data';
import type { TaskFormValues } from './schema';
import type { Task } from './types';

interface TaskState {
  tasks: Task[];
  addTask: (values: TaskFormValues) => number;
  updateTask: (id: number, values: TaskFormValues) => void;
  setStatus: (id: number, statusId: number) => void;
}
const shapeTask = (values: TaskFormValues, existing?: Task): Task => ({
  id: existing?.id ?? Date.now(),
  title: values.title,
  description: values.description || null,
  priority: values.priority,
  severity: values.severity,
  due_date: values.dueDate,
  organization_id: existing?.organization_id ?? ORGANIZATION_ID,
  project:
    TASK_PROJECTS.find((item) => item.id === values.projectId) ??
    TASK_PROJECTS[0],
  status:
    PROJECT_WORKFLOW_STATUSES[values.projectId].find(
      (item) => item.id === values.statusId,
    ) ?? PROJECT_WORKFLOW_STATUSES[values.projectId][0],
  assignees: PROJECT_MEMBERS.filter((item) =>
    values.assigneeIds.includes(item.id),
  ),
});
export const useTaskStore = create<TaskState>((set) => ({
  tasks: MOCK_TASKS,
  addTask: (values) => {
    const task = shapeTask(values);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task.id;
  },
  updateTask: (id, values) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? shapeTask(values, task) : task,
      ),
    })),
  setStatus: (id, statusId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                PROJECT_WORKFLOW_STATUSES[task.project.id].find(
                  (item) => item.id === statusId,
                ) ?? task.status,
            }
          : task,
      ),
    })),
}));
