import { Redirect } from 'expo-router';
import { useSessionStore } from '@/auth/session-store';

export default function IndexRoute() {
  const status = useSessionStore((state) => state.status);
  if (status === 'bootstrapping') return null;
  if (status === 'authenticated') return <Redirect href="/(app)/(tabs)" />;
  if (status === 'selecting-organization')
    return <Redirect href="/(onboarding)/choose-workspace" />;
  return <Redirect href="/(public)/welcome" />;
}
