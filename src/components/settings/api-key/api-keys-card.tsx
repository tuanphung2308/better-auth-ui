'use client';

import { CardContent } from '@workspace/ui/components/card';
import { useContext, useMemo, useState } from 'react';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn } from '../../../lib/utils';
import type { SettingsCardProps } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';
import { ApiKeyCell } from './api-key-cell';
import { ApiKeyDisplayDialog } from './api-key-display-dialog';
import { CreateApiKeyDialog } from './create-api-key-dialog';

export interface ApiKeysCardProps extends SettingsCardProps {
  organizationId?: string;
}

export function ApiKeysCard({
  className,
  classNames,
  localization,
  organizationId,
  ...props
}: ApiKeysCardProps) {
  const {
    hooks: { useListApiKeys },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: apiKeys, isPending, refetch } = useListApiKeys();

  // Filter API keys by organizationId
  const filteredApiKeys = useMemo(() => {
    return apiKeys?.filter(
      (apiKey) => organizationId === apiKey.metadata?.organizationId
    );
  }, [apiKeys, organizationId]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [displayDialogOpen, setDisplayDialogOpen] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState('');

  const handleCreateApiKey = (apiKey: string) => {
    setCreatedApiKey(apiKey);
    setDisplayDialogOpen(true);
  };

  return (
    <>
      <SettingsCard
        action={() => setCreateDialogOpen(true)}
        actionLabel={localization.CREATE_API_KEY}
        className={className}
        classNames={classNames}
        description={localization.API_KEYS_DESCRIPTION}
        instructions={localization.API_KEYS_INSTRUCTIONS}
        isPending={isPending}
        title={localization.API_KEYS}
        {...props}
      >
        {filteredApiKeys && filteredApiKeys.length > 0 && (
          <CardContent className={cn('grid gap-4', classNames?.content)}>
            {filteredApiKeys?.map((apiKey) => (
              <ApiKeyCell
                apiKey={apiKey}
                classNames={classNames}
                key={apiKey.id}
                localization={localization}
                refetch={refetch}
              />
            ))}
          </CardContent>
        )}
      </SettingsCard>

      <CreateApiKeyDialog
        classNames={classNames}
        localization={localization}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateApiKey}
        open={createDialogOpen}
        organizationId={organizationId}
        refetch={refetch}
      />

      <ApiKeyDisplayDialog
        apiKey={createdApiKey}
        classNames={classNames}
        localization={localization}
        onOpenChange={setDisplayDialogOpen}
        open={displayDialogOpen}
      />
    </>
  );
}
