import { useMutation } from '@tanstack/react-query';
import { switchActiveOrganization } from './organization-api';

export function useSwitchOrganization() {
  return useMutation({ mutationFn: switchActiveOrganization });
}
