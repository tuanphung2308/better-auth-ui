'use client';
import { CardContent } from '@workspace/ui/components/card';
import { useContext } from 'react';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { SettingsCardClassNames } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';
import { AccountCell } from './account-cell';

export interface AccountsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: Partial<AuthLocalization>;
}

export function AccountsCard({
  className,
  classNames,
  localization,
}: AccountsCardProps) {
  const {
    basePath,
    hooks: { useListDeviceSessions, useSession },
    localization: contextLocalization,
    viewPaths,
    navigate,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: deviceSessions, isPending, refetch } = useListDeviceSessions();
  const { data: sessionData } = useSession();

  const otherDeviceSessions = (deviceSessions || []).filter(
    (ds) => ds.session.id !== sessionData?.session.id
  );

  return (
    <SettingsCard
      action={() => navigate(`${basePath}/${viewPaths.SIGN_IN}`)}
      actionLabel={localization.ADD_ACCOUNT}
      className={className}
      classNames={classNames}
      description={localization.ACCOUNTS_DESCRIPTION}
      instructions={localization.ACCOUNTS_INSTRUCTIONS}
      isPending={isPending}
      title={localization.ACCOUNTS}
    >
      {deviceSessions?.length && (
        <CardContent className={cn('grid gap-4', classNames?.content)}>
          {sessionData && (
            <AccountCell
              classNames={classNames}
              deviceSession={sessionData}
              localization={localization}
              refetch={refetch}
            />
          )}

          {otherDeviceSessions.map((deviceSession) => (
            <AccountCell
              classNames={classNames}
              deviceSession={deviceSession}
              key={deviceSession.session.id}
              localization={localization}
              refetch={refetch}
            />
          ))}
        </CardContent>
      )}
    </SettingsCard>
  );
}
