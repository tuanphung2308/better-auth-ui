import { useContext } from "react"

import { useOnSuccessTransition } from "../../hooks/use-success-transition"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import type { AuthCardClassNames } from "./auth-card"
import {GoogleIcon} from "../provider-icons";

interface OneTapButtonProps {
    classNames?: AuthCardClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    setIsSubmitting?: (isSubmitting: boolean) => void
}

export function OneTapButton({
    classNames,
    isSubmitting,
    localization,
    redirectTo,
    setIsSubmitting
}: OneTapButtonProps) {
    const { authClient, localization: contextLocalization, toast } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { onSuccess } = useOnSuccessTransition({ redirectTo })

    const signInOneTap = async () => {
        setIsSubmitting?.(true)

        try {
            await (authClient as AuthClient).oneTap({
                fetchOptions: {
                    throw: true,
                    onSuccess: () => {
                        onSuccess()
                    }
                }
            })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })

            setIsSubmitting?.(false)
        }
    }

    return (
        <Button
            className={cn("w-full", classNames?.form?.button, classNames?.form?.secondaryButton)}
            disabled={isSubmitting}
            formNoValidate
            name="one-tap"
            value="true"
            variant="secondary"
            onClick={signInOneTap}
        >
            <GoogleIcon />
            {localization.signInWith} {localization.oneTap}
        </Button>
    )
}
