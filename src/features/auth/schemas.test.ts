import {
  createOrganizationSchema,
  joinOrganizationSchema,
  passwordRecoverySchema,
} from './schemas';

describe('auth form schemas', () => {
  it('matches the create-organization contract', () => {
    expect(
      createOrganizationSchema.safeParse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        organizationName: 'Analytical Engines',
      }).success,
    ).toBe(true);
  });

  it('accepts either invitation mode and requires its credential', () => {
    const account = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    };
    expect(
      joinOrganizationSchema.safeParse({
        ...account,
        inviteMode: 'code',
        inviteCode: 'ABC123',
        inviteToken: '',
      }).success,
    ).toBe(true);
    expect(
      joinOrganizationSchema.safeParse({
        ...account,
        inviteMode: 'token',
        inviteCode: '',
        inviteToken: 'invite-token',
      }).success,
    ).toBe(true);
  });

  it('requires matching reset passwords and a six-digit code', () => {
    expect(
      passwordRecoverySchema.safeParse({
        email: 'ada@example.com',
        code: '123456',
        password: 'password123',
        confirmPassword: 'different123',
      }).success,
    ).toBe(false);
  });
});
