"use client"

import { useContext, useState } from "react"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { SettingsCard } from "../shared/settings-card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { TwoFactorPasswordDialog } from "./two-factor-password-dialog"

export interface TwoFactorCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

export function TwoFactorCard({ className, classNames, localization }: TwoFactorCardProps) {
    const {
        localization: contextLocalization,
        hooks: { useSession }
    } = useContext(AuthUIContext)

    const [showPasswordDialog, setShowPasswordDialog] = useState(false)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData, isPending } = useSession()
    const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled

    return (
        <div>
            <SettingsCard
                className={className}
                classNames={classNames}
                actionLabel={
                    isTwoFactorEnabled
                        ? localization.disableTwoFactor
                        : localization.enableTwoFactor
                }
                description={localization.twoFactorCardDescription}
                instructions={
                    isTwoFactorEnabled
                        ? localization.twoFactorDisableInstructions
                        : localization.twoFactorEnableInstructions
                }
                isPending={isPending}
                title={localization.twoFactor}
                action={() => setShowPasswordDialog(true)}
            />

            <TwoFactorPasswordDialog
                classNames={classNames}
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
                isTwoFactorEnabled={!!isTwoFactorEnabled}
            />
        </div>
    )
}
