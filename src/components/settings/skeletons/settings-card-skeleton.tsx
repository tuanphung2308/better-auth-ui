import { cn } from "../../../lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import type { SettingsCardClassNames } from "../settings-card"

export function SettingsCardSkeleton({
    className,
    classNames
}: {
    className?: string
    classNames?: SettingsCardClassNames
}) {
    return (
        <Card className={cn("w-full pb-0", className, classNames?.base)}>
            <CardHeader className={cn("mt-1 gap-3.5", classNames?.header)}>
                <Skeleton className={cn("h-5 w-1/3 md:h-5.5", classNames?.skeleton)} />
                <Skeleton className={cn("h-3 w-2/3 md:h-3.5", classNames?.skeleton)} />
            </CardHeader>

            <CardContent className={cn(classNames?.content)}>
                <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
            </CardContent>

            <CardFooter
                className={cn(
                    "!py-4 flex flex-col justify-between gap-4 border-t bg-muted md:flex-row dark:bg-transparent",
                    classNames?.footer
                )}
            >
                <Skeleton className={cn("h-4 w-48 md:w-56", classNames?.skeleton)} />
                <Skeleton className={cn("h-8 w-14 md:ms-auto", classNames?.skeleton)} />
            </CardFooter>
        </Card>
    )
}
