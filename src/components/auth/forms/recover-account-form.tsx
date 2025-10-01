'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Loader2 } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { useOnSuccessTransition } from '../../../hooks/use-success-transition';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { AuthFormClassNames } from '../auth-form';

export interface RecoverAccountFormProps {
  className?: string;
  classNames?: AuthFormClassNames;
  isSubmitting?: boolean;
  localization: Partial<AuthLocalization>;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

export function RecoverAccountForm({
  className,
  classNames,
  isSubmitting,
  localization,
  redirectTo,
  setIsSubmitting,
}: RecoverAccountFormProps) {
  const {
    authClient,
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const formSchema = z.object({
    code: z.string().min(1, { message: localization.BACKUP_CODE_REQUIRED }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  async function verifyBackupCode({ code }: z.infer<typeof formSchema>) {
    try {
      await authClient.twoFactor.verifyBackupCode({
        code,
        fetchOptions: { throw: true },
      });

      await onSuccess();
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('grid gap-6', className, classNames?.base)}
        onSubmit={form.handleSubmit(verifyBackupCode)}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={classNames?.label}>
                {localization.BACKUP_CODE}
              </FormLabel>

              <FormControl>
                <Input
                  autoComplete="off"
                  className={classNames?.input}
                  disabled={isSubmitting}
                  placeholder={localization.BACKUP_CODE_PLACEHOLDER}
                  {...field}
                />
              </FormControl>

              <FormMessage className={classNames?.error} />
            </FormItem>
          )}
        />

        <Button
          className={cn(classNames?.button, classNames?.primaryButton)}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            localization.RECOVER_ACCOUNT_ACTION
          )}
        </Button>
      </form>
    </Form>
  );
}
