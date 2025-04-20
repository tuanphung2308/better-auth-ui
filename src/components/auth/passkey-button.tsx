import { KeyIcon } from "lucide-react"

import { useContext } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import type { AuthCardClassNames } from "./auth-card"
import { useOnSuccessTransition } from "./forms/use-success-transition"

interface PasskeyButtonProps {
    classNames?: AuthCardClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    setIsSubmitting?: (isSubmitting: boolean) => void
}

export function PasskeyButton({
    classNames,
    isSubmitting,
    localization,
    redirectTo,
    setIsSubmitting
}: PasskeyButtonProps) {
    const { authClient, toast, localization: contextLocalization } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }
    const { onSuccess } = useOnSuccessTransition({ redirectTo })

    const signInPassKey = async () => {
        setIsSubmitting?.(true)

        try {
            const response = await (authClient as AuthClient).signIn.passkey({
                fetchOptions: { throw: true }
            })

            if (response?.error) {
                toast({
                    variant: "error",
                    message: getLocalizedError({ error: response.error, localization })
                })

                setIsSubmitting?.(false)
            } else {
                onSuccess()
            }
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
            name="passkey"
            value="true"
            variant="secondary"
            onClick={signInPassKey}
        >
            <KeyIcon />
            {localization.signInWith} {localization.passkey}
        </Button>
    )
}
