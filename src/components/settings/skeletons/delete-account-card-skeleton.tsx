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
        <Card className={cn("w-full border-destructive/40 pb-0", className, classNames?.base)}>
            <CardHeader className={cn("mt-1 gap-3.5", classNames?.header)}>
                <Skeleton className={cn("h-5 w-32 md:h-5.5", classNames?.skeleton)} />
                <Skeleton className={cn("md:3.5 h-3 w-11/12", classNames?.skeleton)} />
                <Skeleton className={cn("-mt-1.5 md:3.5 mb-0.5 h-3 w-3/4", classNames?.skeleton)} />
            </CardHeader>

            <CardFooter
                className={cn(
                    "!py-4 flex rounded-b-xl border-destructive/30 border-t bg-destructive/10",
                    classNames?.footer
                )}
            >
                <Skeleton
                    className={cn("mx-auto h-8 w-32 md:mx-0 md:ms-auto", classNames?.skeleton)}
                />
            </CardFooter>
        </Card>
    )
}
