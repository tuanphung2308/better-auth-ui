'use client';

import { CardContent } from '@workspace/ui/components/card';
import type { Account } from 'better-auth';
import { useContext } from 'react';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { socialProviders } from '../../../lib/social-providers';
import { cn } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { Refetch } from '../../../types/refetch';
import type { SettingsCardClassNames } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';
import { SettingsCellSkeleton } from '../skeletons/settings-cell-skeleton';
import { ProviderCell } from './provider-cell';

export interface ProvidersCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: Account[] | null;
  isPending?: boolean;
  localization?: Partial<AuthLocalization>;
  skipHook?: boolean;
  refetch?: Refetch;
}

export function ProvidersCard({
  className,
  classNames,
  accounts,
  isPending,
  localization,
  skipHook,
  refetch,
}: ProvidersCardProps) {
  const {
    hooks: { useListAccounts },
    localization: contextLocalization,
    social,
    genericOAuth,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  if (!skipHook) {
    const result = useListAccounts();
    accounts = result.data;
    isPending = result.isPending;
    refetch = result.refetch;
  }

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={localization.PROVIDERS_DESCRIPTION}
      isPending={isPending}
      title={localization.PROVIDERS}
    >
      <CardContent className={cn('grid gap-4', classNames?.content)}>
        {isPending ? (
          social?.providers?.map((provider) => (
            <SettingsCellSkeleton classNames={classNames} key={provider} />
          ))
        ) : (
          <>
            {social?.providers?.map((provider) => {
              const socialProvider = socialProviders.find(
                (socialProvider) => socialProvider.provider === provider
              );

              if (!socialProvider) return null;

              return (
                <ProviderCell
                  account={accounts?.find((acc) => acc.providerId === provider)}
                  classNames={classNames}
                  key={provider}
                  provider={socialProvider}
                  refetch={refetch}
                />
              );
            })}

            {genericOAuth?.providers?.map((provider) => (
              <ProviderCell
                account={accounts?.find(
                  (acc) => acc.providerId === provider.provider
                )}
                classNames={classNames}
                key={provider.provider}
                other
                provider={provider}
                refetch={refetch}
              />
            ))}
          </>
        )}
      </CardContent>
    </SettingsCard>
  );
}
