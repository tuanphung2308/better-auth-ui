'use client';

import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import type { Organization } from 'better-auth/plugins/organization';
import { EllipsisIcon, Loader2, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';
import { LeaveOrganizationDialog } from './leave-organization-dialog';
import { OrganizationCellView } from './organization-cell-view';

export interface OrganizationCellProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  organization: Organization;
  localization?: AuthLocalization;
}

export function OrganizationCell({
  className,
  classNames,
  organization,
  localization: localizationProp,
}: OrganizationCellProps) {
  const {
    authClient,
    localization: contextLocalization,
    organization: organizationOptions,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { pathMode } = organizationOptions || {};

  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isManagingOrganization, setIsManagingOrganization] = useState(false);

  const handleManageOrganization = useCallback(async () => {
    setIsManagingOrganization(true);

    if (pathMode === 'slug') {
      navigate(
        `${organizationOptions?.basePath}/${organization.slug}/${organizationOptions?.viewPaths.SETTINGS}`
      );

      return;
    }

    try {
      await authClient.organization.setActive({
        organizationId: organization.id,
        fetchOptions: {
          throw: true,
        },
      });

      navigate(
        `${organizationOptions?.basePath}/${organizationOptions?.viewPaths?.SETTINGS}`
      );
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });

      setIsManagingOrganization(false);
    }
  }, [
    authClient,
    organization.id,
    organizationOptions?.basePath,
    organizationOptions?.viewPaths?.SETTINGS,
    organization.slug,
    pathMode,
    navigate,
    toast,
    localization,
  ]);

  return (
    <>
      <Card className={cn('flex-row p-4', className, classNames?.cell)}>
        <OrganizationCellView
          localization={localization}
          organization={organization}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                'relative ms-auto',
                classNames?.button,
                classNames?.outlineButton
              )}
              disabled={isManagingOrganization}
              size="icon"
              type="button"
              variant="outline"
            >
              {isManagingOrganization ? (
                <Loader2 className="animate-spin" />
              ) : (
                <EllipsisIcon className={classNames?.icon} />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              disabled={isManagingOrganization}
              onClick={handleManageOrganization}
            >
              <SettingsIcon className={classNames?.icon} />

              {localization.MANAGE_ORGANIZATION}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsLeaveDialogOpen(true)}
              variant="destructive"
            >
              <LogOutIcon className={classNames?.icon} />

              {localization.LEAVE_ORGANIZATION}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      <LeaveOrganizationDialog
        localization={localization}
        onOpenChange={setIsLeaveDialogOpen}
        open={isLeaveDialogOpen}
        organization={organization}
      />
    </>
  );
}
