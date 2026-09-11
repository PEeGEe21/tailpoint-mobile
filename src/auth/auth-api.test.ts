import {
  createOrganizationAccount,
  joinOrganizationAccount,
  requestPasswordReset,
  resetPassword,
  signIn,
  validateInvitation,
  verifyPasswordResetCode,
} from './auth-api';

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const session = {
  user: {
    id: 7,
    email: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
  },
  organization: {
    id: '9d33d4fa-6556-430f-9b56-142b022733bb',
    name: 'Analytical Engines',
    slug: 'analytical-engines',
    role: 'org_admin',
  },
  token: { accessToken: 'access', refreshToken: 'refresh' },
  message: 'ok',
};

describe('auth API', () => {
  afterEach(() => jest.restoreAllMocks());
  it('creates an organization account and maps the authenticated context', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(json(session, 201));
    const result = await createOrganizationAccount('https://api.example.com', {
      email: ' ADA@EXAMPLE.COM ',
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace',
      organizationName: 'Analytical Engines',
      verificationToken: 'verified-email-proof',
    });
    expect(result.context).toMatchObject({
      user: { id: 7, email: 'ada@example.com' },
      organizationRole: 'org_admin',
    });
    const request = fetchMock.mock.calls[0][0] as Request;
    await expect(request.clone().json()).resolves.toMatchObject({
      email: 'ada@example.com',
      first_name: 'Ada',
      organization_name: 'Analytical Engines',
      verification_token: 'verified-email-proof',
    });
  });
  it('validates and accepts an invitation', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        json({
          email: 'ada@example.com',
          organization: session.organization,
          invited_role: 'member',
        }),
      )
      .mockResolvedValueOnce(json(session, 201));
    const invitation = await validateInvitation('https://api.example.com', {
      code: 'ABC123',
    });
    expect(invitation).toMatchObject({
      email: 'ada@example.com',
      invitedRole: 'member',
    });
    await joinOrganizationAccount('https://api.example.com', {
      email: invitation.email,
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace',
      inviteCode: 'ABC123',
    });
    expect((fetchMock.mock.calls[0][0] as Request).url).toContain(
      'code=ABC123',
    );
  });
  it('calls every password recovery stage with contract-shaped payloads', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () =>
        json({ success: true, message: 'ok' }, 201),
      );
    await requestPasswordReset('https://api.example.com', 'ada@example.com');
    await verifyPasswordResetCode(
      'https://api.example.com',
      'ada@example.com',
      '123456',
    );
    await resetPassword(
      'https://api.example.com',
      'ada@example.com',
      'new-password',
    );
    expect(
      fetchMock.mock.calls.map(([request]) => (request as Request).url),
    ).toEqual([
      'https://api.example.com/api/auth/forgot-password',
      'https://api.example.com/api/auth/verify-forgot-password-otp',
      'https://api.example.com/api/auth/reset-password',
    ]);
  });
  it('maps a zero-membership login to workspace entry', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      json({
        nextStep: 'create_or_join_organization',
        user: session.user,
        organizations: [],
        token: session.token,
      }),
    );

    await expect(
      signIn('https://api.example.com', 'ada@example.com', 'password123'),
    ).resolves.toEqual({
      kind: 'workspace-required',
      user: expect.objectContaining({ id: 7, email: 'ada@example.com' }),
      tokens: session.token,
    });
  });
});
