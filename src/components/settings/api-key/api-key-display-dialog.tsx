'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { type ComponentProps, useContext, useState } from 'react';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { SettingsCardClassNames } from '../shared/settings-card';

interface ApiKeyDisplayDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  apiKey: string;
}

export function ApiKeyDisplayDialog({
  classNames,
  apiKey,
  localization,
  onOpenChange,
  ...props
}: ApiKeyDisplayDialogProps) {
  const { localization: contextLocalization } = useContext(AuthUIContext);
  localization = { ...contextLocalization, ...localization };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={classNames?.dialog?.content}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn('text-lg md:text-xl', classNames?.title)}>
            {localization.API_KEY_CREATED}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization.CREATE_API_KEY_SUCCESS}
          </DialogDescription>
        </DialogHeader>

        <div className="break-all rounded-md bg-muted p-4 font-mono text-sm">
          {apiKey}
        </div>

        <DialogFooter className={classNames?.dialog?.footer}>
          <Button
            className={cn(classNames?.button, classNames?.outlineButton)}
            disabled={copied}
            onClick={handleCopy}
            type="button"
            variant="outline"
          >
            {copied ? (
              <>
                <CheckIcon className={classNames?.icon} />
                {localization.COPIED_TO_CLIPBOARD}
              </>
            ) : (
              <>
                <CopyIcon className={classNames?.icon} />
                {localization.COPY_TO_CLIPBOARD}
              </>
            )}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.primaryButton)}
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="default"
          >
            {localization.DONE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
