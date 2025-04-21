import { LockIcon, MailIcon } from "lucide-react"
import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import type { AuthCardClassNames } from "./auth-card"

interface MagicLinkButtonProps {
    classNames?: AuthCardClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    view: AuthView
}

export function MagicLinkButton({
    classNames,
    isSubmitting,
    localization,
    view
}: MagicLinkButtonProps) {
    const { viewPaths, navigate } = useContext(AuthUIContext)

    return (
        <Button
            className={cn("w-full", classNames?.form?.button, classNames?.form?.secondaryButton)}
            disabled={isSubmitting}
            type="button"
            variant="secondary"
            onClick={() =>
                navigate(
                    `${view === "magicLink" ? viewPaths.signIn : viewPaths.magicLink}${window.location.search}`
                )
            }
        >
            {view === "magicLink" ? (
                <LockIcon className={classNames?.form?.icon} />
            ) : (
                <MailIcon className={classNames?.form?.icon} />
            )}
            {localization.signInWith}{" "}
            {view === "magicLink" ? localization.password : localization.magicLink}
        </Button>
    )
}
