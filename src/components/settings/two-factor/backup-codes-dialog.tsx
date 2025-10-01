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
import type { SettingsCardClassNames } from '../shared/settings-card';

interface BackupCodesDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  backupCodes: string[];
}

export function BackupCodesDialog({
  classNames,
  backupCodes,
  onOpenChange,
  ...props
}: BackupCodesDialogProps) {
  const { localization } = useContext(AuthUIContext);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codeText = backupCodes.join('\n');
    navigator.clipboard.writeText(codeText);
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
            {localization.BACKUP_CODES}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization.BACKUP_CODES_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div
              className="rounded-md bg-muted p-2 text-center font-mono text-sm"
              key={index}
            >
              {code}
            </div>
          ))}
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
                {localization.COPY_ALL_CODES}
              </>
            )}
          </Button>

          <Button
            className={cn(classNames?.button, classNames?.primaryButton)}
            onClick={() => onOpenChange?.(false)}
            type="button"
            variant="default"
          >
            {localization.CONTINUE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
