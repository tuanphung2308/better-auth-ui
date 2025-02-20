import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

import { cn } from "../../lib/utils"
import type { authCardLocalization } from "../new-auth-card"
import { Button } from "../ui/button"

export function ActionButton({
    className,
    localization,
    authView
}: {
    className?: string,
    localization: Partial<typeof authCardLocalization>,
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
            name="action"
            type="submit"
            value="HAHAHAHA"
        >
            {pending ? (
                <Loader2 className="animate-spin" />
            ) : (
                localization[authView + "Action" as keyof typeof localization]
            )}
        </Button>
    )
}