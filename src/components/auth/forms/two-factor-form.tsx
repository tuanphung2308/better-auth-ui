'use client';

import type { BetterFetchError } from '@better-fetch/fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { InputOTP } from '@workspace/ui/components/input-otp';
import { Label } from '@workspace/ui/components/label';
import { Loader2, QrCodeIcon, SendIcon } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'react-qr-code';
import z from 'zod';
import { useIsHydrated } from '../../../hooks/use-hydrated';
import { useOnSuccessTransition } from '../../../hooks/use-success-transition';
import { AuthUIContext } from '../../../lib/auth-ui-provider';
import { cn, getLocalizedError, getSearchParam } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { User } from '../../../types/auth-client';
import type { AuthFormClassNames } from '../auth-form';
import { OTPInputGroup } from '../otp-input-group';

export interface TwoFactorFormProps {
  className?: string;
  classNames?: AuthFormClassNames;
  isSubmitting?: boolean;
  localization?: Partial<AuthLocalization>;
  otpSeparators?: 0 | 1 | 2;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

export function TwoFactorForm({
  className,
  classNames,
  isSubmitting,
  localization,
  otpSeparators = 0,
  redirectTo,
  setIsSubmitting,
}: TwoFactorFormProps) {
  const isHydrated = useIsHydrated();
  const totpURI = isHydrated ? getSearchParam('totpURI') : null;
  const initialSendRef = useRef(false);

  const {
    authClient,
    basePath,
    hooks: { useSession },
    localization: contextLocalization,
    twoFactor,
    viewPaths,
    toast,
    Link,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const { data: sessionData } = useSession();
  const isTwoFactorEnabled = (sessionData?.user as User)?.twoFactorEnabled;

  const [method, setMethod] = useState<'totp' | 'otp' | null>(
    twoFactor?.length === 1 && twoFactor?.[0] ? twoFactor[0] : null
  );

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const formSchema = z.object({
    code: z
      .string()
      .min(1, {
        message: `${localization.ONE_TIME_PASSWORD} ${localization.IS_REQUIRED}`,
      })
      .min(6, {
        message: `${localization.ONE_TIME_PASSWORD} ${localization.IS_INVALID}`,
      }),
    trustDevice: z.boolean().optional(),
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (method === 'otp' && cooldownSeconds <= 0 && !initialSendRef.current) {
      initialSendRef.current = true;
      sendOtp();
    }
  }, [method]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const sendOtp = async () => {
    if (isSendingOtp || cooldownSeconds > 0) return;

    try {
      setIsSendingOtp(true);
      await authClient.twoFactor.sendOtp({
        fetchOptions: { throw: true },
      });
      setCooldownSeconds(60);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });

      if (
        (error as BetterFetchError).error.code === 'INVALID_TWO_FACTOR_COOKIE'
      ) {
        history.back();
      }
    }

    initialSendRef.current = false;
    setIsSendingOtp(false);
  };

  async function verifyCode({ code, trustDevice }: z.infer<typeof formSchema>) {
    try {
      const verifyMethod =
        method === 'totp'
          ? authClient.twoFactor.verifyTotp
          : authClient.twoFactor.verifyOtp;

      await verifyMethod({
        code,
        trustDevice,
        fetchOptions: { throw: true },
      });

      await onSuccess();

      if (sessionData && !isTwoFactorEnabled) {
        toast({
          variant: 'success',
          message: localization?.TWO_FACTOR_ENABLED,
        });
      }
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
        className={cn('grid w-full gap-6', className, classNames?.base)}
        onSubmit={form.handleSubmit(verifyCode)}
      >
        {twoFactor?.includes('totp') && totpURI && method === 'totp' && (
          <div className="space-y-3">
            <Label className={classNames?.label}>
              {localization.TWO_FACTOR_TOTP_LABEL}
            </Label>

            <QRCode
              className={cn('border shadow-xs', classNames?.qrCode)}
              value={totpURI}
            />
          </div>
        )}

        {method !== null && (
          <>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className={classNames?.label}>
                      {localization.ONE_TIME_PASSWORD}
                    </FormLabel>

                    <Link
                      className={cn(
                        'text-sm hover:underline',
                        classNames?.forgotPasswordLink
                      )}
                      href={`${basePath}/${viewPaths.RECOVER_ACCOUNT}${
                        isHydrated ? window.location.search : ''
                      }`}
                    >
                      {localization.FORGOT_AUTHENTICATOR}
                    </Link>
                  </div>

                  <FormControl>
                    <InputOTP
                      {...field}
                      className={classNames?.otpInput}
                      containerClassName={classNames?.otpInputContainer}
                      disabled={isSubmitting}
                      maxLength={6}
                      onChange={(value) => {
                        field.onChange(value);

                        if (value.length === 6) {
                          form.handleSubmit(verifyCode)();
                        }
                      }}
                    >
                      <OTPInputGroup otpSeparators={otpSeparators} />
                    </InputOTP>
                  </FormControl>

                  <FormMessage className={classNames?.error} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trustDevice"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className={classNames?.checkbox}
                      disabled={isSubmitting}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <FormLabel className={classNames?.label}>
                    {localization.TRUST_DEVICE}
                  </FormLabel>
                </FormItem>
              )}
            />
          </>
        )}

        <div className="grid gap-4">
          {method !== null && (
            <Button
              className={cn(classNames?.button, classNames?.primaryButton)}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {localization.TWO_FACTOR_ACTION}
            </Button>
          )}

          {method === 'otp' && twoFactor?.includes('otp') && (
            <Button
              className={cn(classNames?.button, classNames?.outlineButton)}
              disabled={cooldownSeconds > 0 || isSendingOtp || isSubmitting}
              onClick={sendOtp}
              type="button"
              variant="outline"
            >
              {isSendingOtp ? (
                <Loader2 className="animate-spin" />
              ) : (
                <SendIcon className={classNames?.icon} />
              )}

              {localization.RESEND_CODE}
              {cooldownSeconds > 0 && ` (${cooldownSeconds})`}
            </Button>
          )}

          {method !== 'otp' && twoFactor?.includes('otp') && (
            <Button
              className={cn(classNames?.button, classNames?.secondaryButton)}
              disabled={isSubmitting}
              onClick={() => setMethod('otp')}
              type="button"
              variant="secondary"
            >
              <SendIcon className={classNames?.icon} />
              {localization.SEND_VERIFICATION_CODE}
            </Button>
          )}

          {method !== 'totp' && twoFactor?.includes('totp') && (
            <Button
              className={cn(classNames?.button, classNames?.secondaryButton)}
              disabled={isSubmitting}
              onClick={() => setMethod('totp')}
              type="button"
              variant="secondary"
            >
              <QrCodeIcon className={classNames?.icon} />
              {localization.CONTINUE_WITH_AUTHENTICATOR}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
