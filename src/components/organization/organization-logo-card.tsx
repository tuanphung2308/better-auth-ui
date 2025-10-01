'use client';

import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import type { Organization } from 'better-auth/plugins/organization';
import { Trash2Icon, UploadCloudIcon } from 'lucide-react';
import {
  type ComponentProps,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCurrentOrganization } from '../../hooks/use-current-organization';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { fileToBase64, resizeAndCropImage } from '../../lib/image-utils';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';
import { SettingsCardFooter } from '../settings/shared/settings-card-footer';
import { SettingsCardHeader } from '../settings/shared/settings-card-header';
import { OrganizationLogo } from './organization-logo';

export interface OrganizationLogoCardProps extends ComponentProps<typeof Card> {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  slug?: string;
}

export function OrganizationLogoCard({
  className,
  classNames,
  localization: localizationProp,
  slug,
  ...props
}: OrganizationLogoCardProps) {
  const { localization: contextLocalization } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) {
    return (
      <Card
        className={cn('w-full pb-0 text-start', className, classNames?.base)}
        {...props}
      >
        <div className="flex justify-between">
          <SettingsCardHeader
            className="grow self-start"
            classNames={classNames}
            description={localization.LOGO_DESCRIPTION}
            isPending
            title={localization.LOGO}
          />

          <Button
            className="me-6 size-fit rounded-full"
            disabled
            size="icon"
            type="button"
            variant="ghost"
          >
            <OrganizationLogo
              className="size-20 text-2xl"
              classNames={classNames?.avatar}
              isPending
              localization={localization}
            />
          </Button>
        </div>

        <SettingsCardFooter
          className="!py-5"
          classNames={classNames}
          instructions={localization.LOGO_INSTRUCTIONS}
          isPending
        />
      </Card>
    );
  }

  return (
    <OrganizationLogoForm
      className={className}
      classNames={classNames}
      localization={localization}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationLogoForm({
  className,
  classNames,
  localization: localizationProp,
  organization,
  ...props
}: OrganizationLogoCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission },
    localization: authLocalization,
    organization: organizationOptions,
    mutators: { updateOrganization },
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...authLocalization, ...localizationProp }),
    [authLocalization, localizationProp]
  );

  const { refetch: refetchOrganization } = useCurrentOrganization({
    slug: organization.slug,
  });

  const { data: hasPermission, isPending: permissionPending } =
    useHasPermission({
      organizationId: organization.id,
      permissions: {
        organization: ['update'],
      },
    });

  const isPending = permissionPending;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogoChange = async (file: File) => {
    if (!(organizationOptions?.logo && hasPermission?.success)) return;

    setLoading(true);

    const resizedFile = await resizeAndCropImage(
      file,
      crypto.randomUUID(),
      organizationOptions.logo.size,
      organizationOptions.logo.extension
    );

    let image: string | undefined | null;

    if (organizationOptions.logo.upload) {
      image = await organizationOptions.logo.upload(resizedFile);
    } else {
      image = await fileToBase64(resizedFile);
    }

    if (!image) {
      setLoading(false);
      return;
    }

    try {
      await updateOrganization({
        organizationId: organization.id,
        data: { logo: image },
      });

      await refetchOrganization?.();
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }

    setLoading(false);
  };

  const handleDeleteLogo = async () => {
    if (!hasPermission?.success) return;

    setLoading(true);

    try {
      if (organization.logo) {
        await organizationOptions?.logo?.delete?.(organization.logo);
      }

      await updateOrganization({
        organizationId: organization.id,
        data: { logo: '' },
      });

      await refetchOrganization?.();
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }

    setLoading(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      className={cn('w-full pb-0 text-start', className, classNames?.base)}
      {...props}
    >
      <input
        accept="image/*"
        disabled={loading || !hasPermission?.success}
        hidden
        onChange={(e) => {
          const file = e.target.files?.item(0);
          if (file) handleLogoChange(file);

          e.target.value = '';
        }}
        ref={fileInputRef}
        type="file"
      />

      <div className="flex justify-between">
        <SettingsCardHeader
          className="grow self-start"
          classNames={classNames}
          description={localization.LOGO_DESCRIPTION}
          isPending={isPending}
          title={localization.LOGO}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="me-6 size-fit rounded-full"
              disabled={!hasPermission?.success}
              size="icon"
              type="button"
              variant="ghost"
            >
              <OrganizationLogo
                className="size-20 text-2xl"
                classNames={classNames?.avatar}
                isPending={isPending || loading}
                key={organization.logo}
                localization={localization}
                organization={organization}
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              disabled={loading || !hasPermission?.success}
              onClick={openFileDialog}
            >
              <UploadCloudIcon />

              {localization.UPLOAD_LOGO}
            </DropdownMenuItem>

            {organization.logo && (
              <DropdownMenuItem
                disabled={loading || !hasPermission?.success}
                onClick={handleDeleteLogo}
                variant="destructive"
              >
                <Trash2Icon />

                {localization.DELETE_LOGO}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SettingsCardFooter
        className="!py-5"
        classNames={classNames}
        instructions={localization.LOGO_INSTRUCTIONS}
        isPending={isPending}
        isSubmitting={loading}
      />
    </Card>
  );
}
