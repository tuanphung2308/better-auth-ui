import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import type { AuthLocalization } from "../../lib/auth-localization"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

export function ActionButton({
    className,
    isLoading,
    localization,
    authView
}: {
    className?: string,
    isLoading?: boolean,
    localization: Partial<AuthLocalization>,
    authView: string
}) {
    const { pending } = useFormStatus()

    return (
        <Button
            className={cn("w-full", className)}
            disabled={pending || isLoading}
        >
            {(pending || isLoading) ? (
                <Loader2 className="animate-spin" />
            ) : (
                localization[authView + "Action" as keyof typeof localization]
            )}
        </Button>
    )
}