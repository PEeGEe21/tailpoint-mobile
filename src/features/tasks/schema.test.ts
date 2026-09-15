import { taskFormSchema } from './schema';

const validTask = {
  title: 'Review the release checklist',
  description: '',
  projectId: 101,
  priority: 2,
  severity: 'medium' as const,
  statusId: 1001,
  dueDate: '2026-09-08T12:00:00.000Z',
  assigneeIds: [11],
};

describe('taskFormSchema', () => {
  it('accepts a complete task', () => {
    expect(taskFormSchema.safeParse(validTask).success).toBe(true);
  });

  it('rejects an empty title and malformed due date', () => {
    const result = taskFormSchema.safeParse({
      ...validTask,
      title: ' ',
      dueDate: 'tomorrow',
    });
    expect(result.success).toBe(false);
  });
});
