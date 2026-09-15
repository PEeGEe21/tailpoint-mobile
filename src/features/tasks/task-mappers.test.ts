import { mapTask } from './task-mappers';

describe('task API mapper', () => {
  it('normalizes live relations for mobile screens', () => {
    expect(
      mapTask({
        id: 9,
        title: 'Release',
        organization_id: 'org-1',
        project: { id: 4, title: 'Mobile' },
        status: { id: 2, title: 'Done', isTerminal: true },
        assignees: [{ id: 3, first_name: 'Grace', email: 'g@example.com' }],
      }),
    ).toMatchObject({
      id: 9,
      project: { id: 4, title: 'Mobile' },
      status: { id: 2, isTerminal: true },
      assignees: [{ id: 3, name: 'Grace' }],
    });
  });
});
