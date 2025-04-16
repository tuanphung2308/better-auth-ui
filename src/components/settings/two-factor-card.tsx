"use client"

import { useContext } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { SettingsCardClassNames } from "./settings-card"
import { SettingsCard } from "./settings-card"

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
    const { localization: contextLocalization } = useContext(AuthUIContext)

    // Merge localizations with context providing defaults
    localization = { ...contextLocalization, ...localization }

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            description={localization.twoFactorDescription}
            title={localization.twoFactor}
            actionLabel={localization.enable}
            instructions={localization.twoFactorInstructions}
        />
    )
}
