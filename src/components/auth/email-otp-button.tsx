import { LockIcon, MailIcon } from "lucide-react"
import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import type { AuthLocalization } from "../../lib/localization/auth-localization"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import type { AuthCardClassNames } from "./auth-card"

interface EmailOTPButtonProps {
    classNames?: AuthCardClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    view: AuthView
}

export function EmailOTPButton({
    classNames,
    isSubmitting,
    localization,
    view
}: EmailOTPButtonProps) {
    const { viewPaths, navigate, basePath } = useContext(AuthUIContext)

    return (
        <Button
            className={cn("w-full", classNames?.form?.button, classNames?.form?.secondaryButton)}
            disabled={isSubmitting}
            type="button"
            variant="secondary"
            onClick={() =>
                navigate(
                    `${basePath}/${view === "emailOTP" ? viewPaths.signIn : viewPaths.emailOTP}${window.location.search}`
                )
            }
        >
            {view === "emailOTP" ? (
                <LockIcon className={classNames?.form?.icon} />
            ) : (
                <MailIcon className={classNames?.form?.icon} />
            )}
            {localization.signInWith}{" "}
            {view === "emailOTP" ? localization.password : localization.emailOTP}
        </Button>
    )
}
