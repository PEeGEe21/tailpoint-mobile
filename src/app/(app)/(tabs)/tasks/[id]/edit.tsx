import { useLocalSearchParams } from 'expo-router';
import { TaskFormScreen } from '@/features/tasks/task-form-screen';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TaskFormScreen taskId={id} />;
}
