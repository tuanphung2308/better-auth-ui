'use client';

import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useFormState } from 'react-hook-form';
import { cn } from '../../../lib/utils';
import type { SettingsCardClassNames } from './settings-card';

interface SettingsActionButtonProps extends ComponentProps<typeof Button> {
  classNames?: SettingsCardClassNames;
  actionLabel: ReactNode;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export function SettingsActionButton({
  classNames,
  actionLabel,
  disabled,
  isSubmitting,
  variant,
  onClick,
  ...props
}: SettingsActionButtonProps) {
  if (!onClick) {
    const formState = useFormState();
    isSubmitting = formState.isSubmitting;
  }

  return (
    <Button
      className={cn(
        'md:ms-auto',
        classNames?.button,
        variant === 'default' && classNames?.primaryButton,
        variant === 'destructive' && classNames?.destructiveButton
      )}
      disabled={isSubmitting || disabled}
      onClick={onClick}
      size="sm"
      type={onClick ? 'button' : 'submit'}
      variant={variant}
      {...props}
    >
      {isSubmitting && <Loader2 className="animate-spin" />}
      {actionLabel}
    </Button>
  );
}
