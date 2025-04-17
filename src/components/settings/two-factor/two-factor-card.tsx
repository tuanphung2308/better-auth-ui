"use client"

import { useContext, useState } from "react"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import type { SettingsCardClassNames } from "../settings-card"
import { SettingsCard } from "../settings-card"
import { TwoFactorPasswordDialog } from "./two-factor-password-dialog"

/**
 * Props for the TwoFactorCard component
 * Allows customization of appearance and behavior
 */
export interface TwoFactorCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

/**
 * TwoFactorCard component for enabling/disabling two-factor authentication
 * Simple shell wrapper around SettingsCard
 */
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
                isPending={isPending}
                description={localization.twoFactorCardDescription}
                title={localization.twoFactor}
                actionLabel={isTwoFactorEnabled ? localization.disable : localization.enable}
                instructions={localization.twoFactorInstructions}
                formAction={() => setShowPasswordDialog(true)}
            />

            <TwoFactorPasswordDialog
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
                isTwoFactorEnabled={!!isTwoFactorEnabled}
            />
        </div>
    )
}
