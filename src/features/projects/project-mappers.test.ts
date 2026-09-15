import { mapProjectDetail, mapProjectListItem } from './project-mappers';

describe('project API mappers', () => {
  it('derives list progress from live tasks', () => {
    expect(
      mapProjectListItem({
        id: 7,
        title: 'Launch',
        status: 'in_progress',
        tasks: [
          { status: { isTerminal: true } },
          { status: { isTerminal: false } },
        ],
      }),
    ).toMatchObject({ id: '7', progressPercent: 50, taskCount: 2 });
  });

  it('maps overview tasks and workspace project metadata', () => {
    const project = mapProjectDetail(7, {
      project: { id: 7, title: 'Launch', status: 'active' },
      tasks: [
        { id: 3, title: 'Ship', status: { title: 'Done', isTerminal: true } },
      ],
      totalTasks: 1,
    });
    expect(project).toMatchObject({ title: 'Launch', progressPercent: 100 });
    expect(project.tasks[0]).toMatchObject({ id: '3', isTerminal: true });
  });
});
