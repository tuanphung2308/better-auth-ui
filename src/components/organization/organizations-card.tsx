'use client';
import { CardContent } from '@workspace/ui/components/card';
import { useContext, useMemo, useState } from 'react';
import { useIsHydrated } from '../../hooks/use-hydrated';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn } from '../../lib/utils';
import type { SettingsCardProps } from '../settings/shared/settings-card';
import { SettingsCard } from '../settings/shared/settings-card';
import { SettingsCellSkeleton } from '../settings/skeletons/settings-cell-skeleton';
import { CreateOrganizationDialog } from './create-organization-dialog';
import { OrganizationCell } from './organization-cell';

export function OrganizationsCard({
  className,
  classNames,
  localization,
  ...props
}: SettingsCardProps) {
  const {
    hooks: { useListOrganizations },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = useMemo(
    () => ({ ...contextLocalization, ...localization }),
    [contextLocalization, localization]
  );

  const isHydrated = useIsHydrated();
  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations();

  const isPending = !isHydrated || organizationsPending;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <SettingsCard
        action={() => setCreateDialogOpen(true)}
        actionLabel={localization.CREATE_ORGANIZATION}
        className={className}
        classNames={classNames}
        description={localization.ORGANIZATIONS_DESCRIPTION}
        instructions={localization.ORGANIZATIONS_INSTRUCTIONS}
        isPending={isPending}
        title={localization.ORGANIZATIONS}
        {...props}
      >
        <CardContent className={cn('grid gap-4', classNames?.content)}>
          {isPending && <SettingsCellSkeleton />}
          {organizations?.map((organization) => (
            <OrganizationCell
              classNames={classNames}
              key={organization.id}
              localization={localization}
              organization={organization}
            />
          ))}
        </CardContent>
      </SettingsCard>

      <CreateOrganizationDialog
        classNames={classNames}
        localization={localization}
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
      />
    </>
  );
}
