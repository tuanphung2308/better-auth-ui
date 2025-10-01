import { Button } from '@workspace/ui/components/button';
import type { SocialProvider } from 'better-auth/social-providers';
import { useCallback, useContext } from 'react';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import type { Provider } from '../../lib/social-providers';
import { cn, getLocalizedError, getSearchParam } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { AuthViewClassNames } from './auth-view';

interface ProviderButtonProps {
  className?: string;
  classNames?: AuthViewClassNames;
  callbackURL?: string;
  isSubmitting: boolean;
  localization: Partial<AuthLocalization>;
  other?: boolean;
  provider: Provider;
  redirectTo?: string;
  socialLayout: 'auto' | 'horizontal' | 'grid' | 'vertical';
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export function ProviderButton({
  className,
  classNames,
  callbackURL: callbackURLProp,
  isSubmitting,
  localization,
  other,
  provider,
  redirectTo: redirectToProp,
  socialLayout,
  setIsSubmitting,
}: ProviderButtonProps) {
  const {
    authClient,
    basePath,
    baseURL,
    persistClient,
    redirectTo: contextRedirectTo,
    viewPaths,
    social,
    genericOAuth,
    toast,
  } = useContext(AuthUIContext);

  const getRedirectTo = useCallback(
    () => redirectToProp || getSearchParam('redirectTo') || contextRedirectTo,
    [redirectToProp, contextRedirectTo]
  );

  const getCallbackURL = useCallback(
    () =>
      `${baseURL}${
        callbackURLProp ||
        (persistClient
          ? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${getRedirectTo()}`
          : getRedirectTo())
      }`,
    [
      callbackURLProp,
      persistClient,
      basePath,
      viewPaths,
      baseURL,
      getRedirectTo,
    ]
  );

  const doSignInSocial = async () => {
    setIsSubmitting(true);

    try {
      if (other) {
        const oauth2Params = {
          providerId: provider.provider,
          callbackURL: getCallbackURL(),
          fetchOptions: { throw: true },
        };

        if (genericOAuth?.signIn) {
          await genericOAuth.signIn(oauth2Params);

          setTimeout(() => {
            setIsSubmitting(false);
          }, 10_000);
        } else {
          await authClient.signIn.oauth2(oauth2Params);
        }
      } else {
        const socialParams = {
          provider: provider.provider as SocialProvider,
          callbackURL: getCallbackURL(),
          fetchOptions: { throw: true },
        };

        if (social?.signIn) {
          await social.signIn(socialParams);

          setTimeout(() => {
            setIsSubmitting(false);
          }, 10_000);
        } else {
          await authClient.signIn.social(socialParams);
        }
      }
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });

      setIsSubmitting(false);
    }
  };

  return (
    <Button
      className={cn(
        socialLayout === 'vertical' ? 'w-full' : 'grow',
        className,
        classNames?.form?.button,
        classNames?.form?.outlineButton,
        classNames?.form?.providerButton
      )}
      disabled={isSubmitting}
      onClick={doSignInSocial}
      variant="outline"
    >
      {provider.icon && <provider.icon className={classNames?.form?.icon} />}

      {socialLayout === 'grid' && provider.name}
      {socialLayout === 'vertical' &&
        `${localization.SIGN_IN_WITH} ${provider.name}`}
    </Button>
  );
}
