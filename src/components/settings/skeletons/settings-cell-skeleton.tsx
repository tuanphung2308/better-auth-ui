"use client"

import { cn } from "../../../lib/utils"
import { Card } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import type { SettingsCardClassNames } from "../settings-card"

export function SettingsCellSkeleton({ classNames }: { classNames?: SettingsCardClassNames }) {
    return (
        <Card className={cn("flex-row p-4", classNames?.cell)}>
            <div className="flex items-center gap-2">
                <Skeleton className={cn("size-8 rounded-full", classNames?.skeleton)} />

                <div>
                    <Skeleton className={cn("h-4 w-24", classNames?.skeleton)} />
                    <Skeleton className={cn("mt-1 h-3 w-36", classNames?.skeleton)} />
                </div>
            </div>

            <Skeleton className={cn("ms-auto size-9", classNames?.skeleton)} />
        </Card>
    )
}
