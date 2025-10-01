'use client';

import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import type { Organization } from 'better-auth/plugins/organization';
import {
  ChevronsUpDown,
  LogInIcon,
  PlusCircleIcon,
  SettingsIcon,
} from 'lucide-react';
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useCurrentOrganization } from '../../hooks/use-current-organization';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { User } from '../../types/auth-client';
import { UserAvatar, type UserAvatarClassNames } from '../user-avatar';
import type { UserViewClassNames } from '../user-view';
import { CreateOrganizationDialog } from './create-organization-dialog';
import {
  OrganizationCellView,
  type OrganizationViewClassNames,
} from './organization-cell-view';
import { OrganizationLogo } from './organization-logo';
import { PersonalAccountView } from './personal-account-view';

export interface OrganizationSwitcherClassNames {
  base?: string;
  skeleton?: string;
  trigger?: {
    base?: string;
    avatar?: UserAvatarClassNames;
    user?: UserViewClassNames;
    organization?: OrganizationViewClassNames;
    skeleton?: string;
  };
  content?: {
    base?: string;
    user?: UserViewClassNames;
    organization?: OrganizationViewClassNames;
    avatar?: UserAvatarClassNames;
    menuItem?: string;
    separator?: string;
  };
}

export interface OrganizationSwitcherProps
  extends Omit<ComponentProps<typeof Button>, 'trigger'> {
  classNames?: OrganizationSwitcherClassNames;
  align?: 'center' | 'start' | 'end';
  alignOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  trigger?: ReactNode;
  localization?: AuthLocalization;
  slug?: string;
  onSetActive?: (organization: Organization | null | undefined) => void;
  /**
   * Hide the personal organization option from the switcher.
   * When true, users can only switch between organizations and cannot access their personal account.
   * If no organization is active, the first available organization will be automatically selected.
   * @default false
   */
  hidePersonal?: boolean;
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
export function OrganizationSwitcher({
  className,
  classNames,
  align,
  alignOffset,
  side,
  sideOffset,
  trigger,
  localization: localizationProp,
  slug: slugProp,
  size,
  onSetActive,
  hidePersonal,
  ...props
}: OrganizationSwitcherProps) {
  const {
    authClient,
    basePath,
    hooks: { useSession, useListOrganizations },
    localization: contextLocalization,
    account: accountOptions,
    organization: organizationOptions,
    redirectTo,
    navigate,
    toast,
    viewPaths,
    Link,
  } = useContext(AuthUIContext);

  const {
    pathMode,
    slug: contextSlug,
    personalPath,
  } = organizationOptions || {};

  const slug = slugProp || contextSlug;

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const [activeOrganizationPending, setActiveOrganizationPending] =
    useState(false);
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: sessionData, isPending: sessionPending } = useSession();
  const user = sessionData?.user;

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations();

  const {
    data: activeOrganization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
    refetch: organizationRefetch,
  } = useCurrentOrganization({ slug });

  const isPending =
    organizationsPending ||
    sessionPending ||
    activeOrganizationPending ||
    organizationPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (organizationRefetching) return;

    setActiveOrganizationPending(false);
  }, [activeOrganization, organizationRefetching]);

  const switchOrganization = useCallback(
    async (organization: Organization | null | undefined) => {
      // Prevent switching to personal account when hidePersonal is true
      if (hidePersonal && organization === null) {
        return;
      }

      if (pathMode === 'slug') {
        if (organization) {
          navigate(`${organizationOptions?.basePath}/${organization.slug}`);
        } else {
          navigate(personalPath ?? redirectTo);
        }

        return;
      }

      setActiveOrganizationPending(true);

      try {
        onSetActive?.(organization);

        await authClient.organization.setActive({
          organizationId: organization?.id || null,
          fetchOptions: {
            throw: true,
          },
        });

        organizationRefetch?.();
      } catch (error) {
        toast({
          variant: 'error',
          message: getLocalizedError({ error, localization }),
        });

        setActiveOrganizationPending(false);
      }
    },
    [
      authClient,
      toast,
      localization,
      onSetActive,
      hidePersonal,
      pathMode,
      personalPath,
      organizationOptions?.basePath,
      redirectTo,
      navigate,
      organizationRefetch,
    ]
  );

  // Auto-select first organization when hidePersonal is true
  useEffect(() => {
    if (
      hidePersonal &&
      !activeOrganization &&
      !activeOrganizationPending &&
      organizations &&
      organizations.length > 0 &&
      !sessionPending &&
      !organizationPending &&
      !slug
    ) {
      switchOrganization(organizations[0]);
    }
  }, [
    hidePersonal,
    activeOrganization,
    activeOrganizationPending,
    organizations,
    sessionPending,
    organizationPending,
    switchOrganization,
    slug,
  ]);

  return (
    <>
      <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
        <DropdownMenuTrigger asChild>
          {trigger ||
            (size === 'icon' ? (
              <Button
                className={cn(
                  'size-fit rounded-full',
                  className,
                  classNames?.trigger?.base
                )}
                size="icon"
                type="button"
                variant="ghost"
                {...props}
              >
                {isPending ||
                activeOrganization ||
                !sessionData ||
                (user as User)?.isAnonymous ||
                hidePersonal ? (
                  <OrganizationLogo
                    aria-label={localization.ORGANIZATION}
                    className={cn(className, classNames?.base)}
                    classNames={classNames?.trigger?.avatar}
                    isPending={isPending}
                    key={activeOrganization?.logo}
                    localization={localization}
                    organization={activeOrganization}
                  />
                ) : (
                  <UserAvatar
                    aria-label={localization.ACCOUNT}
                    className={cn(className, classNames?.base)}
                    classNames={classNames?.trigger?.avatar}
                    key={user?.image}
                    localization={localization}
                    user={user}
                  />
                )}
              </Button>
            ) : (
              <Button
                className={cn(
                  '!p-2 h-fit',
                  className,
                  classNames?.trigger?.base
                )}
                size={size}
                {...props}
              >
                {isPending ||
                activeOrganization ||
                !sessionData ||
                (user as User)?.isAnonymous ||
                hidePersonal ? (
                  <OrganizationCellView
                    classNames={classNames?.trigger?.organization}
                    isPending={isPending}
                    localization={localization}
                    organization={activeOrganization}
                    size={size}
                  />
                ) : (
                  <PersonalAccountView
                    classNames={classNames?.trigger?.user}
                    localization={localization}
                    size={size}
                    user={user}
                  />
                )}

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
          <div
            className={cn(
              'flex items-center justify-between gap-2 p-2',
              classNames?.content?.menuItem
            )}
          >
            {(user && !(user as User).isAnonymous) || isPending ? (
              <>
                {activeOrganizationPending ||
                activeOrganization ||
                hidePersonal ? (
                  <OrganizationCellView
                    classNames={classNames?.content?.organization}
                    isPending={isPending || activeOrganizationPending}
                    localization={localization}
                    organization={activeOrganization}
                  />
                ) : (
                  <PersonalAccountView
                    classNames={classNames?.content?.user}
                    isPending={isPending}
                    localization={localization}
                    user={user}
                  />
                )}

                {!isPending && (
                  <Link
                    href={
                      activeOrganization
                        ? pathMode === 'slug'
                          ? `${organizationOptions?.basePath}/${activeOrganization.slug}/${organizationOptions?.viewPaths.SETTINGS}`
                          : `${organizationOptions?.basePath}/${organizationOptions?.viewPaths.SETTINGS}`
                        : `${accountOptions?.basePath}/${accountOptions?.viewPaths.SETTINGS}`
                    }
                  >
                    <Button
                      className="!size-8 ml-auto"
                      onClick={() => setDropdownOpen(false)}
                      size="icon"
                      variant="outline"
                    >
                      <SettingsIcon className="size-4" />
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <div className="-my-1 text-muted-foreground text-xs">
                {localization.ORGANIZATION}
              </div>
            )}
          </div>

          <DropdownMenuSeparator className={classNames?.content?.separator} />

          {activeOrganization &&
            !hidePersonal &&
            (pathMode === 'slug' ? (
              <Link href={personalPath ?? redirectTo}>
                <DropdownMenuItem>
                  <PersonalAccountView
                    classNames={classNames?.content?.user}
                    isPending={isPending}
                    localization={localization}
                    user={user}
                  />
                </DropdownMenuItem>
              </Link>
            ) : (
              <DropdownMenuItem onClick={() => switchOrganization(null)}>
                <PersonalAccountView
                  classNames={classNames?.content?.user}
                  isPending={isPending}
                  localization={localization}
                  user={user}
                />
              </DropdownMenuItem>
            ))}

          {organizations?.map(
            (organization) =>
              organization.id !== activeOrganization?.id &&
              (pathMode === 'slug' ? (
                <Link
                  href={`${organizationOptions?.basePath}/${organization.slug}`}
                  key={organization.id}
                >
                  <DropdownMenuItem>
                    <OrganizationCellView
                      classNames={classNames?.content?.organization}
                      isPending={isPending}
                      localization={localization}
                      organization={organization}
                    />
                  </DropdownMenuItem>
                </Link>
              ) : (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => switchOrganization(organization)}
                >
                  <OrganizationCellView
                    classNames={classNames?.content?.organization}
                    isPending={isPending}
                    localization={localization}
                    organization={organization}
                  />
                </DropdownMenuItem>
              ))
          )}

          {organizations &&
            organizations.length > 0 &&
            (!hidePersonal || organizations.length > 1) && (
              <DropdownMenuSeparator
                className={classNames?.content?.separator}
              />
            )}

          {!isPending && sessionData && !(user as User).isAnonymous ? (
            <DropdownMenuItem
              className={cn(classNames?.content?.menuItem)}
              onClick={() => setIsCreateOrgDialogOpen(true)}
            >
              <PlusCircleIcon />
              {localization.CREATE_ORGANIZATION}
            </DropdownMenuItem>
          ) : (
            <Link href={`${basePath}/${viewPaths.SIGN_IN}`}>
              <DropdownMenuItem className={cn(classNames?.content?.menuItem)}>
                <LogInIcon />
                {localization.SIGN_IN}
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        localization={localization}
        onOpenChange={setIsCreateOrgDialogOpen}
        open={isCreateOrgDialogOpen}
      />
    </>
  );
}
