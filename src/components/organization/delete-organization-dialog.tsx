'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
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
import { Input } from '@workspace/ui/components/input';
import type { Organization } from 'better-auth/plugins/organization';
import { Loader2 } from 'lucide-react';
import { type ComponentProps, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';
import { OrganizationCellView } from './organization-cell-view';

export interface DeleteOrganizationDialogProps
  extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  organization: Organization;
}

export function DeleteOrganizationDialog({
  classNames,
  localization: localizationProp,
  onOpenChange,
  organization,
  ...props
}: DeleteOrganizationDialogProps) {
  const {
    authClient,
    account: accountOptions,
    hooks: { useListOrganizations },
    localization: contextLocalization,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { refetch: refetchOrganizations } = useListOrganizations();

  const formSchema = z.object({
    slug: z
      .string()
      .min(1, { message: localization.SLUG_REQUIRED! })
      .refine((val) => val === organization.slug, {
        message: localization.SLUG_DOES_NOT_MATCH!,
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: '',
    },
  });

  const { isSubmitting } = form.formState;

  const deleteOrganization = async () => {
    try {
      await authClient.organization.delete({
        organizationId: organization.id,
        fetchOptions: { throw: true },
      });

      await refetchOrganizations?.();

      toast({
        variant: 'success',
        message: localization.DELETE_ORGANIZATION_SUCCESS!,
      });

      navigate(
        `${accountOptions?.basePath}/${accountOptions?.viewPaths.ORGANIZATIONS}`
      );

      onOpenChange?.(false);
    } catch (error) {
      toast({
        variant: 'error',
        message: getLocalizedError({ error, localization }),
      });
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn('sm:max-w-md', classNames?.dialog?.content)}>
        <DialogHeader className={classNames?.dialog?.header}>
          <DialogTitle className={cn('text-lg md:text-xl', classNames?.title)}>
            {localization?.DELETE_ORGANIZATION}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization?.DELETE_ORGANIZATION_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Card className={cn('my-2 flex-row p-4', classNames?.cell)}>
          <OrganizationCellView
            localization={localization}
            organization={organization}
          />
        </Card>

        <Form {...form}>
          <form
            className="grid gap-6"
            onSubmit={form.handleSubmit(deleteOrganization)}
          >
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={classNames?.label}>
                    {localization?.DELETE_ORGANIZATION_INSTRUCTIONS}

                    <span className="font-bold">{organization.slug}</span>
                  </FormLabel>

                  <FormControl>
                    <Input
                      autoComplete="off"
                      className={classNames?.input}
                      placeholder={organization.slug}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className={classNames?.error} />
                </FormItem>
              )}
            />

            <DialogFooter className={classNames?.dialog?.footer}>
              <Button
                className={cn(classNames?.button, classNames?.secondaryButton)}
                onClick={() => onOpenChange?.(false)}
                type="button"
                variant="secondary"
              >
                {localization.CANCEL}
              </Button>

              <Button
                className={cn(
                  classNames?.button,
                  classNames?.destructiveButton
                )}
                disabled={isSubmitting}
                type="submit"
                variant="destructive"
              >
                {isSubmitting && <Loader2 className="animate-spin" />}

                {localization?.DELETE_ORGANIZATION}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
