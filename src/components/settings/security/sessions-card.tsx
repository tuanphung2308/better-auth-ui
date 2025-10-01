'use client';
import { CardContent } from '@workspace/ui/components/card';
import { useContext } from 'react';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { SettingsCardClassNames } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';
import { SettingsCellSkeleton } from '../skeletons/settings-cell-skeleton';
import { SessionCell } from './session-cell';

export interface SessionsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: Partial<AuthLocalization>;
}

export function SessionsCard({
  className,
  classNames,
  localization,
}: SessionsCardProps) {
  const {
    hooks: { useListSessions },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: sessions, isPending, refetch } = useListSessions();

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={localization.SESSIONS_DESCRIPTION}
      isPending={isPending}
      title={localization.SESSIONS}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          sessions?.map((session) => (
            <SessionCell
              classNames={classNames}
              key={session.id}
              localization={localization}
              refetch={refetch}
              session={session}
            />
          ))
        )}
      </CardContent>
    </SettingsCard>
  );
}
