import { render } from '@testing-library/react-native';

import { Toast } from './overlays';

describe('Toast', () => {
  it('uses a readable semantic error treatment by default', () => {
    const screen = render(<Toast message="Something went wrong" />);
    const message = screen.getByText('Something went wrong');
    const toast = screen.getByRole('alert');

    expect(message).toHaveStyle({ color: '#FFFFFF', fontWeight: '700' });
    expect(toast).toHaveStyle({ backgroundColor: '#D92D20' });
  });
});
