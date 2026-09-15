import { mapApproval } from './inbox-mappers';

describe('inbox API mapper', () => {
  it('supports the enriched camel-case approval response', () => {
    expect(
      mapApproval({
        id: 'approval-1',
        projectId: 4,
        subjectType: 'task',
        subjectId: '9',
        subject: { id: 9, title: 'Release' },
        status: 'pending',
        canRespond: true,
        reviewers: [],
        responses: [],
      }),
    ).toMatchObject({
      id: 'approval-1',
      projectId: 4,
      subject: { title: 'Release' },
      canRespond: true,
    });
  });
});
