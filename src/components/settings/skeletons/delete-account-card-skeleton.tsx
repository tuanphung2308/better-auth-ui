import { cn } from "../../../lib/utils"
import { Card, CardFooter, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import type { SettingsCardClassNames } from "../settings-card"

export function DeleteAccountCardSkeleton({
    className,
    classNames
}: {
    className?: string
    classNames?: SettingsCardClassNames
}) {
    return (
        <Card
            className={cn(
                "w-full overflow-hidden border-destructive/40",
                className,
                classNames?.base
            )}
        >
            <CardHeader className={cn("space-y-2", classNames?.header)}>
                <Skeleton className={cn("h-5 md:h-6 w-32", classNames?.skeleton)} />
                <Skeleton className={cn("h-4 w-11/12", classNames?.skeleton)} />
                <Skeleton className={cn("h-4 w-3/4 -mt-2", classNames?.skeleton)} />
            </CardHeader>

            <CardFooter
                className={cn(
                    "border-t border-destructive/30 bg-destructive/10 py-4 md:py-3 flex",
                    classNames?.footer
                )}
            >
                <Skeleton
                    className={cn("h-8 w-32 mx-auto md:ms-auto md:mx-0", classNames?.skeleton)}
                />
            </CardFooter>
        </Card>
    )
}
