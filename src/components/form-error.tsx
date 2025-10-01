'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';
import { AlertCircle } from 'lucide-react';
import { useFormState } from 'react-hook-form';
import { cn } from '../lib/utils';
import type { AuthFormClassNames } from './auth/auth-form';

export interface FormErrorProps {
  title?: string;
  classNames?: AuthFormClassNames;
}

export function FormError({ title, classNames }: FormErrorProps) {
  const { errors } = useFormState();

  if (!errors.root?.message) return null;

  return (
    <Alert className={cn(classNames?.error)} variant="destructive">
      <AlertCircle className="self-center" />
      <AlertTitle>{title || 'Error'}</AlertTitle>
      <AlertDescription>{errors.root.message}</AlertDescription>
    </Alert>
  );
}
