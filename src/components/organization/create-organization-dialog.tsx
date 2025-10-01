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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Loader2, Trash2Icon, UploadCloudIcon } from 'lucide-react';
import {
  type ComponentProps,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { fileToBase64, resizeAndCropImage } from '../../lib/image-utils';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';
import { OrganizationLogo } from './organization-logo';

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export interface CreateOrganizationDialogProps
  extends ComponentProps<typeof Dialog> {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
}

export function CreateOrganizationDialog({
  className,
  classNames,
  localization: localizationProp,
  onOpenChange,
  ...props
}: CreateOrganizationDialogProps) {
  const {
    authClient,
    localization: contextLocalization,
    organization: organizationOptions,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const [logo, setLogo] = useState<string | null>(null);
  const [logoPending, setLogoPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFileDialog = () => fileInputRef.current?.click();

  const formSchema = z.object({
    logo: z.string().optional(),
    name: z.string().min(1, {
      message: `${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`,
    }),
    slug: z
      .string()
      .min(1, {
        message: `${localization.ORGANIZATION_SLUG} ${localization.IS_REQUIRED}`,
      })
      .regex(/^[a-z0-9-]+$/, {
        message: `${localization.ORGANIZATION_SLUG} ${localization.IS_INVALID}`,
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: '',
      name: '',
      slug: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleLogoChange = async (file: File) => {
    if (!organizationOptions?.logo) return;

    setLogoPending(true);

    try {
      const resizedFile = await resizeAndCropImage(
        file,
        crypto.randomUUID(),
        organizationOptions.logo.size,
        organizationOptions.logo.extension
      );

      let image: string | undefined | null;

      if (organizationOptions?.logo.upload) {
        image = await organizationOptions.logo.upload(resizedFile);
      } else {
        image = await fileToBase64(resizedFile);
      }

      setLogo(image || null);
      form.setValue('logo', image || '');
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }

    setLogoPending(false);
  };

  const deleteLogo = async () => {
    setLogoPending(true);

    const currentUrl = logo || undefined;
    if (currentUrl && organizationOptions?.logo?.delete) {
      await organizationOptions.logo.delete(currentUrl);
    }

    setLogo(null);
    form.setValue('logo', '');
    setLogoPending(false);
  };

  async function onSubmit({ name, slug, logo }: z.infer<typeof formSchema>) {
    try {
      const organization = await authClient.organization.create({
        name,
        slug,
        logo,
        fetchOptions: { throw: true },
      });

      if (organizationOptions?.pathMode === 'slug') {
        navigate(`${organizationOptions.basePath}/${organization.slug}`);
        return;
      }

      await authClient.organization.setActive({
        organizationId: organization.id,
      });

      onOpenChange?.(false);
      form.reset();
      setLogo(null);

      toast({
        variant: 'success',
        message: localization.CREATE_ORGANIZATION_SUCCESS,
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={classNames?.dialog?.content}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn('text-lg md:text-xl', classNames?.title)}>
            {localization.CREATE_ORGANIZATION}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization.ORGANIZATIONS_INSTRUCTIONS}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {organizationOptions?.logo && (
              <FormField
                control={form.control}
                name="logo"
                render={() => (
                  <FormItem>
                    <input
                      accept="image/*"
                      disabled={logoPending}
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.item(0);
                        if (file) handleLogoChange(file);
                        e.target.value = '';
                      }}
                      ref={fileInputRef}
                      type="file"
                    />

                    <FormLabel>{localization.LOGO}</FormLabel>

                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-fit rounded-full"
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <OrganizationLogo
                              className="size-16"
                              isPending={logoPending}
                              localization={localization}
                              organization={{
                                name: form.watch('name'),
                                logo,
                              }}
                            />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuItem
                            disabled={logoPending}
                            onClick={openFileDialog}
                          >
                            <UploadCloudIcon />

                            {localization.UPLOAD_LOGO}
                          </DropdownMenuItem>

                          {logo && (
                            <DropdownMenuItem
                              disabled={logoPending}
                              onClick={deleteLogo}
                              variant="destructive"
                            >
                              <Trash2Icon />

                              {localization.DELETE_LOGO}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        disabled={logoPending}
                        onClick={openFileDialog}
                        type="button"
                        variant="outline"
                      >
                        {logoPending && <Loader2 className="animate-spin" />}

                        {localization.UPLOAD}
                      </Button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{localization.ORGANIZATION_NAME}</FormLabel>

                  <FormControl>
                    <Input
                      placeholder={localization.ORGANIZATION_NAME_PLACEHOLDER}
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!form.formState.touchedFields.slug) {
                          const next = slugify(event.target.value);
                          form.setValue('slug', next, { shouldValidate: true });
                        }
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{localization.ORGANIZATION_SLUG}</FormLabel>

                  <FormControl>
                    <Input
                      placeholder={localization.ORGANIZATION_SLUG_PLACEHOLDER}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                className={cn(classNames?.button, classNames?.outlineButton)}
                onClick={() => onOpenChange?.(false)}
                type="button"
                variant="outline"
              >
                {localization.CANCEL}
              </Button>

              <Button
                className={cn(classNames?.button, classNames?.primaryButton)}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {localization.CREATE_ORGANIZATION}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
