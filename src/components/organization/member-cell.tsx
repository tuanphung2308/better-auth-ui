'use client';

import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import type { User } from 'better-auth';
import type { Member } from 'better-auth/plugins/organization';
import { EllipsisIcon, UserCogIcon, UserXIcon } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';
import { UserView } from '../user-view';
import { LeaveOrganizationDialog } from './leave-organization-dialog';
import { RemoveMemberDialog } from './remove-member-dialog';
import { UpdateMemberRoleDialog } from './update-member-role-dialog';

export interface MemberCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  member: Member & { user?: Partial<User> | null };
  localization?: AuthLocalization;
  hideActions?: boolean;
}

export function MemberCell({
  className,
  classNames,
  member,
  localization: localizationProp,
  hideActions,
}: MemberCellProps) {
  const {
    organization: organizationOptions,
    hooks: {
      useListMembers,
      useSession,
      useListOrganizations,
      useHasPermission,
    },
    localization: contextLocalization,
  } = useContext(AuthUIContext);
  const localization = { ...contextLocalization, ...localizationProp };

  const { data: sessionData } = useSession();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false);

  const builtInRoles = [
    { role: 'owner', label: localization.OWNER },
    { role: 'admin', label: localization.ADMIN },
    { role: 'member', label: localization.MEMBER },
  ];

  const { data } = useListMembers({
    query: { organizationId: member.organizationId },
  });

  const members = data?.members;

  const myRole = members?.find(
    (m) => m.user?.id === sessionData?.user.id
  )?.role;
  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const role = roles.find((r) => r.role === member.role);

  const isSelf = sessionData?.user.id === member?.userId;

  const { data: organizations } = useListOrganizations();
  const organization = organizations?.find(
    (org) => org.id === member.organizationId
  );

  const { data: hasPermissionToUpdateMember } = useHasPermission({
    organizationId: member.organizationId,
    permission: { member: ['update'] },
  });

  return (
    <>
      <Card
        className={cn('flex-row items-center p-4', className, classNames?.cell)}
      >
        <UserView
          className="flex-1"
          localization={localization}
          user={member.user}
        />

        <span className="text-xs opacity-70">{role?.label}</span>

        {!hideActions &&
          (isSelf || member.role !== 'owner' || myRole === 'owner') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(
                    'relative ms-auto',
                    classNames?.button,
                    classNames?.outlineButton
                  )}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <EllipsisIcon className={classNames?.icon} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {hasPermissionToUpdateMember?.success && (
                  <DropdownMenuItem
                    onClick={() => setUpdateRoleDialogOpen(true)}
                  >
                    <UserCogIcon className={classNames?.icon} />
                    {localization?.UPDATE_ROLE}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() =>
                    isSelf
                      ? setLeaveDialogOpen(true)
                      : setRemoveDialogOpen(true)
                  }
                  variant="destructive"
                >
                  <UserXIcon className={classNames?.icon} />
                  {isSelf
                    ? localization?.LEAVE_ORGANIZATION
                    : localization?.REMOVE_MEMBER}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
      </Card>

      <RemoveMemberDialog
        classNames={classNames}
        localization={localization}
        member={member}
        onOpenChange={setRemoveDialogOpen}
        open={removeDialogOpen}
      />

      {organization && (
        <LeaveOrganizationDialog
          classNames={classNames}
          localization={localization}
          onOpenChange={setLeaveDialogOpen}
          open={leaveDialogOpen}
          organization={organization}
        />
      )}

      <UpdateMemberRoleDialog
        classNames={classNames}
        localization={localization}
        member={member}
        onOpenChange={setUpdateRoleDialogOpen}
        open={updateRoleDialogOpen}
      />
    </>
  );
}
