import { LockIcon, MailIcon } from "lucide-react"
import { useContext } from "react"
import { useFormStatus } from "react-dom"

import { AuthUIContext, type AuthView } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

import type { authLocalization } from "./auth-card"

export function MagicLinkButton({
    className,
    isLoading,
    localization,
    view
}: {
    className?: string,
    isLoading?: boolean,
    localization: Partial<typeof authLocalization>,
    view: AuthView
}) {
    const { pending } = useFormStatus()
    const { viewPaths, LinkComponent } = useContext(AuthUIContext)

    return (
        <LinkComponent
            className={cn((pending || isLoading) && "pointer-events-none cursor-default")}
            href={view == "magicLink" ? viewPaths.signIn : viewPaths.magicLink}
            to={view == "magicLink" ? viewPaths.signIn : viewPaths.magicLink}
        >
            <Button
                className={cn("w-full", className)}
                disabled={pending || isLoading}
                variant="secondary"
            >
                {view == "magicLink"
                    ? <LockIcon />
                    : <MailIcon />
                }

                {localization.signInWith}
                {" "}

                {view == "magicLink"
                    ? localization.password
                    : localization.magicLink
                }
            </Button>
        </LinkComponent>
    )
}