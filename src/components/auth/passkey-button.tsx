import { KeyIcon } from "lucide-react"
import { useFormStatus } from "react-dom"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

import type { authLocalization } from "./auth-card"

export function PasskeyButton({
    className,
    isLoading,
    localization,
}: {
    className?: string,
    isLoading?: boolean,
    localization: Partial<typeof authLocalization>,
}) {
    const { pending } = useFormStatus()

    return (
        <Button
            className={cn("w-full", className)}
            disabled={pending || isLoading}
            formNoValidate
            name="passkey"
            value="true"
            variant="secondary"
        >
            <KeyIcon />
            {localization.signInWith}
            {" "}
            {localization.passkey}
        </Button>
    )
}