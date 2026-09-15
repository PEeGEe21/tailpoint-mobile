import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().trim().min(2, 'Enter a task title'),
  description: z
    .string()
    .trim()
    .max(1000, 'Keep the description under 1,000 characters'),
  projectId: z.number().int().positive(),
  priority: z.number().int().min(0).max(4),
  severity: z.enum(['low', 'medium', 'high', 'critical']).nullable(),
  statusId: z.number().int().positive(),
  dueDate: z.string().datetime().nullable(),
  assigneeIds: z
    .array(z.number().int().positive())
    .min(1, 'Choose at least one assignee'),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;
