import { cn } from "../../lib/utils"
import { Card, CardFooter, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

import type { SettingsCardClassNames } from "./settings-card"

export function DeleteAccountCardSkeleton({
    className,
    classNames,
}: {
    className?: string
    classNames?: SettingsCardClassNames
}) {
    return (
        <Card className={cn("w-full max-w-lg overflow-hidden border-destructive/60", className, classNames?.base)}>
            <CardHeader className={cn("space-y-2", classNames?.header)}>
                <Skeleton className="h-5 md:h-6 w-32" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4 -mt-2" />
            </CardHeader>

            <CardFooter
                className={cn(
                    "border-t border-destructive/40 bg-destructive/10 py-4 md:py-3 flex",
                    classNames?.footer
                )}
            >
                <Skeleton className="h-8 w-32 mx-auto md:ms-auto md:mx-0" />
            </CardFooter>
        </Card>
    )
}