'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Loader2 } from 'lucide-react';
import { type ComponentProps, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../../lib/utils';
import { PasswordInput } from '../../password-input';
import type { SettingsCardClassNames } from '../shared/settings-card';
import { BackupCodesDialog } from './backup-codes-dialog';

interface TwoFactorPasswordDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  isTwoFactorEnabled: boolean;
}

export function TwoFactorPasswordDialog({
  classNames,
  onOpenChange,
  isTwoFactorEnabled,
  ...props
}: TwoFactorPasswordDialogProps) {
  const {
    localization,
    authClient,
    basePath,
    viewPaths,
    navigate,
    toast,
    twoFactor,
  } = useContext(AuthUIContext);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpURI, setTotpURI] = useState<string | null>(null);

  const formSchema = z.object({
    password: z.string().min(1, { message: localization.PASSWORD_REQUIRED }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function enableTwoFactor({ password }: z.infer<typeof formSchema>) {
    try {
      const response = await authClient.twoFactor.enable({
        password,
        fetchOptions: { throw: true },
      });

      onOpenChange?.(false);
      setBackupCodes(response.backupCodes);

      if (twoFactor?.includes('totp')) {
        setTotpURI(response.totpURI);
      }

      setTimeout(() => {
        setShowBackupCodesDialog(true);
      }, 250);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }
  }

  async function disableTwoFactor({ password }: z.infer<typeof formSchema>) {
    try {
      await authClient.twoFactor.disable({
        password,
        fetchOptions: { throw: true },
      });

      toast({
        variant: 'success',
        message: localization.TWO_FACTOR_DISABLED,
      });

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }
  }

  return (
    <>
      <Dialog onOpenChange={onOpenChange} {...props}>
        <DialogContent className={cn('sm:max-w-md', classNames?.dialog)}>
          <DialogHeader className={classNames?.dialog?.header}>
            <DialogTitle className={classNames?.title}>
              {localization.TWO_FACTOR}
            </DialogTitle>

            <DialogDescription className={classNames?.description}>
              {isTwoFactorEnabled
                ? localization.TWO_FACTOR_DISABLE_INSTRUCTIONS
                : localization.TWO_FACTOR_ENABLE_INSTRUCTIONS}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(
                isTwoFactorEnabled ? disableTwoFactor : enableTwoFactor
              )}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={classNames?.label}>
                      {localization.PASSWORD}
                    </FormLabel>

                    <FormControl>
                      <PasswordInput
                        autoComplete="current-password"
                        className={classNames?.input}
                        placeholder={localization.PASSWORD_PLACEHOLDER}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className={classNames?.error} />
                  </FormItem>
                )}
              />

              <DialogFooter className={classNames?.dialog?.footer}>
                <Button
                  className={cn(
                    classNames?.button,
                    classNames?.secondaryButton
                  )}
                  onClick={() => onOpenChange?.(false)}
                  type="button"
                  variant="secondary"
                >
                  {localization.CANCEL}
                </Button>

                <Button
                  className={cn(classNames?.button, classNames?.primaryButton)}
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  {isTwoFactorEnabled
                    ? localization.DISABLE_TWO_FACTOR
                    : localization.ENABLE_TWO_FACTOR}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BackupCodesDialog
        backupCodes={backupCodes}
        classNames={classNames}
        onOpenChange={(open) => {
          setShowBackupCodesDialog(open);

          if (!open) {
            const url = `${basePath}/${viewPaths.TWO_FACTOR}`;
            navigate(
              twoFactor?.includes('totp') && totpURI
                ? `${url}?totpURI=${totpURI}`
                : url
            );
          }
        }}
        open={showBackupCodesDialog}
      />
    </>
  );
}
