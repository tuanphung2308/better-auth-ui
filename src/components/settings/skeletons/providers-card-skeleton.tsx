import { useContext } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import { Card, CardContent, CardHeader } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"

export function ProvidersCardSkeleton({ className }: { className?: string }) {
    const { providers } = useContext(AuthUIContext)

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="space-y-2">
                <Skeleton className="h-5 md:h-6 w-24" />
                <Skeleton className="h-4 w-80" />
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                {providers?.map((provider) => (
                    <Card key={provider} className="flex items-center gap-3 px-4 py-3">
                        <Skeleton className="size-4 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-14 ms-auto" />
                    </Card>
                ))}
            </CardContent>
        </Card>
    )
}
