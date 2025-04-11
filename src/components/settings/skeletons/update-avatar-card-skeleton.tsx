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
        <Card className={cn("w-full pb-0", className, classNames?.base)}>
            <div className="flex justify-between">
                <CardHeader className={cn("mt-1 grow space-y-2 self-start", classNames?.header)}>
                    <Skeleton
                        className={cn("mt-0.5 h-5 w-24 md:mt-0 md:h-5.5", classNames?.skeleton)}
                    />

                    <div className="flex flex-col space-y-1.5">
                        <Skeleton className={cn("h-3 w-5/6 md:h-3.5", classNames?.skeleton)} />
                        <Skeleton className={cn("h-3 w-2/3 md:hidden", classNames?.skeleton)} />
                    </div>
                </CardHeader>

                <div className="me-6">
                    <Skeleton
                        className={cn(
                            "size-20 rounded-full",
                            classNames?.avatar?.base,
                            classNames?.skeleton
                        )}
                    />
                </div>
            </div>

            <CardFooter
                className={cn(
                    "!py-4 md:!py-5 rounded-b-xl border-t bg-muted dark:bg-transparent",
                    classNames?.footer
                )}
            >
                <Skeleton
                    className={cn(
                        "mx-auto h-4 w-64 md:mx-0 md:my-0.5 md:w-80",
                        classNames?.skeleton
                    )}
                />
            </CardFooter>
        </Card>
    )
}
