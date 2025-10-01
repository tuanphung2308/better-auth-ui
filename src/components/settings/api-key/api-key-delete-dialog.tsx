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
import { KeyRoundIcon, Loader2 } from 'lucide-react';
import { type ComponentProps, useContext, useState } from 'react';
import { useLang } from '../../../hooks/use-lang';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { ApiKey } from '../../../types/api-key';
import type { Refetch } from '../../../types/refetch';
import type { SettingsCardClassNames } from '../shared/settings-card';

interface ApiKeyDeleteDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  apiKey: ApiKey;
  localization?: AuthLocalization;
  refetch?: Refetch;
}

export function ApiKeyDeleteDialog({
  classNames,
  apiKey,
  localization,
  refetch,
  onOpenChange,
  ...props
}: ApiKeyDeleteDialogProps) {
  const {
    localization: contextLocalization,
    mutators: { deleteApiKey },
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { lang } = useLang();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deleteApiKey({ keyId: apiKey.id });
      await refetch?.();
      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }

    setIsLoading(false);
  };

  // Format expiration date or show "Never expires"
  const formatExpiration = () => {
    if (!apiKey.expiresAt) return localization.NEVER_EXPIRES;

    const expiresDate = new Date(apiKey.expiresAt);
    return `${localization.EXPIRES} ${expiresDate.toLocaleDateString(
      lang ?? 'en',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )}`;
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={classNames?.dialog?.content}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn('text-lg md:text-xl', classNames?.title)}>
            {localization.DELETE} {localization.API_KEY}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization.DELETE_API_KEY_CONFIRM}
          </DialogDescription>
        </DialogHeader>

        <Card
          className={cn(
            'my-2 flex-row items-center gap-3 px-4 py-3',
            classNames?.cell
          )}
        >
          <KeyRoundIcon className={cn('size-4', classNames?.icon)} />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{apiKey.name}</span>

              <span className="text-muted-foreground text-sm">
                {apiKey.start}
                {'******'}
              </span>
            </div>

            <div className="text-muted-foreground text-xs">
              {formatExpiration()}
            </div>
          </div>
        </Card>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            className={cn(classNames?.button, classNames?.secondaryButton)}
            disabled={isLoading}
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="secondary"
          >
            {localization.CANCEL}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.destructiveButton)}
            disabled={isLoading}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {localization.DELETE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
