'use client';

import { CardContent } from '@workspace/ui/components/card';
import type { Organization } from 'better-auth/plugins/organization';
import { useContext, useMemo } from 'react';
import { useCurrentOrganization } from '../../hooks/use-current-organization';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn } from '../../lib/utils';
import type { SettingsCardProps } from '../settings/shared/settings-card';
import { SettingsCard } from '../settings/shared/settings-card';
import { InvitationCell } from './invitation-cell';

export function OrganizationInvitationsCard({
  className,
  classNames,
  localization: localizationProp,
  slug: slugProp,
  ...props
}: SettingsCardProps & { slug?: string }) {
  const {
    localization: contextLocalization,
    organization: organizationOptions,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const slug = slugProp || organizationOptions?.slug;

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) return null;

  return (
    <OrganizationInvitationsContent
      className={className}
      classNames={classNames}
      localization={localization}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationInvitationsContent({
  className,
  classNames,
  localization: localizationProp,
  organization,
  ...props
}: SettingsCardProps & { organization: Organization }) {
  const {
    hooks: { useListInvitations },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: invitations } = useListInvitations({
    query: { organizationId: organization.id },
  });

  const pendingInvitations = invitations?.filter(
    (invitation) => invitation.status === 'pending'
  );
  if (!pendingInvitations?.length) return null;

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={localization.PENDING_INVITATIONS_DESCRIPTION}
      title={localization.PENDING_INVITATIONS}
      {...props}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {pendingInvitations.map((invitation) => (
          <InvitationCell
            classNames={classNames}
            invitation={invitation}
            key={invitation.id}
            localization={localization}
            organization={organization}
          />
        ))}
      </CardContent>
    </SettingsCard>
  );
}
