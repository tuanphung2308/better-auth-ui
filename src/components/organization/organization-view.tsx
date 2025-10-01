'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@workspace/ui/components/drawer';
import { Label } from '@workspace/ui/components/label';
import { MenuIcon } from 'lucide-react';
import { useContext, useEffect, useMemo } from 'react';
import { useAuthenticate } from '../../hooks/use-authenticate';
import { useCurrentOrganization } from '../../hooks/use-current-organization';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getViewByPath } from '../../lib/utils';
import type { OrganizationViewPath } from '../../server';
import type { AccountViewProps } from '../account/account-view';
import { ApiKeysCard } from '../settings/api-key/api-keys-card';
import { OrganizationInvitationsCard } from './organization-invitations-card';
import { OrganizationMembersCard } from './organization-members-card';
import { OrganizationSettingsCards } from './organization-settings-cards';

export type OrganizationViewPageProps = Omit<AccountViewProps, 'view'> & {
  slug?: string;
  view?: OrganizationViewPath;
};

export function OrganizationView({
  className,
  classNames,
  localization: localizationProp,
  path: pathProp,
  pathname,
  view: viewProp,
  hideNav,
  slug: slugProp,
}: OrganizationViewPageProps) {
  const {
    organization: organizationOptions,
    localization: contextLocalization,
    account: accountOptions,
    Link,
    replace,
  } = useContext(AuthUIContext);

  const { slug: contextSlug, viewPaths, apiKey } = organizationOptions || {};

  useAuthenticate();

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const path = pathProp ?? pathname?.split('/').pop();

  const view = viewProp || getViewByPath(viewPaths!, path) || 'SETTINGS';

  const slug = slugProp || contextSlug;

  const {
    data: organization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
  } = useCurrentOrganization({ slug });

  const navItems: {
    view: OrganizationViewPath;
    label: string;
  }[] = [
    { view: 'SETTINGS', label: localization.SETTINGS },
    { view: 'MEMBERS', label: localization.MEMBERS },
  ];

  if (apiKey) {
    navItems.push({
      view: 'API_KEYS',
      label: localization.API_KEYS,
    });
  }

  useEffect(() => {
    if (organization || organizationPending || organizationRefetching) return;

    replace(
      `${accountOptions?.basePath}/${accountOptions?.viewPaths?.ORGANIZATIONS}`
    );
  }, [
    organization,
    organizationPending,
    organizationRefetching,
    accountOptions?.basePath,
    accountOptions?.viewPaths?.ORGANIZATIONS,
    replace,
  ]);

  return (
    <div
      className={cn(
        'flex w-full grow flex-col gap-4 md:flex-row md:gap-12',
        className,
        classNames?.base
      )}
    >
      {!hideNav && (
        <div className="flex justify-between gap-2 md:hidden">
          <Label className="font-semibold text-base">
            {navItems.find((i) => i.view === view)?.label}
          </Label>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <MenuIcon />
              </Button>
            </DrawerTrigger>

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="hidden">
                  {localization.ORGANIZATION}
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col px-4 pb-4">
                {navItems.map((item) => (
                  <Link
                    href={`${organizationOptions?.basePath}${
                      organizationOptions?.pathMode === 'slug' ? `/${slug}` : ''
                    }/${organizationOptions?.viewPaths[item.view]}`}
                    key={item.view}
                  >
                    <Button
                      className={cn(
                        'w-full justify-start px-4 transition-none',
                        classNames?.drawer?.menuItem,
                        view === item.view
                          ? 'font-semibold'
                          : 'text-foreground/70'
                      )}
                      size="lg"
                      variant="ghost"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      {!hideNav && (
        <div className="hidden md:block">
          <div
            className={cn(
              'flex w-48 flex-col gap-1 lg:w-60',
              classNames?.sidebar?.base
            )}
          >
            {navItems.map((item) => (
              <Link
                href={`${organizationOptions?.basePath}${
                  organizationOptions?.pathMode === 'slug' ? `/${slug}` : ''
                }/${organizationOptions?.viewPaths[item.view]}`}
                key={item.view}
              >
                <Button
                  className={cn(
                    'w-full justify-start px-4 transition-none',
                    classNames?.sidebar?.button,
                    view === item.view ? 'font-semibold' : 'text-foreground/70',
                    view === item.view && classNames?.sidebar?.buttonActive
                  )}
                  size="lg"
                  variant="ghost"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {view === 'MEMBERS' && (
        <div
          className={cn(
            'flex w-full flex-col gap-4 md:gap-6',
            className,
            classNames?.cards
          )}
        >
          <OrganizationMembersCard
            classNames={classNames?.card}
            localization={localization}
            slug={slug}
          />

          <OrganizationInvitationsCard
            classNames={classNames?.card}
            localization={localization}
            slug={slug}
          />
        </div>
      )}

      {view === 'API_KEYS' && (
        <ApiKeysCard
          classNames={classNames?.card}
          isPending={organizationPending}
          localization={localization}
          organizationId={organization?.id}
        />
      )}

      {view === 'SETTINGS' && (
        <OrganizationSettingsCards
          classNames={classNames}
          localization={localization}
          slug={slug}
        />
      )}
    </div>
  );
}
