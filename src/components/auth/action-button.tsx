import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

import type { authLocalization } from "./auth-card"

export function ActionButton({
    className,
    localization,
    authView
}: {
    className?: string,
    localization: Partial<typeof authLocalization>,
    authView: string
}) {
    const { pending } = useFormStatus()

    return (
        <Button
            className={cn(
                "w-full",
                className
            )}
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="animate-spin" />
            ) : (
                localization[authView + "Action" as keyof typeof localization]
            )}
        </Button>
    )
}