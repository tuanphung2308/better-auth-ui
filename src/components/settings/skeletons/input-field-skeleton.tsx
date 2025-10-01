'use client';

import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '../../../lib/utils';
import type { SettingsCardClassNames } from '../shared/settings-card';

export function InputFieldSkeleton({
  classNames,
}: {
  classNames?: SettingsCardClassNames;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className={cn('h-4 w-32', classNames?.skeleton)} />
      <Skeleton className={cn('h-9 w-full', classNames?.skeleton)} />
    </div>
  );
}
