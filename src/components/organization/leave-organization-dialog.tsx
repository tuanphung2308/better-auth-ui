'use client';

import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import type { Organization } from 'better-auth/plugins/organization';
import { Loader2 } from 'lucide-react';
import { type ComponentProps, useContext, useMemo, useState } from 'react';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';
import { OrganizationCellView } from './organization-cell-view';

export interface LeaveOrganizationDialogProps
  extends ComponentProps<typeof Dialog> {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  organization: Organization;
}

export function LeaveOrganizationDialog({
  organization,
  className,
  classNames,
  localization: localizationProp,
  onOpenChange,
  ...props
}: LeaveOrganizationDialogProps) {
  const {
    authClient,
    hooks: { useListOrganizations },
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { refetch: refetchOrganizations } = useListOrganizations();

  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveOrganization = async () => {
    setIsLeaving(true);

    try {
      await authClient.organization.leave({
        organizationId: organization.id,
        fetchOptions: { throw: true },
      });

      await refetchOrganizations?.();

      toast({
        variant: 'success',
        message: localization.LEAVE_ORGANIZATION_SUCCESS,
      });

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsLeaving(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={classNames?.dialog?.content}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn('text-lg md:text-xl', classNames?.title)}>
            {localization.LEAVE_ORGANIZATION}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization.LEAVE_ORGANIZATION_CONFIRM}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn('my-2 flex-row p-4', className, classNames?.cell)}>
          <OrganizationCellView
            localization={localization}
            organization={organization}
          />
        </Card>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={isLeaving}
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="outline"
          >
            {localization.CANCEL}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.destructiveButton)}
            disabled={isLeaving}
            onClick={handleLeaveOrganization}
            type="button"
            variant="destructive"
          >
            {isLeaving && <Loader2 className="animate-spin" />}

            {localization.LEAVE_ORGANIZATION}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
