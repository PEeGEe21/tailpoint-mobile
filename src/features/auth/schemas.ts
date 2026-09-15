import { z } from 'zod';

const email = z.string().trim().email('Enter a valid work email');
const password = z.string().min(8, 'Use at least 8 characters');

export const createOrganizationSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email,
    password,
    confirmPassword: z.string(),
    organizationName: z.string().trim().min(1, 'Organization name is required'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const joinOrganizationSchema = z
  .object({
    inviteMode: z.enum(['code', 'token']),
    inviteCode: z.string(),
    inviteToken: z.string(),
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email,
    password,
  })
  .superRefine((value, context) => {
    if (value.inviteMode === 'code' && value.inviteCode.trim().length !== 6) {
      context.addIssue({
        code: 'custom',
        path: ['inviteCode'],
        message: 'Enter the six-character invitation code',
      });
    }
    if (value.inviteMode === 'token' && !value.inviteToken.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['inviteToken'],
        message: 'Enter a valid invitation token',
      });
    }
  });

export const passwordRecoverySchema = z
  .object({
    email,
    code: z.string().regex(/^\d{6}$/, 'Enter the six-digit verification code'),
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;
export type JoinOrganizationForm = z.infer<typeof joinOrganizationSchema>;
export type PasswordRecoveryForm = z.infer<typeof passwordRecoverySchema>;
export type SignInForm = z.infer<typeof signInSchema>;
