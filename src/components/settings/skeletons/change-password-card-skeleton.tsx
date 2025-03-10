import { cn } from "../../../lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import type { SettingsCardClassNames } from "../settings-card"

export function ChangePasswordCardSkeleton({
    className,
    classNames
}: {
    className?: string
    classNames?: SettingsCardClassNames
}) {
    return (
        <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
            <CardHeader className={cn("space-y-2", classNames?.header)}>
                <Skeleton className={cn("h-5 md:h-6 w-40", classNames?.skeleton)} />
                <Skeleton className={cn("h-4 w-3/4", classNames?.skeleton)} />
            </CardHeader>

            <CardContent className={cn("grid gap-3", classNames?.content)}>
                <div className="space-y-2">
                    <Skeleton className={cn("h-4 w-32", classNames?.skeleton)} />
                    <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                </div>

                <div className="space-y-2">
                    <Skeleton className={cn("h-4 w-24", classNames?.skeleton)} />
                    <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                </div>
            </CardContent>

            <CardFooter
                className={cn(
                    "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between",
                    classNames?.footer
                )}
            >
                <Skeleton className={cn("h-4 w-60", classNames?.skeleton)} />
                <Skeleton className={cn("h-8 w-14 md:ms-auto", classNames?.skeleton)} />
            </CardFooter>
        </Card>
    )
}
