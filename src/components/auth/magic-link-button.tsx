import { LockIcon, MailIcon } from "lucide-react"
import { useContext } from "react"
import { useFormStatus } from "react-dom"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

export function MagicLinkButton({
    className,
    isLoading,
    localization,
    view
}: {
    className?: string
    isLoading?: boolean
    localization: Partial<AuthLocalization>
    view: AuthView
}) {
    const { pending } = useFormStatus()
    const { viewPaths, navigate } = useContext(AuthUIContext)

    return (
        <Button
            className={cn("w-full", className)}
            disabled={pending || isLoading}
            type="button"
            variant="secondary"
            onClick={() => {
                navigate(
                    view === "magicLink"
                        ? viewPaths.signIn
                        : viewPaths.magicLink
                )
            }}
        >
            {view === "magicLink" ? <LockIcon /> : <MailIcon />}
            {localization.signInWith}{" "}
            {view === "magicLink"
                ? localization.password
                : localization.magicLink}
        </Button>
    )
}
