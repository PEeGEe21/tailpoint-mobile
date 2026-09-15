import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionContext } from './session-store';

const KEY = 'tailpoint.session-context.v1';
export interface SessionContextStore {
  get(): Promise<SessionContext | null>;
  set(value: SessionContext): Promise<void>;
  clear(): Promise<void>;
}
export const sessionContextStore: SessionContextStore = {
  async get() {
    const value = await AsyncStorage.getItem(KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as SessionContext;
    } catch {
      return null;
    }
  },
  set: (value) => AsyncStorage.setItem(KEY, JSON.stringify(value)),
  clear: () => AsyncStorage.removeItem(KEY),
};
