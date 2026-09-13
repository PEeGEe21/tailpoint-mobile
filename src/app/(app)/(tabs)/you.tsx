import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sessionManager } from '@/auth/runtime-session';
import { AppearanceSelector } from '@/components/appearance-selector';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { MOCK_PROFILE_PREFERENCES } from '@/features/profile/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { useSessionStore } from '@/auth/session-store';
import {
  useDeleteWorkspace,
  useSwitchOrganization,
} from '@/features/organizations/mutations';
import { clearOrganizationQueries } from '@/api/query-client';

export default function YouScreen() {
  const theme = useTheme();
  const user = useSessionStore((state) => state.user);
  const organization = useSessionStore((state) => state.organization);
  const organizations = useSessionStore((state) => state.organizations);
  const organizationRole = useSessionStore((state) => state.organizationRole);
  const switchOrganization = useSwitchOrganization();
  const deleteWorkspace = useDeleteWorkspace();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');
  const profileName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Tailpoint user';
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
    user?.email?.[0]?.toUpperCase() ||
    'U';
  const [preferences, setPreferences] = useState(
    () =>
      Object.fromEntries(
        MOCK_PROFILE_PREFERENCES.map((item) => [item.key, item.defaultValue]),
      ) as Record<(typeof MOCK_PROFILE_PREFERENCES)[number]['key'], boolean>,
  );

  const signOut = async () => {
    await clearOrganizationQueries(useSessionStore.getState().organizationId);
    await sessionManager.clearSession();
    router.replace('/(public)/welcome');
  };

  const closeDelete = () => {
    if (deleteWorkspace.isPending) return;
    setDeleteOpen(false);
    setConfirmationName('');
    deleteWorkspace.reset();
  };

  const confirmDelete = async () => {
    if (!organization || confirmationName !== organization.name) return;
    try {
      const nextOrganization = await deleteWorkspace.mutateAsync({
        confirmationName,
        organizationId: organization.id,
      });
      setDeleteOpen(false);
      setConfirmationName('');
      if (!nextOrganization) {
        router.replace('/(onboarding)/workspace' as never);
      }
    } catch {
      // The mutation exposes its normalized error inside the confirmation dialog.
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.pageTitle}>You</ThemedText>
            <ThemedText style={styles.pageSubtitle} themeColor="textSecondary">
              Profile, workspace, and preferences
            </ThemedText>
          </View>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View
              style={[styles.avatar, { backgroundColor: theme.primary }]}
              accessibilityLabel={`${profileName}'s avatar`}
            >
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </View>
            <View style={styles.grow}>
              <ThemedText style={styles.name}>{profileName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {user?.email}
              </ThemedText>
              <ThemedText style={[styles.role, { color: theme.primary }]}>
                {organizationRole ?? 'member'}
              </ThemedText>
            </View>
          </View>
        </Card>

        <SectionTitle title="Workspace" />
        <Card style={styles.workspaceCard}>
          <View
            style={[
              styles.workspaceIcon,
              { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <MaterialIcons color={theme.primary} name="business" size={22} />
          </View>
          <View style={styles.grow}>
            <ThemedText style={styles.itemTitle}>
              {organization?.name ?? 'Workspace'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Organization membership · {organizationRole ?? 'member'}
            </ThemedText>
          </View>
          <MaterialIcons
            color={theme.textSecondary}
            name="chevron-right"
            size={22}
          />
        </Card>
        {organizations.length > 1 ? (
          <View style={styles.workspaceChoices}>
            {organizations
              .filter((item) => item.id !== organization?.id)
              .map((item) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={switchOrganization.isPending}
                  key={item.id}
                  onPress={() => switchOrganization.mutate(item.id)}
                  style={[
                    styles.switchWorkspace,
                    { borderColor: theme.border },
                  ]}
                >
                  <View style={styles.grow}>
                    <ThemedText type="smallBold">
                      Switch to {item.name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.role ?? 'member'}
                    </ThemedText>
                  </View>
                  <MaterialIcons
                    color={theme.primary}
                    name="swap-horiz"
                    size={20}
                  />
                </Pressable>
              ))}
            {switchOrganization.error ? (
              <ThemedText
                accessibilityRole="alert"
                type="small"
                style={{ color: theme.danger }}
              >
                {switchOrganization.error instanceof Error
                  ? switchOrganization.error.message
                  : 'Unable to switch organization.'}
              </ThemedText>
            ) : null}
          </View>
        ) : null}

        {organizationRole === 'org_admin' && organization ? (
          <>
            <SectionTitle title="Danger zone" />
            <Card
              style={[styles.dangerCard, { borderColor: `${theme.danger}66` }]}
            >
              <View style={styles.grow}>
                <ThemedText style={styles.itemTitle}>
                  Delete workspace
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Deactivate this workspace and remove it from every member.
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDeleteOpen(true)}
                style={[
                  styles.deleteButton,
                  { backgroundColor: `${theme.danger}12` },
                ]}
              >
                <ThemedText style={{ color: theme.danger }} type="smallBold">
                  Delete
                </ThemedText>
              </Pressable>
            </Card>
          </>
        ) : null}

        <SectionTitle title="Appearance" />
        <Card style={styles.sectionCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Choose how Tailpoint looks on this device.
          </ThemedText>
          <AppearanceSelector />
        </Card>

        <SectionTitle title="Notifications" />
        <Card style={styles.preferenceCard}>
          {MOCK_PROFILE_PREFERENCES.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.preferenceRow,
                index > 0 && {
                  borderTopColor: theme.border,
                  borderTopWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <View style={styles.grow}>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.description}
                </ThemedText>
              </View>
              <Switch
                accessibilityLabel={item.title}
                onValueChange={(value) =>
                  setPreferences((current) => ({
                    ...current,
                    [item.key]: value,
                  }))
                }
                thumbColor={theme.backgroundElement}
                trackColor={{
                  false: theme.border,
                  true: theme.primary,
                }}
                value={preferences[item.key]}
              />
            </View>
          ))}
        </Card>

        <Pressable
          accessibilityRole="button"
          onPress={() => void signOut()}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: `${theme.danger}12`,
              borderColor: `${theme.danger}66`,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <MaterialIcons color={theme.danger} name="logout" size={20} />
          <ThemedText style={[styles.signOutText, { color: theme.danger }]}>
            Sign out
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.memberSince} themeColor="textSecondary">
          Tailpoint v1.0.0
        </ThemedText>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={closeDelete}
        transparent
        visible={deleteOpen}
      >
        <View style={styles.modalBackdrop}>
          <View
            accessibilityRole="alert"
            accessibilityViewIsModal
            style={[
              styles.deleteDialog,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="subtitle">Delete workspace?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Type {organization?.name ?? 'the workspace name'} to confirm. You
              will be moved to your next workspace if one is available.
            </ThemedText>
            <TextInput
              accessibilityLabel="Workspace name confirmation"
              autoCapitalize="words"
              editable={!deleteWorkspace.isPending}
              onChangeText={setConfirmationName}
              placeholder={organization?.name}
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.confirmationInput,
                { borderColor: theme.border, color: theme.text },
              ]}
              value={confirmationName}
            />
            {deleteWorkspace.error ? (
              <ThemedText
                accessibilityRole="alert"
                type="small"
                style={{ color: theme.danger }}
              >
                {deleteWorkspace.error instanceof Error
                  ? deleteWorkspace.error.message
                  : 'Unable to delete workspace.'}
              </ThemedText>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={
                deleteWorkspace.isPending ||
                confirmationName !== organization?.name
              }
              onPress={() => void confirmDelete()}
              style={[
                styles.confirmDeleteButton,
                {
                  backgroundColor: theme.danger,
                  opacity:
                    confirmationName === organization?.name &&
                    !deleteWorkspace.isPending
                      ? 1
                      : 0.45,
                },
              ]}
            >
              <ThemedText style={styles.confirmDeleteText}>
                {deleteWorkspace.isPending
                  ? 'Deleting workspace…'
                  : 'Delete workspace'}
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deleteWorkspace.isPending}
              onPress={closeDelete}
              style={styles.cancelDeleteButton}
            >
              <ThemedText type="smallBold">Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <ThemedText style={styles.sectionTitle}>{title}</ThemedText>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: 120, gap: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  pageSubtitle: { fontSize: 13 },
  profileCard: { padding: Spacing.three, gap: Spacing.three },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  grow: { flex: 1 },
  name: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  role: { marginTop: 3, fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    marginTop: Spacing.one,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  workspaceCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workspaceIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceChoices: { gap: Spacing.two },
  switchWorkspace: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
  },
  deleteButton: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  deleteDialog: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.four,
  },
  confirmationInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
  },
  confirmDeleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
  },
  confirmDeleteText: { color: '#FFFFFF', fontWeight: '700' },
  cancelDeleteButton: { alignItems: 'center', padding: Spacing.two },
  itemTitle: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  sectionCard: { gap: 12 },
  preferenceCard: { paddingVertical: 4, gap: 0 },
  preferenceRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  menuCard: { paddingVertical: 4, gap: 0 },
  menuRow: {
    minHeight: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    minHeight: 50,
    borderRadius: Radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  signOutText: { fontSize: 14, fontWeight: '700' },
  memberSince: { textAlign: 'center', fontSize: 11 },
});
