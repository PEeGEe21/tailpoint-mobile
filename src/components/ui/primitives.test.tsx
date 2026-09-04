import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button, Choice, Field, Progress } from '@/components/ui/primitives';

describe('UI primitive accessibility', () => {
  it('exposes and activates a labeled button', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Save changes</Button>);

    fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('associates a field with its visible label', () => {
    render(<Field label="Project name" value="Apollo" />);

    expect(screen.getByLabelText('Project name')).toHaveDisplayValue('Apollo');
  });

  it('exposes checked state for choices', () => {
    render(<Choice checked label="Notify members" onPress={jest.fn()} />);

    expect(screen.getByRole('checkbox', { checked: true })).toBeOnTheScreen();
  });

  it('clamps and announces progress as a percentage', () => {
    render(<Progress value={1.4} />);

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 100,
    });
  });
});
