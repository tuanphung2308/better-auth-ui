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
        <Card className={cn("w-full pb-0", className, classNames?.base)}>
            <CardHeader className={cn("mt-1 gap-3.5", classNames?.header)}>
                <Skeleton className={cn("h-5 w-40 max-w-full md:h-5.5", classNames?.skeleton)} />
                <Skeleton className={cn("h-3 w-64 max-w-full md:h-3.5", classNames?.skeleton)} />
            </CardHeader>

            <CardContent className={cn("-mt-0.5 grid gap-5.5", classNames?.content)}>
                <div className="flex flex-col gap-2">
                    <Skeleton className={cn("h-4 w-32", classNames?.skeleton)} />
                    <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                </div>

                <div className="flex flex-col gap-2">
                    <Skeleton className={cn("h-4 w-24", classNames?.skeleton)} />
                    <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                </div>
            </CardContent>

            <CardFooter
                className={cn(
                    "flex flex-col justify-between gap-5 rounded-b-xl border-t bg-muted pb-6 md:flex-row dark:bg-transparent",
                    classNames?.footer
                )}
            >
                <Skeleton className={cn("h-3 w-60 md:h-3.5", classNames?.skeleton)} />
                <Skeleton className={cn("h-8 w-14 md:ms-auto", classNames?.skeleton)} />
            </CardFooter>
        </Card>
    )
}
