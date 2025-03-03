import { cn } from "../../../lib/utils"
import { Card, CardFooter, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import type { SettingsCardClassNames } from "../settings-card"

export function UpdateAvatarCardSkeleton({
    className,
    classNames
}: {
    className?: string
    classNames?: SettingsCardClassNames
}) {
    return (
        <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
            <div className="flex justify-between">
                <CardHeader className={cn("space-y-2 grow", classNames?.header)}>
                    <Skeleton className="h-5 md:h-6 w-24 mt-0.5 md:mt-0" />

                    <div className="flex flex-col space-y-1.5">
                        <Skeleton className="h-3 md:h-4 w-5/6" />
                        <Skeleton className="md:hidden h-3 w-2/3" />
                    </div>
                </CardHeader>

                <div className="me-6 my-5">
                    <Skeleton className="size-18 rounded-full" />
                </div>
            </div>

            <CardFooter
                className={cn(
                    "border-t bg-muted dark:bg-transparent py-4",
                    classNames?.footer
                )}
            >
                <Skeleton className="h-4 md:my-0.5 w-72 mx-auto md:mx-0" />
            </CardFooter>
        </Card>
    )
}