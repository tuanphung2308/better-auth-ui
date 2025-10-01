'use client';

import { CardContent } from '@workspace/ui/components/card';
import { Form } from '@workspace/ui/components/form';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import { SessionFreshnessDialog } from '../shared/session-freshness-dialog';
import type { SettingsCardClassNames } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';
import { PasskeyCell } from './passkey-cell';

export interface PasskeysCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
}

export function PasskeysCard({
  className,
  classNames,
  localization,
}: PasskeysCardProps) {
  const {
    authClient,
    freshAge,
    hooks: { useListPasskeys, useSession },
    localization: authLocalization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...authLocalization, ...localization };

  const { data: passkeys, isPending, refetch } = useListPasskeys();

  const { data: sessionData } = useSession();
  const session = sessionData?.session;
  const isFresh = session
    ? Date.now() - new Date(session?.createdAt).getTime() < freshAge * 1000
    : false;

  const [showFreshnessDialog, setShowFreshnessDialog] = useState(false);

  const addPasskey = async () => {
    // If session isn't fresh, show the freshness dialog
    if (!isFresh) {
      setShowFreshnessDialog(true);
      return;
    }

    try {
      await authClient.passkey.addPasskey({
        fetchOptions: { throw: true },
      });
      await refetch?.();
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }
  };

  const form = useForm();

  return (
    <>
      <SessionFreshnessDialog
        classNames={classNames}
        localization={localization}
        onOpenChange={setShowFreshnessDialog}
        open={showFreshnessDialog}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(addPasskey)}>
          <SettingsCard
            actionLabel={localization.ADD_PASSKEY}
            className={className}
            classNames={classNames}
            description={localization.PASSKEYS_DESCRIPTION}
            instructions={localization.PASSKEYS_INSTRUCTIONS}
            isPending={isPending}
            title={localization.PASSKEYS}
          >
            {passkeys && passkeys.length > 0 && (
              <CardContent className={cn('grid gap-4', classNames?.content)}>
                {passkeys?.map((passkey) => (
                  <PasskeyCell
                    classNames={classNames}
                    key={passkey.id}
                    localization={localization}
                    passkey={passkey}
                  />
                ))}
              </CardContent>
            )}
          </SettingsCard>
        </form>
      </Form>
    </>
  );
}
