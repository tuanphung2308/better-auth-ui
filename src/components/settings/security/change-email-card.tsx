'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CardContent } from '@workspace/ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../../lib/utils';
import type { SettingsCardProps } from '../shared/settings-card';
import { SettingsCard } from '../shared/settings-card';

export function ChangeEmailCard({
  className,
  classNames,
  localization,
  ...props
}: SettingsCardProps) {
  const {
    authClient,
    emailVerification,
    hooks: { useSession },
    localization: contextLocalization,
    toast,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: sessionData, isPending, refetch } = useSession();
  const [resendDisabled, setResendDisabled] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: localization.INVALID_EMAIL }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      email: sessionData?.user.email || '',
    },
  });

  const resendForm = useForm();

  const { isSubmitting } = form.formState;

  const changeEmail = async ({ email }: z.infer<typeof formSchema>) => {
    if (email === sessionData?.user.email) {
      await new Promise((resolve) => setTimeout(resolve));
      toast({
        variant: 'error',
        message: localization.EMAIL_IS_THE_SAME,
      });
      return;
    }

    try {
      await authClient.changeEmail({
        newEmail: email,
        callbackURL: window.location.pathname,
        fetchOptions: { throw: true },
      });

      if (sessionData?.user.emailVerified) {
        toast({
          variant: 'success',
          message: localization.EMAIL_VERIFY_CHANGE!,
        });
      } else {
        await refetch?.();
        toast({
          variant: 'success',
          message: `${localization.EMAIL} ${localization.UPDATED_SUCCESSFULLY}`,
        });
      }
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }
  };

  const resendVerification = async () => {
    if (!sessionData) return;
    const email = sessionData.user.email;

    setResendDisabled(true);

    try {
      await authClient.sendVerificationEmail({
        email,
        fetchOptions: { throw: true },
      });

      toast({
        variant: 'success',
        message: localization.EMAIL_VERIFICATION!,
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
      setResendDisabled(false);
      throw error;
    }
  };

  return (
    <>
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(changeEmail)}>
          <SettingsCard
            actionLabel={localization.SAVE}
            className={className}
            classNames={classNames}
            description={localization.EMAIL_DESCRIPTION}
            instructions={localization.EMAIL_INSTRUCTIONS}
            isPending={isPending}
            title={localization.EMAIL}
            {...props}
          >
            <CardContent className={classNames?.content}>
              {isPending ? (
                <Skeleton className={cn('h-9 w-full', classNames?.skeleton)} />
              ) : (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className={classNames?.input}
                          disabled={isSubmitting}
                          placeholder={localization.EMAIL_PLACEHOLDER}
                          type="email"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage className={classNames?.error} />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </SettingsCard>
        </form>
      </Form>

      {emailVerification &&
        sessionData?.user &&
        !sessionData?.user.emailVerified && (
          <Form {...resendForm}>
            <form onSubmit={resendForm.handleSubmit(resendVerification)}>
              <SettingsCard
                actionLabel={localization.RESEND_VERIFICATION_EMAIL}
                className={className}
                classNames={classNames}
                description={localization.VERIFY_YOUR_EMAIL_DESCRIPTION}
                disabled={resendDisabled}
                title={localization.VERIFY_YOUR_EMAIL}
                {...props}
              />
            </form>
          </Form>
        )}
    </>
  );
}
