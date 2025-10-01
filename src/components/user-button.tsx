'use client';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  ChevronsUpDown,
  LogInIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
  UserRoundPlus,
} from 'lucide-react';
import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIsHydrated } from '../hooks/use-hydrated';
import { AuthUIContext } from '../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../lib/utils';
import type { AuthLocalization } from '../localization/auth-localization';
import type { AnyAuthClient } from '../types/any-auth-client';
import type { User } from '../types/auth-client';
import { UserAvatar, type UserAvatarClassNames } from './user-avatar';
import { UserView, type UserViewClassNames } from './user-view';

export interface UserButtonClassNames {
  base?: string;
  skeleton?: string;
  trigger?: {
    base?: string;
    avatar?: UserAvatarClassNames;
    user?: UserViewClassNames;
    skeleton?: string;
  };
  content?: {
    base?: string;
    user?: UserViewClassNames;
    avatar?: UserAvatarClassNames;
    menuItem?: string;
    separator?: string;
  };
}

export interface UserButtonProps {
  className?: string;
  classNames?: UserButtonClassNames;
  align?: 'center' | 'start' | 'end';
  alignOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  additionalLinks?: {
    href: string;
    icon?: ReactNode;
    label: ReactNode;
    signedIn?: boolean;
    separator?: boolean;
  }[];
  trigger?: ReactNode;
  disableDefaultLinks?: boolean;
  /**
   * @default authLocalization
   * @remarks `AuthLocalization`
   */
  localization?: AuthLocalization;
}

/**
 * Displays an interactive user button with dropdown menu functionality
 *
 * Renders a user interface element that can be displayed as either an icon or full button:
 * - Shows a user avatar or placeholder when in icon mode
 * - Displays user name and email with dropdown indicator in full mode
 * - Provides dropdown menu with authentication options (sign in/out, settings, etc.)
 * - Supports multi-session functionality for switching between accounts
 * - Can be customized with additional links and styling options
 */
export function UserButton({
  className,
  classNames,
  align,
  alignOffset,
  side,
  sideOffset,
  trigger,
  additionalLinks,
  disableDefaultLinks,
  localization: propLocalization,
  size,
  ...props
}: UserButtonProps & ComponentProps<typeof Button>) {
  const {
    basePath,
    hooks: { useSession, useListDeviceSessions },
    mutators: { setActiveSession },
    localization: contextLocalization,
    multiSession,
    account: accountOptions,
    signUp,
    toast,
    viewPaths,
    onSessionChange,
    Link,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...propLocalization }),
    [contextLocalization, propLocalization]
  );

  let deviceSessions: AnyAuthClient['$Infer']['Session'][] | undefined | null =
    null;
  let deviceSessionsPending = false;

  if (multiSession) {
    const { data, isPending } = useListDeviceSessions();
    deviceSessions = data;
    deviceSessionsPending = isPending;
  }

  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;
  const [activeSessionPending, setActiveSessionPending] = useState(false);

  const isHydrated = useIsHydrated();
  const isPending = sessionPending || activeSessionPending || !isHydrated;

  const switchAccount = useCallback(
    async (sessionToken: string) => {
      setActiveSessionPending(true);

      try {
        await setActiveSession({ sessionToken });

        onSessionChange?.();
      } catch (error) {
        toast({
          variant: 'error',
          message: getLocalizedError({ error, localization }),
        });
        setActiveSessionPending(false);
      }
    },
    [setActiveSession, onSessionChange, toast, localization]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (!multiSession) {
      return;
    }

    setActiveSessionPending(false);
  }, [sessionData, multiSession]);

  const warningLogged = useRef(false);

  useEffect(() => {
    if (size || warningLogged.current) {
      return;
    }

    console.warn(
      "[Better Auth UI] The `size` prop of `UserButton` no longer defaults to `icon`. Please pass `size='icon'` to the `UserButton` component to get the same behaviour as before. This warning will be removed in a future release. It can be suppressed in the meantime by defining the `size` prop."
    );

    warningLogged.current = true;
  }, [size]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          size === 'icon' && 'rounded-full',
          classNames?.trigger?.base
        )}
      >
        {trigger ||
          (size === 'icon' ? (
            <Button
              className="size-fit rounded-full"
              size="icon"
              variant="ghost"
            >
              <UserAvatar
                aria-label={localization.ACCOUNT}
                className={cn(className, classNames?.base)}
                classNames={classNames?.trigger?.avatar}
                isPending={isPending}
                key={user?.image}
                localization={localization}
                user={user}
              />
            </Button>
          ) : (
            <Button
              className={cn('!p-2 h-fit', className, classNames?.trigger?.base)}
              size={size}
              {...props}
            >
              <UserView
                classNames={classNames?.trigger?.user}
                isPending={isPending}
                localization={localization}
                size={size}
                user={(user as User)?.isAnonymous ? null : user}
              />

              <ChevronsUpDown className="ml-auto" />
            </Button>
          ))}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        alignOffset={alignOffset}
        className={cn(
          'w-[--radix-dropdown-menu-trigger-width] min-w-56 max-w-64',
          classNames?.content?.base
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
        side={side}
        sideOffset={sideOffset}
      >
        <div className={cn('p-2', classNames?.content?.menuItem)}>
          {(user && !(user as User).isAnonymous) || isPending ? (
            <UserView
              classNames={classNames?.content?.user}
              isPending={isPending}
              localization={localization}
              user={user}
            />
          ) : (
            <div className="-my-1 text-muted-foreground text-xs">
              {localization.ACCOUNT}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className={classNames?.content?.separator} />

        {additionalLinks?.map(
          ({ href, icon, label, signedIn, separator }, index) =>
            (signedIn === undefined ||
              (signedIn && !!sessionData) ||
              !(signedIn || sessionData)) && (
              <Fragment key={index}>
                <Link href={href}>
                  <DropdownMenuItem className={classNames?.content?.menuItem}>
                    {icon}
                    {label}
                  </DropdownMenuItem>
                </Link>
                {separator && (
                  <DropdownMenuSeparator
                    className={classNames?.content?.separator}
                  />
                )}
              </Fragment>
            )
        )}

        {!user || (user as User).isAnonymous ? (
          <>
            <Link href={`${basePath}/${viewPaths.SIGN_IN}`}>
              <DropdownMenuItem className={classNames?.content?.menuItem}>
                <LogInIcon />

                {localization.SIGN_IN}
              </DropdownMenuItem>
            </Link>

            {signUp && (
              <Link href={`${basePath}/${viewPaths.SIGN_UP}`}>
                <DropdownMenuItem className={classNames?.content?.menuItem}>
                  <UserRoundPlus />

                  {localization.SIGN_UP}
                </DropdownMenuItem>
              </Link>
            )}
          </>
        ) : (
          <>
            {!disableDefaultLinks && accountOptions && (
              <Link
                href={`${accountOptions.basePath}/${accountOptions.viewPaths?.SETTINGS}`}
              >
                <DropdownMenuItem className={classNames?.content?.menuItem}>
                  <SettingsIcon />

                  {localization.SETTINGS}
                </DropdownMenuItem>
              </Link>
            )}

            <Link href={`${basePath}/${viewPaths.SIGN_OUT}`}>
              <DropdownMenuItem className={classNames?.content?.menuItem}>
                <LogOutIcon />

                {localization.SIGN_OUT}
              </DropdownMenuItem>
            </Link>
          </>
        )}

        {user && multiSession && (
          <>
            <DropdownMenuSeparator className={classNames?.content?.separator} />

            {!deviceSessions && deviceSessionsPending && (
              <>
                <DropdownMenuItem
                  className={classNames?.content?.menuItem}
                  disabled
                >
                  <UserView
                    classNames={classNames?.content?.user}
                    isPending={true}
                  />
                </DropdownMenuItem>

                <DropdownMenuSeparator
                  className={classNames?.content?.separator}
                />
              </>
            )}

            {deviceSessions
              ?.filter((sd) => sd.user.id !== user?.id)
              .map(({ session, user: sessionUser }) => (
                <Fragment key={session.id}>
                  <DropdownMenuItem
                    className={classNames?.content?.menuItem}
                    onClick={() => switchAccount(session.token)}
                  >
                    <UserView
                      classNames={classNames?.content?.user}
                      user={sessionUser}
                    />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator
                    className={classNames?.content?.separator}
                  />
                </Fragment>
              ))}

            <Link href={`${basePath}/${viewPaths.SIGN_IN}`}>
              <DropdownMenuItem className={classNames?.content?.menuItem}>
                <PlusCircleIcon />

                {localization.ADD_ACCOUNT}
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
