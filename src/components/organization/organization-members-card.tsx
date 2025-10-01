'use client';

import { CardContent } from '@workspace/ui/components/card';
import type { Organization } from 'better-auth/plugins/organization';
import { useContext, useMemo, useState } from 'react';
import { useCurrentOrganization } from '../../hooks/use-current-organization';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn } from '../../lib/utils';
import type { SettingsCardProps } from '../settings/shared/settings-card';
import { SettingsCard } from '../settings/shared/settings-card';
import { InviteMemberDialog } from './invite-member-dialog';
import { MemberCell } from './member-cell';

export function OrganizationMembersCard({
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

  if (!organization) {
    return (
      <SettingsCard
        actionLabel={localization.INVITE_MEMBER}
        className={className}
        classNames={classNames}
        description={localization.MEMBERS_DESCRIPTION}
        instructions={localization.MEMBERS_INSTRUCTIONS}
        isPending
        title={localization.MEMBERS}
        {...props}
      />
    );
  }

  return (
    <OrganizationMembersContent
      className={className}
      classNames={classNames}
      localization={localization}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationMembersContent({
  className,
  classNames,
  localization: localizationProp,
  organization,
  ...props
}: SettingsCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission, useListMembers },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: hasPermissionInvite, isPending: isPendingInvite } =
    useHasPermission({
      organizationId: organization.id,
      permissions: {
        invitation: ['create'],
      },
    });

  const { data: hasPermissionUpdateMember, isPending: isPendingUpdateMember } =
    useHasPermission({
      organizationId: organization.id,
      permission: {
        member: ['update'],
      },
    });

  const isPending = isPendingInvite || isPendingUpdateMember;

  const { data } = useListMembers({
    query: { organizationId: organization.id },
  });

  const members = data?.members;

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <>
      <SettingsCard
        action={() => setInviteDialogOpen(true)}
        actionLabel={localization.INVITE_MEMBER}
        className={className}
        classNames={classNames}
        description={localization.MEMBERS_DESCRIPTION}
        disabled={!hasPermissionInvite?.success}
        instructions={localization.MEMBERS_INSTRUCTIONS}
        isPending={isPending}
        title={localization.MEMBERS}
        {...props}
      >
        {!isPending && members && members.length > 0 && (
          <CardContent className={cn('grid gap-4', classNames?.content)}>
            {members
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((member) => (
                <MemberCell
                  classNames={classNames}
                  hideActions={!hasPermissionUpdateMember?.success}
                  key={member.id}
                  localization={localization}
                  member={member}
                />
              ))}
          </CardContent>
        )}
      </SettingsCard>

      <InviteMemberDialog
        classNames={classNames}
        localization={localization}
        onOpenChange={setInviteDialogOpen}
        open={inviteDialogOpen}
        organization={organization}
      />
    </>
  );
}
