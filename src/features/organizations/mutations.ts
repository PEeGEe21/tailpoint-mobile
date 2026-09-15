import { useMutation } from '@tanstack/react-query';
import { deleteWorkspace, switchActiveOrganization } from './organization-api';

export function useSwitchOrganization() {
  return useMutation({ mutationFn: switchActiveOrganization });
}

export function useDeleteWorkspace() {
  return useMutation({
    mutationFn: ({
      confirmationName,
      organizationId,
    }: {
      confirmationName: string;
      organizationId: string;
    }) => deleteWorkspace(organizationId, confirmationName),
  });
}
