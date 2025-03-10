import { useContext } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import { Card, CardContent, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import type { SettingsCardClassNames } from "../settings-card"

export function ProvidersCardSkeleton({
    className,
    classNames
}: { className?: string; classNames?: SettingsCardClassNames }) {
    const { providers } = useContext(AuthUIContext)

    return (
        <Card className={cn("w-full", classNames?.base, className)}>
            <CardHeader className={cn("space-y-2", classNames?.header)}>
                <Skeleton className={cn("h-5 md:h-6 w-24", classNames?.skeleton)} />
                <Skeleton className={cn("h-4 w-72", classNames?.skeleton)} />
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-3", classNames?.content)}>
                {providers ||
                    [""].map((provider) => (
                        <Card
                            key={provider}
                            className={cn("flex items-center gap-3 px-4 py-3", classNames?.cell)}
                        >
                            <Skeleton className={cn("size-4 rounded-full", classNames?.skeleton)} />
                            <Skeleton className={cn("h-4 w-24", classNames?.skeleton)} />
                            <Skeleton className={cn("h-8 w-14 ms-auto", classNames?.skeleton)} />
                        </Card>
                    ))}
            </CardContent>
        </Card>
    )
}
