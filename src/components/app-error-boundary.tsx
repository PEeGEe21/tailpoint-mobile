import { Component, ErrorInfo, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { telemetry } from '@/telemetry/telemetry';

type State = { failed: boolean };

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    telemetry.captureError(error, {
      boundary: 'root',
      componentStackPresent: Boolean(info.componentStack),
    });
  }

  private retry = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <View accessibilityRole="alert" style={styles.screen}>
        <Text style={styles.title}>Tailpoint needs to recover</Text>
        <Text style={styles.copy}>
          Your saved work is still available. Try reopening this screen.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.retry}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F6F8FA',
    gap: 12,
  },
  title: { color: '#122033', fontSize: 22, lineHeight: 28, fontWeight: '700' },
  copy: { color: '#667085', fontSize: 16, lineHeight: 24 },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#008080',
  },
  buttonLabel: { color: '#FFFFFF', fontWeight: '700' },
});
