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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import type { Organization } from 'better-auth/plugins/organization';
import { Loader2 } from 'lucide-react';
import { type ComponentProps, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { AuthUIContext } from '../../lib/auth-ui-provider';
import { cn, getLocalizedError } from '../../lib/utils';
import type { AuthLocalization } from '../../localization/auth-localization';
import type { SettingsCardClassNames } from '../settings/shared/settings-card';

export interface InviteMemberDialogProps extends ComponentProps<typeof Dialog> {
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
  organization: Organization;
}

export function InviteMemberDialog({
  classNames,
  localization: localizationProp,
  onOpenChange,
  organization,
  ...props
}: InviteMemberDialogProps) {
  const {
    authClient,
    hooks: { useListInvitations, useListMembers, useSession },
    localization: contextLocalization,
    toast,
    organization: organizationOptions,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data } = useListMembers({
    query: { organizationId: organization.id },
  });

  const { refetch } = useListInvitations({
    query: { organizationId: organization.id },
  });

  const members = data?.members;

  const { data: sessionData } = useSession();
  const membership = members?.find((m) => m.userId === sessionData?.user.id);

  const builtInRoles = [
    { role: 'owner', label: localization.OWNER },
    { role: 'admin', label: localization.ADMIN },
    { role: 'member', label: localization.MEMBER },
  ] as const;

  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const availableRoles = roles.filter(
    (role) => membership?.role === 'owner' || role.role !== 'owner'
  );

  const formSchema = z.object({
    email: z.string().min(1, { message: localization.EMAIL_REQUIRED }).email({
      message: localization.INVALID_EMAIL,
    }),
    role: z.string().min(1, {
      message: `${localization.ROLE} ${localization.IS_REQUIRED}`,
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ email, role }: z.infer<typeof formSchema>) {
    try {
      await authClient.organization.inviteMember({
        email,
        role: role as (typeof builtInRoles)[number]['role'],
        organizationId: organization.id,
        fetchOptions: { throw: true },
      });

      await refetch?.();

      onOpenChange?.(false);
      form.reset();

      toast({
        variant: 'success',
        message:
          localization.SEND_INVITATION_SUCCESS ||
          'Invitation sent successfully',
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
            {localization.INVITE_MEMBER}
          </DialogTitle>

          <DialogDescription
            className={cn('text-xs md:text-sm', classNames?.description)}
          >
            {localization.INVITE_MEMBER_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={classNames?.label}>
                    {localization.EMAIL}
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder={localization.EMAIL_PLACEHOLDER}
                      type="email"
                      {...field}
                      className={classNames?.input}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={classNames?.label}>
                    {localization.ROLE}
                  </FormLabel>

                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.role} value={role.role}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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

                {localization.SEND_INVITATION}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
