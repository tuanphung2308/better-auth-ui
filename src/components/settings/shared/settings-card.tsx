'use client';

import { Card } from '@workspace/ui/components/card';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import type { AuthLocalization } from '../../../localization/auth-localization';
import type { UserAvatarClassNames } from '../../user-avatar';
import { SettingsCardFooter } from './settings-card-footer';
import { SettingsCardHeader } from './settings-card-header';

export type SettingsCardClassNames = {
  base?: string;
  avatar?: UserAvatarClassNames;
  button?: string;
  cell?: string;
  checkbox?: string;
  destructiveButton?: string;
  content?: string;
  description?: string;
  dialog?: {
    content?: string;
    footer?: string;
    header?: string;
  };
  error?: string;
  footer?: string;
  header?: string;
  icon?: string;
  input?: string;
  instructions?: string;
  label?: string;
  primaryButton?: string;
  secondaryButton?: string;
  outlineButton?: string;
  skeleton?: string;
  title?: string;
};

export interface SettingsCardProps
  extends Omit<ComponentProps<typeof Card>, 'title'> {
  children?: ReactNode;
  className?: string;
  classNames?: SettingsCardClassNames;
  title?: ReactNode;
  description?: ReactNode;
  instructions?: ReactNode;
  actionLabel?: ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  isPending?: boolean;
  optimistic?: boolean;
  variant?: 'default' | 'destructive';
  localization?: AuthLocalization;
  action?: () => Promise<unknown> | unknown;
}

export function SettingsCard({
  children,
  className,
  classNames,
  title,
  description,
  instructions,
  actionLabel,
  disabled,
  isPending,
  isSubmitting,
  optimistic,
  variant,
  action,
  ...props
}: SettingsCardProps) {
  return (
    <Card
      className={cn(
        'w-full pb-0 text-start',
        variant === 'destructive' && 'border-destructive/40',
        className,
        classNames?.base
      )}
      {...props}
    >
      <SettingsCardHeader
        classNames={classNames}
        description={description}
        isPending={isPending}
        title={title}
      />

      {children}

      <SettingsCardFooter
        action={action}
        actionLabel={actionLabel}
        classNames={classNames}
        disabled={disabled}
        instructions={instructions}
        isPending={isPending}
        isSubmitting={isSubmitting}
        optimistic={optimistic}
        variant={variant}
      />
    </Card>
  );
}
