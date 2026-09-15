import { useRouter } from 'expo-router';

import { FeedbackState } from '@/components/feedback-state';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
      <FeedbackState
        actionLabel="Return home"
        description="This link is invalid or no longer available."
        onAction={() => router.replace('/')}
        title="Page not found"
        variant="not-found"
      />
    </ThemedView>
  );
}
